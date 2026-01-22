// ==========================================
// QUOTES
// ==========================================

const QUOTES = [
    "Я не ленивый, я просто в режиме 'чипсовой экономии'.",
    "Чипсы — единственная валюта, которую я признаю.",
    "Диета? Я на диете из чипсов.",
    "Чипсы не решают проблемы, но шоколад тоже.",
    "Если чипсы — зло, то я злодей.",
    "Чипсы — это овощи, просто очень обработанные.",
    "Я считаю калории... в пачках чипсов.",
    "Чипсы — мой духовный наставник.",
    "Открыл пачку чипсов «на попробовать». Пачка закончилась.",
    "Чипсы и я — это серьёзные отношения.",
    "Я не зависим от чипсов, я просто очень их люблю.",
    "Чипсы — это хрустящее счастье.",
    "Почему делиться чипсами? Это же не коммунизм!",
    "Чипсы — мой антидепрессант без рецепта.",
    "Чипсы и я — это серьёзные отношения."
];

// ==========================================
// TELEGRAM INTEGRATION
// ==========================================

let isTelegramApp = false;
let telegramUser = null;
let currentUser = null;
let currentSelection = { category: null, brand: null, flavor: null, size: null };

function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        isTelegramApp = true;
        telegramUser = {
            id: user.id.toString(),
            username: user.username || user.first_name.toLowerCase().replace(/\s/g, '_'),
            firstName: user.first_name,
            lastName: user.last_name || '',
            photoURL: user.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.first_name) + '&background=FF9900&color=fff',
            languageCode: user.language_code || 'ru'
        };
        console.log('Telegram user detected:', telegramUser.username);
    }
}

// Try to init Telegram immediately
initTelegram();
setTimeout(initTelegram, 500);

// ==========================================
// SNACK DATABASE
// ==========================================

const DEFAULT_SNACKS = {
    chips: {
        brands: {
            lays: {
                name: "Lay's",
                emoji: "🥔",
                flavors: {
                    classic: { name: "Классические", emoji: "🥔" },
                    paprika: { name: "Паприка", emoji: "🌶️" },
                    cheese: { name: "Сыр", emoji: "🧀" }
                }
            },
            pringles: {
                name: "Pringles",
                emoji: "🎯",
                flavors: {
                    original: { name: "Original", emoji: "🥔" },
                    cheese: { name: "Cheese", emoji: "🧀" }
                }
            }
        },
        sizes: [
            { grams: 50, label: "Мини", emoji: "📦" },
            { grams: 150, label: "Большая", emoji: "📦📦" }
        ]
    },
    croutons: {
        brands: {
            krutzel: {
                name: "Krützel",
                emoji: "🍞",
                flavors: {
                    garlic: { name: "Чеснок", emoji: "🧄" },
                    bacon: { name: "Бекон", emoji: "🥓" }
                }
            }
        },
        sizes: [
            { grams: 60, label: "Мини", emoji: "📦" },
            { grams: 100, label: "Средняя", emoji: "📦📦" }
        ]
    }
};

// ==========================================
// HELPERS
// ==========================================

function showRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('quoteText').textContent = quote;
}

function formatYearMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return year + '-' + month;
}

function getCurrentYearMonth() {
    return formatYearMonth(new Date());
}

function changeMonth(currentMonth, offset) {
    const parts = currentMonth.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const date = new Date(year, month - 1 + offset, 1);
    return formatYearMonth(date);
}

// ==========================================
// AUTH MANAGER
// ==========================================

class AuthManager {
    constructor() {
        this.initAuthListener();
    }

    initAuthListener() {
        const self = this;
        console.log('Starting auth...');
        console.log('Is Telegram:', isTelegramApp);
        
        setTimeout(function() {
            if (isTelegramApp && telegramUser) {
                console.log('Using Telegram auth');
                self.handleTelegramLogin(telegramUser);
            } else {
                console.log('Using Firebase auth');
                self.showFirebaseLogin();
            }
        }, 200);
    }

