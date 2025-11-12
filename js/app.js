// app.js
// Aplikasi utama MinePoint dengan semua fungsi

import { auth, db, storage } from './firebase-config.js';

class MinePointApp {
    constructor() {
        this.user = null;
        this.miningInterval = null;
        this.isMining = false;
        this.currentBalance = 1250.75;
        this.hashRate = 15.2;
        this.pointsPerHour = 42.5;
        
        this.init();
    }

    // Initialize aplikasi
    init() {
        this.setupEventListeners();
        this.checkAuthState();
        this.loadUserData();
        this.startMiningTimer();
        this.updateUI();
    }

    // Setup event listeners
    setupEventListeners() {
        // Mining control buttons
        const miningBtn = document.querySelector('.btn-primary');
        const upgradeBtn = document.querySelector('.btn-secondary');

        if (miningBtn) {
            miningBtn.addEventListener('click', () => this.toggleMining());
        }

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.showUpgradeModal());
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.getAttribute('href'));
            });
        });

        // Feature cards
        const featureLinks = document.querySelectorAll('.feature-link');
        featureLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.closest('.feature-card').querySelector('h3').textContent.toLowerCase());
            });
        });
    }

    // Check authentication state
    async checkAuthState() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.user = user;
                await this.loadUserData();
                this.updateUI();
            } else {
                // Redirect to login if not authenticated
                this.showLoginModal();
            }
        });
    }

    // Load user data dari Firestore
    async loadUserData() {
        if (!this.user) return;

        try {
            const userDoc = await db.collection('users').doc(this.user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.currentBalance = userData.balance || 1250.75;
                this.hashRate = userData.hashRate || 15.2;
                this.pointsPerHour = userData.pointsPerHour || 42.5;
                
                // Update mining equipment
                if (userData.miningEquipment) {
                    this.miningEquipment = userData.miningEquipment;
                }
                
                // Update referral data
                if (userData.referrals) {
                    this.referrals = userData.referrals;
                }
                
                this.updateUI();
            } else {
                // Create new user document
                await this.createUserDocument();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Create new user document
    async createUserDocument() {
        const userData = {
            email: this.user.email,
            balance: this.currentBalance,
            hashRate: this.hashRate,
            pointsPerHour: this.pointsPerHour,
            miningEquipment: [
                { name: 'Basic Miner', level: 1, power: 10 }
            ],
            referrals: [],
            tasksCompleted: [],
            joinedAt: new Date()
        };

        await db.collection('users').doc(this.user.uid).set(userData);
    }

    // Toggle mining status
    toggleMining() {
        this.isMining = !this.isMining;
        const miningBtn = document.querySelector('.btn-primary');
        const statusIndicator = document.querySelector('.status-indicator');

        if (this.isMining) {
            miningBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Mining';
            statusIndicator.classList.remove('inactive');
            statusIndicator.classList.add('active');
            this.startMining();
        } else {
            miningBtn.innerHTML = '<i class="fas fa-play"></i> Start Mining';
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('inactive');
            this.stopMining();
        }

        this.saveMiningStatus();
    }

    // Start mining process
    startMining() {
        this.miningInterval = setInterval(async () => {
            const pointsEarned = this.pointsPerHour / 60; // Points per minute
            this.currentBalance += pointsEarned;
            
            // Add to activity log
            await this.addActivity('Mining Reward', `Anda mendapatkan ${pointsEarned.toFixed(2)} MP`, pointsEarned);
            
            // Update Firestore
            await this.updateBalance();
            this.updateUI();
        }, 60000); // Every minute
    }

    // Stop mining process
    stopMining() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
    }

    // Update user balance di Firestore
    async updateBalance() {
        if (!this.user) return;

        try {
            await db.collection('users').doc(this.user.uid).update({
                balance: this.currentBalance,
                lastMiningUpdate: new Date()
            });
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    }

    // Add activity to log
    async addActivity(title, description, amount) {
        if (!this.user) return;

        const activity = {
            title,
            description,
            amount,
            type: amount > 0 ? 'income' : 'expense',
            timestamp: new Date()
        };

        try {
            await db.collection('users').doc(this.user.uid).collection('activities').add(activity);
            this.updateActivityUI(activity);
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    }

    // Update activity UI
    updateActivityUI(activity) {
        const activityList = document.querySelector('.activity-list');
        const activityItem = this.createActivityElement(activity);
        
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Limit to 10 activities
        if (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    // Create activity element
    createActivityElement(activity) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const iconClass = activity.type === 'income' ? 'success' : 'warning';
        const icon = activity.type === 'income' ? 'fa-coins' : 'fa-shopping-cart';
        
        activityItem.innerHTML = `
            <div class="activity-icon ${iconClass}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${this.formatTime(activity.testamp)}</span>
            </div>
            <div class="activity-amount ${activity.type === 'income' ? 'positive' : 'negative'}">
                ${activity.type === 'income' ? '+' : '-'}${Math.abs(activity.amount).toFixed(1)} MP
            </div>
        `;
        
        return activityItem;
    }

    // Format waktu untuk activity
    formatTime(timestamp) {
        const now = new Date();
        const activityTime = timestamp.toDate();
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Baru saja';
        if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`;
        return `${Math.floor(diffInMinutes / 1440)} hari lalu`;
    }

    // Save mining status
    async saveMiningStatus() {
        if (!this.user) return;

        try {
            await db.collection('users').doc(this.user.uid).update({
                isMining: this.isMining,
                lastMiningToggle: new Date()
            });
        } catch (error) {
            console.error('Error saving mining status:', error);
        }
    }

    // Show upgrade modal
    showUpgradeModal() {
        const modal = this.createUpgradeModal();
        document.body.appendChild(modal);
        
        // Setup modal event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelectorAll('.upgrade-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleUpgradeSelection(e.currentTarget);
            });
        });
    }

    // Create upgrade modal
    createUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Upgrade Mining Equipment</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="upgrade-option" data-type="miner" data-cost="500">
                        <div class="upgrade-icon">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <div class="upgrade-info">
                            <h3>Advanced Miner</h3>
                            <p>Increase hash rate by 5 TH/s</p>
                            <div class="upgrade-cost">500 MP</div>
                        </div>
                    </div>
                    <div class="upgrade-option" data-type="cooling" data-cost="300">
                        <div class="upgrade-icon">
                            <i class="fas fa-snowflake"></i>
                        </div>
                        <div class="upgrade-info">
                            <h3>Cooling System</h3>
                            <p>Reduce power consumption by 10%</p>
                            <div class="upgrade-cost">300 MP</div>
                        </div>
                    </div>
                    <div class="upgrade-option" data-type="software" data-cost="200">
                        <div class="upgrade-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="upgrade-info">
                            <h3>Mining Software</h3>
                            <p>Increase efficiency by 15%</p>
                            <div class="upgrade-cost">200 MP</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    // Handle upgrade selection
    async handleUpgradeSelection(option) {
        const upgradeType = option.dataset.type;
        const cost = parseInt(option.dataset.cost);
        
        if (this.currentBalance < cost) {
            this.showNotification('Saldo tidak cukup!', 'error');
            return;
        }
        
        // Process upgrade
        this.currentBalance -= cost;
        
        switch (upgradeType) {
            case 'miner':
                this.hashRate += 5;
                this.pointsPerHour += 15;
                break;
            case 'cooling':
                this.pointsPerHour += 8;
                break;
            case 'software':
                this.pointsPerHour += 10;
                break;
        }
        
        // Update Firestore
        await this.updateBalance();
        await db.collection('users').doc(this.user.uid).update({
            hashRate: this.hashRate,
            pointsPerHour: this.pointsPerHour
        });
        
        // Add activity
        await this.addActivity('Equipment Upgrade', `Membeli upgrade ${upgradeType}`, -cost);
        
        this.updateUI();
        this.showNotification('Upgrade berhasil!', 'success');
        
        // Close modal
        document.querySelector('.modal-overlay')?.remove();
    }

    // Handle navigation
    handleNavigation(destination) {
        // Hide all sections
        document.querySelectorAll('main section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        switch (destination) {
            case '#profile':
            case 'profil':
                this.showProfileSection();
                break;
            case '#referral':
            case 'referral':
                this.showReferralSection();
                break;
            case '#task':
            case 'task':
                this.showTaskSection();
                break;
            case '#setting':
            case 'setting':
                this.showSettingSection();
                break;
            default:
                // Show dashboard
                document.querySelectorAll('main section').forEach(section => {
                    section.style.display = 'block';
                });
                break;
        }
    }

    // Show profile section
    showProfileSection() {
        // Implementation for profile section
        this.showNotification('Fitur Profil akan segera hadir!', 'info');
    }

    // Show referral section
    showReferralSection() {
        // Implementation for referral section
        this.showNotification('Fitur Referral akan segera hadir!', 'info');
    }

    // Show task section
    showTaskSection() {
        // Implementation for task section
        this.showNotification('Fitur Task akan segera hadir!', 'info');
    }

    // Show setting section
    showSettingSection() {
        // Implementation for setting section
        this.showNotification('Fitur Setting akan segera hadir!', 'info');
    }

    // Show login modal
    showLoginModal() {
        // Implementation for login modal
        console.log('Show login modal');
    }

    // Start mining timer
    startMiningTimer() {
        setInterval(() => {
            const timeElement = document.querySelector('.progress-text strong');
            if (timeElement) {
                let time = timeElement.textContent.split(':');
                let minutes = parseInt(time[0]);
                let seconds = parseInt(time[1]);
                
                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                    if (minutes < 0) {
                        minutes = 15;
                        seconds = 0;
                        
                        // Simulate mining reward if mining is active
                        if (this.isMining) {
                            const reward = this.pointsPerHour / 4; // Every 15 minutes
                            this.currentBalance += reward;
                            this.addActivity('Mining Reward', `Anda mendapatkan ${reward.toFixed(2)} MP`, reward);
                            this.updateBalance();
                            this.updateUI();
                        }
                    }
                }
                
                timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    // Update UI elements
    updateUI() {
        // Update balance
        const balanceElement = document.querySelector('.amount');
        if (balanceElement) {
            balanceElement.textContent = this.currentBalance.toFixed(2);
        }
        
        // Update stats
        const hashRateElement = document.querySelector('.stats-card:nth-child(1) .stats-value');
        const pointsPerHourElement = document.querySelector('.stats-card:nth-child(2) .stats-value');
        
        if (hashRateElement) {
            hashRateElement.textContent = `${this.hashRate.toFixed(1)} TH/s`;
        }
        
        if (pointsPerHourElement) {
            pointsPerHourElement.textContent = `${this.pointsPerHour.toFixed(1)} MP`;
        }
        
        // Update mining status
        const miningBtn = document.querySelector('.btn-primary');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (this.isMining) {
            if (miningBtn) miningBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Mining';
            if (statusIndicator) {
                statusIndicator.classList.remove('inactive');
                statusIndicator.classList.add('active');
            }
        } else {
            if (miningBtn) miningBtn.innerHTML = '<i class="fas fa-play"></i> Start Mining';
            if (statusIndicator) {
                statusIndicator.classList.remove('active');
                statusIndicator.classList.add('inactive');
            }
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded. Please include Firebase SDK.');
        return;
    }
    
    // Initialize MinePoint app
    window.minePointApp = new MinePointApp();
});

// Utility functions
const utils = {
    // Format number with commas
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    // Generate referral code
    generateReferralCode: () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },
    
    // Calculate mining reward
    calculateReward: (hashRate, timeInHours) => {
        return (hashRate * 2.8 * timeInHours).toFixed(2);
    }
};

// Export for use in other modules
export { MinePointApp, utils };
