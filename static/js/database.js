// IndexedDB Database Manager for WikiLearn
class WikiLearnDB {
    constructor() {
        this.dbName = 'WikiLearnDB';
        this.version = 1;
        this.db = null;
        this.userId = this.getUserId();
    }

    // Generate or retrieve unique browser-based user ID
    getUserId() {
        let userId = localStorage.getItem('wikilearn_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('wikilearn_user_id', userId);
        }
        return userId;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // User settings store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('created', 'created', { unique: false });
                }

                // Usage tracking store
                if (!db.objectStoreNames.contains('usage')) {
                    const usageStore = db.createObjectStore('usage', { keyPath: 'id', autoIncrement: true });
                    usageStore.createIndex('userId', 'userId', { unique: false });
                    usageStore.createIndex('type', 'type', { unique: false });
                    usageStore.createIndex('date', 'date', { unique: false });
                }

                // History store
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('userId', 'userId', { unique: false });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    historyStore.createIndex('articleTitle', 'articleTitle', { unique: false });
                }

                // Generated content store  
                if (!db.objectStoreNames.contains('content')) {
                    const contentStore = db.createObjectStore('content', { keyPath: 'id', autoIncrement: true });
                    contentStore.createIndex('userId', 'userId', { unique: false });
                    contentStore.createIndex('articleTitle', 'articleTitle', { unique: false });
                    contentStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Get or create user profile
    async getUser() {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(this.userId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    // Create new user
                    this.createUser().then(resolve).catch(reject);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Create new user profile
    async createUser() {
        const user = {
            id: this.userId,
            isPremium: false,
            created: Date.now(),
            settings: {
                englishLevel: 'intermediate',
                notifications: true
            }
        };

        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.add(user);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    // Check usage limits
    async checkUsageLimit(type) {
        const user = await this.getUser();
        if (user.isPremium) return { allowed: true, remaining: -1 }; // Unlimited for premium

        const today = new Date().toDateString();
        const transaction = this.db.transaction(['usage'], 'readonly');
        const store = transaction.objectStore('usage');
        const userIndex = store.index('userId');
        const request = userIndex.getAll(this.userId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const todayUsage = request.result.filter(usage => 
                    new Date(usage.date).toDateString() === today && usage.type === type
                );
                
                const limit = type === 'summary' ? 1 : type === 'lesson' ? 1 : 0;
                const used = todayUsage.length;
                const remaining = Math.max(0, limit - used);
                
                resolve({
                    allowed: remaining > 0,
                    remaining: remaining,
                    used: used,
                    limit: limit
                });
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Record usage
    async recordUsage(type, articleTitle, additionalData = {}) {
        const usage = {
            userId: this.userId,
            type: type, // 'summary' or 'lesson'
            articleTitle: articleTitle,
            date: Date.now(),
            ...additionalData
        };

        const transaction = this.db.transaction(['usage'], 'readwrite');
        const store = transaction.objectStore('usage');
        const request = store.add(usage);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(usage);
            request.onerror = () => reject(request.error);
        });
    }

    // Add to history
    async addToHistory(articleTitle, articleUrl, type = 'view') {
        const historyItem = {
            userId: this.userId,
            articleTitle: articleTitle,
            articleUrl: articleUrl,
            type: type, // 'view', 'summary', 'lesson'
            timestamp: Date.now()
        };

        const transaction = this.db.transaction(['history'], 'readwrite');
        const store = transaction.objectStore('history');
        const request = store.add(historyItem);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(historyItem);
            request.onerror = () => reject(request.error);
        });
    }

    // Get user history
    async getHistory(limit = 50) {
        const transaction = this.db.transaction(['history'], 'readonly');
        const store = transaction.objectStore('history');
        const userIndex = store.index('userId');
        const request = userIndex.getAll(this.userId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const history = request.result
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, limit);
                resolve(history);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Save generated content
    async saveContent(articleTitle, type, content, englishLevel) {
        const contentItem = {
            userId: this.userId,
            articleTitle: articleTitle,
            type: type, // 'summary' or 'lesson'
            content: content,
            englishLevel: englishLevel,
            timestamp: Date.now()
        };

        const transaction = this.db.transaction(['content'], 'readwrite');
        const store = transaction.objectStore('content');
        const request = store.add(contentItem);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(contentItem);
            request.onerror = () => reject(request.error);
        });
    }

    // Upgrade to premium
    async upgradeToPremium() {
        const user = await this.getUser();
        user.isPremium = true;
        user.upgradeDate = Date.now();

        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.put(user);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    // Get usage statistics
    async getUsageStats() {
        const user = await this.getUser();
        const today = new Date().toDateString();
        
        const transaction = this.db.transaction(['usage'], 'readonly');
        const store = transaction.objectStore('usage');
        const userIndex = store.index('userId');
        const request = userIndex.getAll(this.userId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const allUsage = request.result;
                const todayUsage = allUsage.filter(usage => 
                    new Date(usage.date).toDateString() === today
                );

                const summariesUsed = todayUsage.filter(u => u.type === 'summary').length;
                const lessonsUsed = todayUsage.filter(u => u.type === 'lesson').length;

                resolve({
                    isPremium: user.isPremium,
                    summariesUsed: summariesUsed,
                    summariesRemaining: user.isPremium ? -1 : Math.max(0, 1 - summariesUsed),
                    lessonsUsed: lessonsUsed, 
                    lessonsRemaining: user.isPremium ? -1 : Math.max(0, 1 - lessonsUsed),
                    totalUsage: allUsage.length
                });
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Initialize global database instance
window.wikiDB = new WikiLearnDB();