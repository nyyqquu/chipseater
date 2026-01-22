// Telegram Web App Integration
class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        
        if (this.tg) {
            console.log('Telegram WebApp detected');
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            
            // Get user
            if (this.tg.initDataUnsafe?.user) {
                this.user = this.tg.initDataUnsafe.user;
                console.log('Telegram user:', this.user);
            }
            
            // Apply theme
            this.applyTheme();
        } else {
            console.log('Not running in Telegram');
        }
    }

    applyTheme() {
        if (!this.tg) return;
        
        const params = this.tg.themeParams;
        if (params.bg_color) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', params.bg_color);
        }
        if (params.button_color) {
            document.documentElement.style.setProperty('--tg-theme-button-color', params.button_color);
        }
        
        if (this.tg.colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    isAvailable() {
        return !!this.user;
    }

    getUser() {
        if (!this.user) return null;

        return {
            id: this.user.id.toString(),
            username: this.user.username || this.user.first_name.toLowerCase().replace(/\s/g, '_'),
            firstName: this.user.first_name,
            lastName: this.user.last_name || '',
            photoURL: this.user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.first_name)}&background=FF9900&color=fff`,
            languageCode: this.user.language_code || 'ru'
        };
    }

    showAlert(message) {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message, callback) {
        if (this.tg) {
            this.tg.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            callback(result);
        }
    }

    hapticFeedback(style = 'medium') {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred(style);
        }
    }

    close() {
        if (this.tg) {
            this.tg.close();
        }
    }
}

// Initialize immediately
window.tgApp = new TelegramApp();
console.log('Telegram App initialized, available:', window.tgApp.isAvailable());
