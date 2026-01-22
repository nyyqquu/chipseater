// Telegram Web App Integration (Simplified)
(function() {
    console.log('Telegram init script loaded');
    
    if (typeof window.Telegram === 'undefined') {
        console.log('⚠️ Telegram WebApp SDK not loaded');
        return;
    }

    const tg = window.Telegram.WebApp;
    console.log('Telegram WebApp object:', tg);
    
    try {
        tg.ready();
        tg.expand();
        console.log('✅ Telegram ready & expanded');
    } catch (e) {
        console.error('Telegram init error:', e);
    }

    // Simple wrapper
    window.tgApp = {
        tg: tg,
        
        isAvailable: function() {
            const available = !!(tg && tg.initDataUnsafe && tg.initDataUnsafe.user);
            console.log('Telegram available?', available);
            return available;
        },
        
        getUser: function() {
            if (!this.isAvailable()) return null;
            const user = tg.initDataUnsafe.user;
            console.log('Getting Telegram user:', user);
            return {
                id: user.id.toString(),
                username: user.username || user.first_name.toLowerCase().replace(/\s/g, '_'),
                firstName: user.first_name,
                lastName: user.last_name || '',
                photoURL: user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=FF9900&color=fff`,
                languageCode: user.language_code || 'ru'
            };
        },
        
        showAlert: function(message) {
            if (tg && tg.showAlert) {
                tg.showAlert(message);
            } else {
                alert(message);
            }
        },
        
        showConfirm: function(message, callback) {
            if (tg && tg.showConfirm) {
                tg.showConfirm(message, callback);
            } else {
                callback(confirm(message));
            }
        },
        
        hapticFeedback: function(style) {
            if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred(style || 'medium');
            }
        },
        
        close: function() {
            if (tg && tg.close) {
                tg.close();
            }
        }
    };
    
    console.log('✅ tgApp initialized:', window.tgApp.isAvailable());
})();
