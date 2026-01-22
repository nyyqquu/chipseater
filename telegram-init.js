// Telegram Web App Integration
class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            
            // Set theme colors
            document.documentElement.style.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#F5F5F5');
            document.documentElement.style.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#FF9900');
            
            // Apply Telegram theme
            if (this.tg.colorScheme === 'dark') {
                document.body.classList.add('dark-theme');
            }
        }
    }

    isAvailable() {
        return !!this.tg && !!this.tg.initDataUnsafe?.user;
    }

    getUser() {
        if (!this.isAvailable()) return null;

        const user = this.tg.initDataUnsafe.user;
        return {
            id: user.id.toString(),
            username: user.username || user.first_name.toLowerCase().replace(/\s/g, '_'),
            firstName: user.first_name,
            lastName: user.last_name || '',
            photoURL: user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=FF9900&color=fff`,
            languageCode: user.language_code || 'ru'
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

    setMainButton(text, onClick) {
        if (!this.tg) return;

        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(onClick);
    }

    hideMainButton() {
        if (this.tg?.MainButton) {
            this.tg.MainButton.hide();
        }
    }

    close() {
        if (this.tg) {
            this.tg.close();
        }
    }

    shareUrl(url, text) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        if (this.tg) {
            this.tg.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, '_blank');
        }
    }
}

// Initialize
window.tgApp = new TelegramApp();
console.log('Telegram App initialized:', window.tgApp.isAvailable());
