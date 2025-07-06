// Premium Upgrade System
class PremiumManager {
    constructor() {
        this.init();
    }

    async init() {
        await window.wikiDB.init();
        this.setupUpgradeHandlers();
    }

    setupUpgradeHandlers() {
        // Listen for upgrade buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-btn') || e.target.closest('.upgrade-btn')) {
                e.preventDefault();
                this.showUpgradeModal();
            }
        });
    }

    showUpgradeModal() {
        const modal = this.createUpgradeModal();
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close handlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-backdrop')) {
                this.closeModal(modal);
            }
        });

        // Demo upgrade button
        modal.querySelector('.demo-upgrade-btn').addEventListener('click', () => {
            this.demoUpgrade();
            this.closeModal(modal);
        });
    }

    createUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-crown"></i> Upgrade to Premium</h2>
                        <button class="close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="premium-features">
                            <h3>Unlock Premium Features</h3>
                            <div class="feature-list">
                                <div class="feature-item">
                                    <i class="fas fa-infinity text-primary"></i>
                                    <span>Unlimited AI summaries</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-graduation-cap text-primary"></i>
                                    <span>Unlimited AI lessons</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-download text-primary"></i>
                                    <span>Download content as PDF</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-palette text-primary"></i>
                                    <span>Custom themes & layouts</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-chart-line text-primary"></i>
                                    <span>Advanced learning analytics</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-bell text-primary"></i>
                                    <span>Smart notifications</span>
                                </div>
                            </div>
                        </div>
                        <div class="pricing-section">
                            <div class="price-card">
                                <div class="price">
                                    <span class="currency">$</span>
                                    <span class="amount">9.99</span>
                                    <span class="period">/month</span>
                                </div>
                                <div class="price-description">
                                    Full access to all premium features
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="demo-upgrade-btn btn-demo">
                            <i class="fas fa-magic"></i>
                            Try Premium Demo
                        </button>
                        <p class="demo-note">
                            Click above to experience premium features for this session
                        </p>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    async demoUpgrade() {
        try {
            await window.wikiDB.upgradeToPremium();
            
            // Show success message
            this.showSuccessMessage();
            
            // Update UI
            this.updatePremiumUI();
            
            // Refresh navigation badges
            if (window.bottomNav) {
                window.bottomNav.updateUsageIndicators();
            }
            
        } catch (error) {
            console.error('Error upgrading to premium:', error);
            this.showErrorMessage();
        }
    }

    showSuccessMessage() {
        const toast = document.createElement('div');
        toast.className = 'premium-toast success';
        toast.innerHTML = `
            <i class="fas fa-crown"></i>
            <span>Welcome to Premium! Enjoy unlimited access.</span>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showErrorMessage() {
        const toast = document.createElement('div');
        toast.className = 'premium-toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Upgrade failed. Please try again.</span>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    updatePremiumUI() {
        // Add premium badges
        const userElements = document.querySelectorAll('.user-status, .premium-status');
        userElements.forEach(el => {
            el.innerHTML = '<i class="fas fa-crown text-warning"></i> Premium';
        });

        // Remove usage limit warnings
        const limitWarnings = document.querySelectorAll('.usage-limit, .upgrade-prompt');
        limitWarnings.forEach(el => el.remove());

        // Update navigation
        const usageBadge = document.getElementById('usageBadge');
        if (usageBadge) {
            usageBadge.style.display = 'none';
        }
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }

    // Check if content generation is allowed
    async checkGenerationLimit(type) {
        const stats = await window.wikiDB.getUsageStats();
        
        if (stats.isPremium) {
            return { allowed: true, message: 'Premium user - unlimited access' };
        }

        const remaining = type === 'summary' ? stats.summariesRemaining : stats.lessonsRemaining;
        
        if (remaining > 0) {
            return { 
                allowed: true, 
                message: `${remaining} ${type}${remaining !== 1 ? 's' : ''} remaining today` 
            };
        }

        return {
            allowed: false,
            message: `Daily limit reached. Upgrade to Premium for unlimited ${type}s.`,
            showUpgrade: true
        };
    }

    // Show usage limit modal
    showLimitModal(type) {
        const modal = document.createElement('div');
        modal.className = 'limit-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-lock"></i> Daily Limit Reached</h3>
                    </div>
                    <div class="modal-body">
                        <p>You've used your daily free ${type}. Upgrade to Premium for unlimited access!</p>
                        <div class="limit-features">
                            <div class="feature-item">
                                <i class="fas fa-infinity"></i>
                                <span>Unlimited ${type}s</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-star"></i>
                                <span>All premium features</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="upgrade-btn btn-primary">
                            <i class="fas fa-crown"></i>
                            Upgrade to Premium
                        </button>
                        <button class="close-modal btn-secondary">Maybe Later</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.querySelector('.upgrade-btn').addEventListener('click', () => {
            this.closeModal(modal);
            this.showUpgradeModal();
        });
    }
}

// Initialize premium manager
document.addEventListener('DOMContentLoaded', () => {
    window.premiumManager = new PremiumManager();
});