// Bottom Navigation Manager
class BottomNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index') return 'home';
        if (path.startsWith('/categories') || path.startsWith('/subcategories')) return 'categories';
        if (path === '/history') return 'history';
        if (path === '/account') return 'account';
        return 'home';
    }

    init() {
        this.createNavigation();
        this.setActiveTab();
        this.updateUsageIndicators();
    }

    createNavigation() {
        // Remove existing navigation if any
        const existing = document.querySelector('.bottom-navigation');
        if (existing) existing.remove();

        const nav = document.createElement('nav');
        nav.className = 'bottom-navigation';
        nav.innerHTML = `
            <div class="nav-item ${this.currentPage === 'home' ? 'active' : ''}" data-page="home">
                <a href="/">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </a>
            </div>
            <div class="nav-item ${this.currentPage === 'categories' ? 'active' : ''}" data-page="categories">
                <a href="/categories">
                    <i class="fas fa-th-large"></i>
                    <span>Categories</span>
                </a>
            </div>
            <div class="nav-item ${this.currentPage === 'history' ? 'active' : ''}" data-page="history">
                <a href="/history">
                    <i class="fas fa-history"></i>
                    <span>History</span>
                </a>
            </div>
            <div class="nav-item ${this.currentPage === 'account' ? 'active' : ''}" data-page="account">
                <a href="/account">
                    <i class="fas fa-user"></i>
                    <span>Account</span>
                    <div class="usage-badge" id="usageBadge" style="display: none;"></div>
                </a>
            </div>
        `;

        document.body.appendChild(nav);
    }

    setActiveTab() {
        const items = document.querySelectorAll('.nav-item');
        items.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }

    async updateUsageIndicators() {
        try {
            await window.wikiDB.init();
            const stats = await window.wikiDB.getUsageStats();
            
            const badge = document.getElementById('usageBadge');
            if (!stats.isPremium) {
                const totalRemaining = stats.summariesRemaining + stats.lessonsRemaining;
                if (totalRemaining === 0) {
                    badge.textContent = '!';
                    badge.style.display = 'block';
                    badge.style.backgroundColor = '#dc3545';
                } else if (totalRemaining <= 1) {
                    badge.textContent = totalRemaining;
                    badge.style.display = 'block';
                    badge.style.backgroundColor = '#ffc107';
                }
            }
        } catch (error) {
            console.error('Error updating usage indicators:', error);
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BottomNavigation();
});