    async handleTelegramLogin(tgUser) {
        try {
            console.log('Telegram login:', tgUser.username);

            const userId = 'tg_' + tgUser.id;
            currentUser = { uid: userId };

            const profileDoc = await db.collection('users').doc(userId).get();

            if (!profileDoc.exists) {
                await db.collection('users').doc(userId).set({
                    username: tgUser.username,
                    firstName: tgUser.firstName,
                    lastName: tgUser.lastName,
                    email: 'tg' + tgUser.id + '@telegram.user',
                    photoURL: tgUser.photoURL,
                    telegramId: tgUser.id,
                    friends: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                const newDoc = await db.collection('users').doc(userId).get();
                document.getElementById('loginScreen').style.display = 'none';
                window.app = new CrispTrackerApp({ uid: userId }, newDoc.data());
            } else {
                document.getElementById('loginScreen').style.display = 'none';
                window.app = new CrispTrackerApp({ uid: userId }, profileDoc.data());
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Ошибка входа: ' + error.message);
        }
    }

    showFirebaseLogin() {
        const loginHTML = '<div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">' +
            '<div class="text-center mb-6">' +
            '<div class="inline-block p-4 bg-yellow-100 rounded-full mb-3">' +
            '<span class="text-5xl">🍟</span>' +
            '</div>' +
            '<h1 class="text-3xl font-bold text-text mb-2">CrispTracker</h1>' +
            '<p class="text-gray-600 text-sm">Откройте в Telegram</p>' +
            '</div>' +
            '<a href="https://t.me/crisptracker_bot/myapp" class="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-center">' +
            'Открыть в Telegram' +
            '</a>' +
            '</div>';

        document.getElementById('loginScreen').innerHTML = loginHTML;
        document.getElementById('loginScreen').style.display = 'flex';
    }
}

// ==========================================
// MAIN APP (SIMPLIFIED)
// ==========================================

class CrispTrackerApp {
    constructor(user, profile) {
        this.user = user;
        this.profile = profile;

        console.log('App initialized for:', profile.username);
        this.initUI();
        this.loadData();
    }

    initUI() {
        const self = this;
        document.getElementById('headerAvatar').src = this.profile.photoURL;
        document.getElementById('addBtn').onclick = function() { self.openAddModal(); };
        document.getElementById('closeModal').onclick = function() { self.closeAddModal(); };
        document.getElementById('saveSnackBtn').onclick = function() { self.saveSnack(); };
        document.getElementById('newQuoteBtn').onclick = showRandomQuote;
        
        showRandomQuote();
    }

    async loadData() {
        await this.loadHistory();
    }

    async loadHistory() {
        const historyHTML = '<p class="text-sm text-gray-400 text-center py-4">Загрузка...</p>';
        document.getElementById('historyList').innerHTML = historyHTML;

        try {
            const snapshot = await db.collection('entries')
                .where('userId', '==', this.user.uid)
                .limit(10)
                .get();

            if (snapshot.empty) {
                document.getElementById('historyList').innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Записей нет</p>';
                return;
            }

            const entries = [];
            snapshot.forEach(function(doc) {
                entries.push({ id: doc.id, data: doc.data() });
            });

            let html = '';
            entries.forEach(function(entry) {
                const data = entry.data;
                html += '<div class="flex items-center gap-3 p-3 rounded-xl border border-gray-200">' +
                    '<div class="text-2xl">' + (data.emoji || '🍟') + '</div>' +
                    '<div class="flex-1"><p class="text-sm font-semibold">' + data.grams + 'г • ' + data.name + '</p></div>' +
                    '</div>';
            });

            document.getElementById('historyList').innerHTML = html;
        } catch (error) {
            console.error('Load history error:', error);
            document.getElementById('historyList').innerHTML = '<p class="text-sm text-red-400 text-center py-4">Ошибка загрузки</p>';
        }
    }

    openAddModal() {
        currentSelection = { category: null, brand: null, flavor: null, size: null };
        document.getElementById('addModal').classList.remove('hidden');
        document.getElementById('customGrams').value = '';
        this.renderChipsBrands();
    }

    closeAddModal() {
        document.getElementById('addModal').classList.add('hidden');
    }

    renderChipsBrands() {
        const container = document.getElementById('chipsBrands');
        const brands = DEFAULT_SNACKS.chips.brands;

        let html = '';
        for (const key in brands) {
            const brand = brands[key];
            html += '<button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary transition text-center">' +
                '<div class="text-xl mb-1">' + brand.emoji + '</div>' +
                '<div class="text-xs font-semibold">' + brand.name + '</div>' +
                '</button>';
        }

        container.innerHTML = html;
    }

    async saveSnack() {
        const grams = parseInt(document.getElementById('customGrams').value);

        if (!grams || grams <= 0) {
            alert('Введите количество грамм');
            return;
        }

        const entry = {
            userId: this.user.uid,
            username: this.profile.username,
            userPhotoURL: this.profile.photoURL,
            grams: grams,
            name: 'Снек',
            emoji: '🍟',
            date: new Date().toISOString().split('T')[0],
            timestamp: firebase.firestore.Timestamp.now()
        };

        try {
            await db.collection('entries').add(entry);
            this.closeAddModal();
            await this.loadData();
            alert('✅ Добавлено ' + grams + 'г!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Ошибка: ' + error.message);
        }
    }
}

// ==========================================
// INIT
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting app...');
    new AuthManager();
});
