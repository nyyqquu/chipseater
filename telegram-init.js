// Telegram Web App Integration
class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.colorScheme = 'light';
        
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
            
            // Listen for theme changes
            this.tg.onEvent('themeChanged', () => {
                console.log('Theme changed');
                this.applyTheme();
            });
        } else {
            console.log('Not running in Telegram');
            // Browser fallback - check system preference
            this.detectSystemTheme();
        }
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.colorScheme = 'dark';
            this.applyDarkTheme();
        } else {
            this.applyLightTheme();
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.colorScheme = e.matches ? 'dark' : 'light';
                if (e.matches) {
                    this.applyDarkTheme();
                } else {
                    this.applyLightTheme();
                }
            });
        }
    }

    applyTheme() {
        if (!this.tg) return;
        
        this.colorScheme = this.tg.colorScheme || 'light';
        console.log('Applying theme:', this.colorScheme);
        
        if (this.colorScheme === 'dark') {
            this.applyDarkTheme();
        } else {
            this.applyLightTheme();
        }
    }

    applyDarkTheme() {
        const root = document.documentElement;
        
        // Dark theme colors (Telegram-style)
        root.style.setProperty('--bg-primary', '#1C1C1E');
        root.style.setProperty('--bg-secondary', '#2C2C2E');
        root.style.setProperty('--bg-tertiary', '#3A3A3C');
        root.style.setProperty('--text-primary', '#FFFFFF');
        root.style.setProperty('--text-secondary', '#98989E');
        root.style.setProperty('--text-tertiary', '#636366');
        root.style.setProperty('--accent-primary', '#0A84FF');
        root.style.setProperty('--accent-secondary', '#5E5CE6');
        root.style.setProperty('--border-color', '#38383A');
        root.style.setProperty('--success-color', '#30D158');
        root.style.setProperty('--error-color', '#FF453A');
        root.style.setProperty('--warning-color', '#FF9F0A');
        
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    }

    applyLightTheme() {
        const root = document.documentElement;
        
        // Light theme colors (Original orange-white)
        root.style.setProperty('--bg-primary', '#F5F5F5');
        root.style.setProperty('--bg-secondary', '#FFFFFF');
        root.style.setProperty('--bg-tertiary', '#FFFFFF');
        root.style.setProperty('--text-primary', '#333333');
        root.style.setProperty('--text-secondary', '#666666');
        root.style.setProperty('--text-tertiary', '#999999');
        root.style.setProperty('--accent-primary', '#FF9900');
        root.style.setProperty('--accent-secondary', '#FF7700');
        root.style.setProperty('--border-color', '#E5E5E5');
        root.style.setProperty('--success-color', '#00CC66');
        root.style.setProperty('--error-color', '#FF3B30');
        root.style.setProperty('--warning-color', '#FF9500');
        
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
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
            photoURL: this.user.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.user.first_name) + '&background=FF9900&color=fff',
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

    hapticFeedback(style) {
        style = style || 'medium';
        if (this.tg && this.tg.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred(style);
        }
    }

    close() {
        if (this.tg) {
            this.tg.close();
        }
    }

    isDark() {
        return this.colorScheme === 'dark';
    }
}

// Initialize immediately
window.tgApp = new TelegramApp();
console.log('Telegram App initialized, available:', window.tgApp.isAvailable(), 'theme:', window.tgApp.colorScheme);
