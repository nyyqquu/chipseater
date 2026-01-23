// ==========================================
// QUOTES DATABASE
// ==========================================

const QUOTES = [
    "Чипсы — это не еда, это способ жизни.",
    "Почему чипсы такие вкусные? Потому что они знают, что их съедят.",
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
    "Чипсы — мой антидепрессант без рецепта."
];

// ==========================================
// TELEGRAM INTEGRATION
// ==========================================

let isTelegramApp = false;
let telegramUser = null;

setTimeout(() => {
    if (window.tgApp && window.tgApp.isAvailable()) {
        isTelegramApp = true;
        telegramUser = window.tgApp.getUser();
        console.log('Running in Telegram, user:', telegramUser);
    } else {
        console.log('Running in browser');
    }
}, 100);

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
                    cheese: { name: "Сыр", emoji: "🧀" },
                    sour_cream: { name: "Сметана", emoji: "🌿" },
                    bacon: { name: "Бекон", emoji: "🥓" }
                }
            },
            pringles: {
                name: "Pringles",
                emoji: "🎯",
                flavors: {
                    original: { name: "Original", emoji: "🥔" },
                    sour_cream: { name: "Sour Cream", emoji: "🧅" },
                    paprika: { name: "Paprika", emoji: "🌶️" },
                    cheese: { name: "Cheese", emoji: "🧀" }
                }
            },
            cheetos: {
                name: "Cheetos",
                emoji: "🧡",
                flavors: {
                    cheese: { name: "Сыр", emoji: "🧀" },
                    flamin_hot: { name: "Flamin Hot", emoji: "🔥" }
                }
            },
            doritos: {
                name: "Doritos",
                emoji: "🔺",
                flavors: {
                    nacho: { name: "Nacho", emoji: "🧀" },
                    cool_ranch: { name: "Cool Ranch", emoji: "🌿" }
                }
            }
        },
        sizes: [
            { grams: 40, label: "Мини", emoji: "📦" },
            { grams: 90, label: "Средняя", emoji: "📦📦" },
            { grams: 150, label: "Большая", emoji: "📦📦📦" }
        ]
    },
    croutons: {
        brands: {
            three_crusts: {
                name: "Три корочки",
                emoji: "🍞",
                flavors: {
                    garlic: { name: "Чеснок", emoji: "🧄" },
                    bacon: { name: "Бекон", emoji: "🥓" },
                    cheese: { name: "Сыр", emoji: "🧀" }
                }
            },
            kirieshki: {
                name: "Кириешки",
                emoji: "🌾",
                flavors: {
                    rye: { name: "Ржаные", emoji: "🧂" },
                    bacon: { name: "Бекон", emoji: "🥓" },
                    salami: { name: "Салями", emoji: "🍕" }
                }
            },
            flint: {
                name: "Flint",
                emoji: "💎",
                flavors: {
                    garlic: { name: "Чеснок", emoji: "🧄" },
                    cheese: { name: "Сыр", emoji: "🧀" },
                    bacon: { name: "Бекон", emoji: "🥓" }
                }
            }
        },
        sizes: [
            { grams: 60, label: "Мини", emoji: "📦" },
            { grams: 100, label: "Средняя", emoji: "📦📦" },
            { grams: 150, label: "Большая", emoji: "📦📦📦" }
        ]
    }
};

// ==========================================
// GLOBAL STATE
// ==========================================

let currentUser = null;
let currentSelection = {
    category: null,
    brand: null,
    flavor: null,
    size: null
};

let currentMonths = {
    myChart: null,
    compChart: null,
    history: null
};

let isTopExpanded = false;

// ==========================================
// UTILS
// ==========================================

function showRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('quoteText').textContent = quote;
}

function formatYearMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function getCurrentYearMonth() {
    return formatYearMonth(new Date());
}

function changeMonth(currentMonth, offset) {
    const [year, month] = currentMonth.split('-').map(Number);
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
        setTimeout(() => {
            if (isTelegramApp && telegramUser) {
                console.log('Using Telegram auth');
                this.handleTelegramLogin(telegramUser);
            } else {
                console.log('Browser mode - Telegram only');
                this.showLoginScreen();
            }
        }, 200);
    }

    async handleTelegramLogin(tgUser) {
        console.log('Handling Telegram login for:', tgUser);
        
        const userId = 'tg_' + tgUser.id;
        currentUser = { uid: userId };

        try {
            const profileDoc = await db.collection('users').doc(userId).get();

            if (!profileDoc.exists) {
                console.log('Creating new Telegram user profile');
                await db.collection('users').doc(userId).set({
                    username: tgUser.username,
                    firstName: tgUser.firstName,
                    lastName: tgUser.lastName,
                    email: `tg_${tgUser.id}@telegram.user`,
                    photoURL: tgUser.photoURL,
                    telegramId: tgUser.id,
                    friends: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                const newProfile = await db.collection('users').doc(userId).get();
                document.getElementById('loginScreen').style.display = 'none';
                window.app = new CrispTrackerApp({ uid: userId }, newProfile.data());
            } else {
                console.log('Existing Telegram user found');
                document.getElementById('loginScreen').style.display = 'none';
                window.app = new CrispTrackerApp({ uid: userId }, profileDoc.data());
            }
        } catch (error) {
            console.error('Telegram login error:', error);
            if (window.tgApp) {
                window.tgApp.showAlert('Ошибка входа: ' + error.message);
            }
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginScreen').innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
                <div class="text-center mb-6">
                    <div class="inline-block p-4 bg-yellow-100 rounded-full mb-3">
                        <span class="text-5xl">🍟</span>
                    </div>
                    <h1 class="text-3xl font-bold text-text mb-2">CrispTracker</h1>
                    <p class="text-gray-600 text-sm mb-4">Откройте в Telegram</p>
                    <a href="https://t.me/crisptracker_bot/myapp" class="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold">
                        Открыть в Telegram
                    </a>
                </div>
            </div>
        `;
    }

    async logout() {
        const confirmed = await new Promise(resolve => {
            if (window.tgApp) {
                window.tgApp.showConfirm('Выйти из аккаунта?', resolve);
            } else {
                resolve(confirm('Выйти из аккаунта?'));
            }
        });

        if (confirmed) {
            if (isTelegramApp) {
                window.tgApp.close();
            } else {
                location.reload();
            }
        }
    }
}

// ==========================================
// MAIN APP
// ==========================================

class CrispTrackerApp {
    constructor(user, profile) {
        this.user = user;
        this.profile = profile;
        this.charts = {};
        this.customBrands = { chips: {}, croutons: {} };
        this.editingBrandKey = null;
        this.editingBrandCategory = null;
        
        currentMonths = {
            myChart: getCurrentYearMonth(),
            compChart: getCurrentYearMonth(),
            history: getCurrentYearMonth()
        };
        
        this.initUI();
        this.loadCustomBrands();
        this.loadData();
    }

    initUI() {
        document.getElementById('headerAvatar').src = this.profile.photoURL;

        // Main buttons
        document.getElementById('addBtn').onclick = () => this.openAddModal();
        document.getElementById('closeModal').onclick = () => this.closeAddModal();
        document.getElementById('profileBtn').onclick = () => this.openEditProfile();
        document.getElementById('saveSnackBtn').onclick = () => this.saveSnack();
        document.getElementById('newQuoteBtn').onclick = () => showRandomQuote();
        document.getElementById('logoutBtn').onclick = () => new AuthManager().logout();
        document.getElementById('manageBrandsBtn').onclick = () => this.openManageBrands();
        document.getElementById('closeBrandsModal').onclick = () => this.closeManageBrands();

        // Top toggle
        document.getElementById('toggleTopBtn').onclick = () => this.toggleTop();

        // Friends
        document.getElementById('addFriendBtn').onclick = () => this.openAddFriend();
        document.getElementById('closeAddFriendModal').onclick = () => this.closeAddFriend();
        document.getElementById('searchFriendBtn').onclick = () => this.searchFriend();

        // Edit profile
        document.getElementById('cancelEditBtn').onclick = () => this.closeEditProfile();
        document.getElementById('saveEditProfileBtn').onclick = () => this.saveEditProfile();
        document.getElementById('editChangePhotoBtn').onclick = () => document.getElementById('editPhotoInput').click();
        document.getElementById('editPhotoInput').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('editProfilePreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => this.switchTab(btn.dataset.tab);
        });

        document.querySelectorAll('.preset-tab').forEach(btn => {
            btn.onclick = () => this.switchPresetTab(btn.dataset.tab);
        });

        // Date navigation
        this.initDateNavigation();

        // Edit brand
        document.getElementById('cancelEditBrand').onclick = () => this.closeEditBrand();
        document.getElementById('saveEditBrand').onclick = () => this.saveEditedBrand();

        // Add preset buttons
        document.getElementById('addChipsPreset').onclick = () => this.openAddPreset('chips');
        document.getElementById('addCroutonsPreset').onclick = () => this.openAddPreset('croutons');

        this.renderChipsBrands();
        this.renderCroutonsBrands();
        showRandomQuote();
    }

    toggleTop() {
        isTopExpanded = !isTopExpanded;
        const topUsers = document.getElementById('topUsers');
        const btn = document.getElementById('toggleTopBtn');
        
        if (isTopExpanded) {
            topUsers.classList.remove('top-collapsed');
            btn.textContent = 'Свернуть';
        } else {
            topUsers.classList.add('top-collapsed');
            btn.textContent = 'Показать всех';
        }
    }

    initDateNavigation() {
        // My Chart
        document.getElementById('myChartMonth').value = currentMonths.myChart;
        document.getElementById('myChartMonth').onchange = (e) => {
            currentMonths.myChart = e.target.value;
            this.renderMyChart();
        };
        document.getElementById('myChartPrev').onclick = () => {
            currentMonths.myChart = changeMonth(currentMonths.myChart, -1);
            document.getElementById('myChartMonth').value = currentMonths.myChart;
            this.renderMyChart();
        };
        document.getElementById('myChartNext').onclick = () => {
            currentMonths.myChart = changeMonth(currentMonths.myChart, 1);
            document.getElementById('myChartMonth').value = currentMonths.myChart;
            this.renderMyChart();
        };

        // Comparison Chart
        document.getElementById('compChartMonth').value = currentMonths.compChart;
        document.getElementById('compChartMonth').onchange = (e) => {
            currentMonths.compChart = e.target.value;
            this.renderComparisonChart();
        };
        document.getElementById('compChartPrev').onclick = () => {
            currentMonths.compChart = changeMonth(currentMonths.compChart, -1);
            document.getElementById('compChartMonth').value = currentMonths.compChart;
            this.renderComparisonChart();
        };
        document.getElementById('compChartNext').onclick = () => {
            currentMonths.compChart = changeMonth(currentMonths.compChart, 1);
            document.getElementById('compChartMonth').value = currentMonths.compChart;
            this.renderComparisonChart();
        };

        // History
        document.getElementById('historyMonth').value = currentMonths.history;
        document.getElementById('historyMonth').onchange = (e) => {
            currentMonths.history = e.target.value;
            this.loadHistory();
        };
        document.getElementById('historyPrev').onclick = () => {
            currentMonths.history = changeMonth(currentMonths.history, -1);
            document.getElementById('historyMonth').value = currentMonths.history;
            this.loadHistory();
        };
        document.getElementById('historyNext').onclick = () => {
            currentMonths.history = changeMonth(currentMonths.history, 1);
            document.getElementById('historyMonth').value = currentMonths.history;
            this.loadHistory();
        };
    }

    async loadCustomBrands() {
        const doc = await db.collection('customBrands').doc(this.user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            this.customBrands = data.brands || { chips: {}, croutons: {} };
        }
    }

    async loadData() {
        await Promise.all([
            this.loadMyStats(),
            this.loadTopUsers(),
            this.loadFriendsList(),
            this.loadHistory(),
            this.renderCharts()
        ]);
    }

    async loadMyStats() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const snapshot = await db.collection('entries')
            .where('userId', '==', this.user.uid)
            .where('date', '>=', monthAgo.toISOString().split('T')[0])
            .get();

        let todayTotal = 0;
        let weekTotal = 0;
        let monthTotal = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const grams = data.grams;
            monthTotal += grams;

            if (data.date >= weekAgo.toISOString().split('T')[0]) {
                weekTotal += grams;
            }

            if (data.date === today) {
                todayTotal += grams;
            }
        });

        document.getElementById('myTodayCount').textContent = todayTotal + 'г';
        document.getElementById('myWeekCount').textContent = weekTotal + 'г';
        document.getElementById('myMonthCount').textContent = monthTotal + 'г';
    }

    async loadTopUsers() {
        const friends = this.profile.friends || [];
        const userIds = [this.user.uid, ...friends];

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const snapshot = await db.collection('entries')
            .where('userId', 'in', userIds.slice(0, 10))
            .where('date', '>=', monthAgo.toISOString().split('T')[0])
            .get();

        const userTotals = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            if (!userTotals[data.userId]) {
                userTotals[data.userId] = {
                    userId: data.userId,
                    username: data.username,
                    photoURL: data.userPhotoURL,
                    total: 0
                };
            }
            userTotals[data.userId].total += data.grams;
        });

        const topUsers = Object.values(userTotals)
            .sort((a, b) => b.total - a.total);

        if (topUsers.length === 0) {
            document.getElementById('topUsers').innerHTML = '<p class="text-xs text-gray-400 text-center py-2">Добавьте друзей</p>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];

        document.getElementById('topUsers').innerHTML = topUsers.map((user, index) => {
            const medal = index < 3 ? medals[index] : `${index + 1}.`;
            const isMe = user.userId === this.user.uid;

            return `
                <div class="top-item flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-yellow-50 border border-primary' : 'bg-gray-50'}">
                    <span class="text-lg w-6">${medal}</span>
                    <img src="${user.photoURL}" class="w-8 h-8 rounded-full object-cover">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-text truncate">${user.username}</p>
                    </div>
                    <p class="text-sm font-bold text-primary">${user.total}г</p>
                </div>
            `;
        }).join('');

        // Show/hide toggle button
        if (topUsers.length > 3) {
            document.getElementById('toggleTopBtn').style.display = 'block';
        } else {
            document.getElementById('toggleTopBtn').style.display = 'none';
        }
    }

    async loadFriendsList() {
        const friends = this.profile.friends || [];

        if (friends.length === 0) {
            document.getElementById('friendsList').innerHTML = '<p class="text-xs text-gray-400 text-center py-2">Нет друзей</p>';
            return;
        }

        const friendsData = await Promise.all(
            friends.slice(0, 10).map(async (friendId) => {
                const doc = await db.collection('users').doc(friendId).get();
                return doc.exists ? { id: friendId, ...doc.data() } : null;
            })
        );

        const validFriends = friendsData.filter(f => f !== null);

        document.getElementById('friendsList').innerHTML = validFriends.map(friend => `
            <div class="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                <img src="${friend.photoURL}" class="w-6 h-6 rounded-full object-cover">
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-text truncate">${friend.username}</p>
                </div>
                <button onclick="app.removeFriend('${friend.id}')" class="text-red-500 text-sm">✕</button>
            </div>
        `).join('');

        if (friends.length > 10) {
            document.getElementById('friendsList').innerHTML += '<p class="text-xs text-gray-500 text-center mt-1">+ещё ' + (friends.length - 10) + '</p>';
        }
    }

    async loadHistory() {
        const [year, month] = currentMonths.history.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const snapshot = await db.collection('entries')
            .where('userId', '==', this.user.uid)
            .where('date', '>=', startDate.toISOString().split('T')[0])
            .where('date', '<=', endDate.toISOString().split('T')[0])
            .get();

        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });

        entries.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

        if (entries.length === 0) {
            document.getElementById('historyList').innerHTML = '<p class="text-xs text-gray-400 text-center py-2">Записей нет</p>';
            return;
        }

        document.getElementById('historyList').innerHTML = entries.map(entry => {
            const date = entry.timestamp.toDate();
            const formatted = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-yellow-50 transition">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                        <div class="text-xl">${entry.emoji || '🍟'}</div>
                        <div class="min-w-0 flex-1">
                            <p class="text-xs font-semibold text-text truncate">${entry.grams}г • ${entry.name}</p>
                            <p class="text-xs text-gray-500">${formatted}</p>
                        </div>
                    </div>
                    <button onclick="app.deleteEntry('${entry.id}')" class="text-gray-400 hover:text-red-500 ml-2 text-lg">🗑</button>
                </div>
            `;
        }).join('');
    }

    async renderCharts() {
        await this.renderMyChart();
        await this.renderComparisonChart();
    }

    async renderMyChart() {
        const [year, month] = currentMonths.myChart.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month - 1, i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: i.toString(),
                total: 0
            });
        }

        const snapshot = await db.collection('entries')
            .where('userId', '==', this.user.uid)
            .where('date', '>=', days[0].date)
            .where('date', '<=', days[days.length - 1].date)
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const day = days.find(d => d.date === data.date);
            if (day) day.total += data.grams;
        });

        const ctx = document.getElementById('myChart');
        if (this.charts.my) this.charts.my.destroy();

        this.charts.my = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(d => d.label),
                datasets: [{
                    label: 'Грамм',
                    data: days.map(d => d.total),
                    borderColor: '#FF9900',
                    backgroundColor: 'rgba(255, 153, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            callback: v => v + 'г',
                            font: { size: 10 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 },
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }

    async renderComparisonChart() {
        const friends = this.profile.friends || [];
        const userIds = [this.user.uid, ...friends].slice(0, 5);

        const [year, month] = currentMonths.compChart.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month - 1, i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: i.toString(),
                users: {}
            });
        }

        const snapshot = await db.collection('entries')
            .where('userId', 'in', userIds)
            .where('date', '>=', days[0].date)
            .where('date', '<=', days[days.length - 1].date)
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const day = days.find(d => d.date === data.date);
            if (day) {
                if (!day.users[data.userId]) {
                    day.users[data.userId] = {
                        username: data.username,
                        total: 0
                    };
                }
                day.users[data.userId].total += data.grams;
            }
        });

        const allUsers = new Set();
        days.forEach(day => {
            Object.keys(day.users).forEach(userId => allUsers.add(userId));
        });

        const colors = ['#FF9900', '#3366FF', '#00CC66', '#F59E0B', '#EF4444'];
        const datasets = Array.from(allUsers).map((userId, index) => {
            const username = days.find(d => d.users[userId])?.users[userId]?.username || 'User';
            return {
                label: username,
                data: days.map(d => d.users[userId]?.total || 0),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 1
            };
        });

        const ctx = document.getElementById('comparisonChart');
        if (this.charts.comparison) this.charts.comparison.destroy();

        this.charts.comparison = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.map(d => d.label),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { 
                            boxWidth: 10, 
                            font: { size: 9 },
                            padding: 8
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            callback: v => v + 'г',
                            font: { size: 10 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 },
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }

    // ==========================================
    // MANAGE BRANDS (продолжение в след. сообщении)
    // ==========================================

    openManageBrands() {
        document.getElementById('manageBrandsModal').classList.remove('hidden');
        this.renderPresets('chips');
    }

    closeManageBrands() {
        document.getElementById('manageBrandsModal').classList.add('hidden');
    }

    switchPresetTab(tab) {
        document.querySelectorAll('.preset-tab').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('border-primary', 'text-primary');
                btn.classList.remove('border-transparent', 'text-gray-600');
            } else {
                btn.classList.remove('border-primary', 'text-primary');
                btn.classList.add('border-transparent', 'text-gray-600');
            }
        });

        document.querySelectorAll('.preset-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(tab + 'Presets').classList.remove('hidden');

        this.renderPresets(tab);
    }

    renderPresets(category) {
        const allBrands = this.getAllBrands(category);
        const container = document.getElementById(category + 'PresetsList');

        container.innerHTML = Object.entries(allBrands).map(([key, brand]) => {
            const isCustom = key.startsWith('custom_');
            const flavorsText = Object.values(brand.flavors).map(f => f.name).join(', ');

            return `
                <div class="bg-gray-50 rounded-xl p-3 border-2 border-gray-200">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-2 flex-1">
                            <span class="text-xl">${brand.emoji}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-text text-sm">${brand.name}</p>
                                <p class="text-xs text-gray-500 truncate">${flavorsText}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="app.editBrand('${category}', '${key}')" class="text-primary text-lg">✏️</button>
                            ${isCustom ? `<button onclick="app.deleteBrand('${category}', '${key}')" class="text-red-500 text-lg">🗑</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openAddPreset(category) {
        this.editingBrandKey = null;
        this.editingBrandCategory = category;
        document.getElementById('editBrandModal').classList.remove('hidden');
        document.getElementById('editBrandName').value = '';
        document.getElementById('editBrandEmoji').value = '';
        document.getElementById('editBrandFlavors').value = '';
    }

    editBrand(category, brandKey) {
        this.editingBrandKey = brandKey;
        this.editingBrandCategory = category;

        const brands = this.getAllBrands(category);
        const brand = brands[brandKey];

        document.getElementById('editBrandName').value = brand.name;
        document.getElementById('editBrandEmoji').value = brand.emoji;
        document.getElementById('editBrandFlavors').value = Object.values(brand.flavors).map(f => f.name).join(', ');

        document.getElementById('editBrandModal').classList.remove('hidden');
    }

    closeEditBrand() {
        document.getElementById('editBrandModal').classList.add('hidden');
    }

    async saveEditedBrand() {
        const name = document.getElementById('editBrandName').value.trim();
        const emoji = document.getElementById('editBrandEmoji').value.trim() || '🍟';
        const flavorsText = document.getElementById('editBrandFlavors').value.trim();

        if (!name || !flavorsText) {
            if (window.tgApp) {
                window.tgApp.showAlert('Заполните все поля');
            } else {
                alert('Заполните все поля');
            }
            return;
        }

        const flavors = {};
        flavorsText.split(',').forEach((flavor, index) => {
            const trimmed = flavor.trim();
            if (trimmed) {
                flavors[`flavor_${index}`] = {
                    name: trimmed,
                    emoji: '🍽️'
                };
            }
        });

        const brandKey = this.editingBrandKey || `custom_${Date.now()}`;
        
        if (!this.customBrands[this.editingBrandCategory]) {
            this.customBrands[this.editingBrandCategory] = {};
        }

        this.customBrands[this.editingBrandCategory][brandKey] = {
            name: name,
            emoji: emoji,
            flavors: flavors
        };

        await db.collection('customBrands').doc(this.user.uid).set({
            brands: this.customBrands
        });

        this.closeEditBrand();
        this.renderPresets(this.editingBrandCategory);
        this.renderChipsBrands();
        this.renderCroutonsBrands();
        this.showToast('✅ Сохранено!');
    }

    async deleteBrand(category, brandKey) {
        const confirmed = await new Promise(resolve => {
            if (window.tgApp) {
                window.tgApp.showConfirm('Удалить этот бренд?', resolve);
            } else {
                resolve(confirm('Удалить этот бренд?'));
            }
        });

        if (!confirmed) return;

        delete this.customBrands[category][brandKey];

        await db.collection('customBrands').doc(this.user.uid).set({
            brands: this.customBrands
        });

        this.renderPresets(category);
        this.renderChipsBrands();
        this.renderCroutonsBrands();
        this.showToast('🗑️ Удалено');
    }

    // ==========================================
    // FRIENDS (продолжение в след. сообщении)
    // ==========================================

    openAddFriend() {
        document.getElementById('addFriendModal').classList.remove('hidden');
        document.getElementById('friendSearchInput').value = '';
        document.getElementById('friendSearchResult').innerHTML = '';
    }

    closeAddFriend() {
        document.getElementById('addFriendModal').classList.add('hidden');
    }

    async searchFriend() {
        const query = document.getElementById('friendSearchInput').value.trim().toLowerCase();
        if (!query) return;

        const resultDiv = document.getElementById('friendSearchResult');
        resultDiv.innerHTML = '<p class="text-xs text-gray-500">Поиск...</p>';

        let user = null;

        const usernameQuery = await db.collection('users').where('username', '==', query).limit(1).get();
        if (!usernameQuery.empty) {
            user = { id: usernameQuery.docs[0].id, ...usernameQuery.docs[0].data() };
        }

        if (!user) {
            const emailQuery = await db.collection('users').where('email', '==', query).limit(1).get();
            if (!emailQuery.empty) {
                user = { id: emailQuery.docs[0].id, ...emailQuery.docs[0].data() };
            }
        }

        if (!user) {
            resultDiv.innerHTML = '<p class="text-xs text-red-500">Не найден</p>';
            return;
        }

        if (user.id === this.user.uid) {
            resultDiv.innerHTML = '<p class="text-xs text-red-500">Это вы!</p>';
            return;
        }

        if ((this.profile.friends || []).includes(user.id)) {
            resultDiv.innerHTML = '<p class="text-xs text-red-500">Уже друг</p>';
            return;
        }

        resultDiv.innerHTML = `
            <div class="border-2 border-primary rounded-xl p-3 bg-yellow-50">
                <div class="flex items-center gap-2 mb-2">
                    <img src="${user.photoURL}" class="w-10 h-10 rounded-full object-cover">
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-text text-sm truncate">${user.username}</p>
                        <p class="text-xs text-gray-600 truncate">${user.email}</p>
                    </div>
                </div>
                <button onclick="app.addFriend('${user.id}')" class="w-full bg-primary text-white font-bold py-2 rounded-lg text-sm">
                    Добавить
                </button>
            </div>
        `;
    }

    async addFriend(friendId) {
        const friends = this.profile.friends || [];
        friends.push(friendId);

        await db.collection('users').doc(this.user.uid).update({ friends });

        this.profile.friends = friends;
        document.getElementById('friendSearchInput').value = '';
        document.getElementById('friendSearchResult').innerHTML = '';
        this.loadData();
        this.showToast('✅ Друг добавлен!');
    }

    async removeFriend(friendId) {
        const confirmed = await new Promise(resolve => {
            if (window.tgApp) {
                window.tgApp.showConfirm('Удалить?', resolve);
            } else {
                resolve(confirm('Удалить?'));
            }
        });

        if (!confirmed) return;

        const friends = (this.profile.friends || []).filter(id => id !== friendId);
        await db.collection('users').doc(this.user.uid).update({ friends });

        this.profile.friends = friends;
        this.loadData();
        this.showToast('🗑️ Удалён');
    }

    // ==========================================
    // EDIT PROFILE
    // ==========================================

    openEditProfile() {
        document.getElementById('editProfileModal').classList.remove('hidden');
        document.getElementById('editUsernameInput').value = this.profile.username;
        document.getElementById('editEmailDisplay').value = this.profile.email;
        document.getElementById('editProfilePreview').src = this.profile.photoURL;
    }

    closeEditProfile() {
        document.getElementById('editProfileModal').classList.add('hidden');
    }

    async saveEditProfile() {
        const username = document.getElementById('editUsernameInput').value.trim().toLowerCase();

        if (!username || !/^[a-z0-9_]+$/.test(username)) {
            if (window.tgApp) {
                window.tgApp.showAlert('Ник: латиница, цифры, _');
            } else {
                alert('Ник: латиница, цифры, _');
            }
            return;
        }

        if (username !== this.profile.username) {
            const usernameQuery = await db.collection('users')
                .where('username', '==', username)
                .get();

            if (!usernameQuery.empty) {
                if (window.tgApp) {
                    window.tgApp.showAlert('Ник занят');
                } else {
                    alert('Ник занят');
                }
                return;
            }
        }

        const photoFile = document.getElementById('editPhotoInput').files[0];
        let photoURL = this.profile.photoURL;

        if (photoFile) {
            const storageRef = storage.ref(`avatars/${this.user.uid}`);
            await storageRef.put(photoFile);
            photoURL = await storageRef.getDownloadURL();
        }

        await db.collection('users').doc(this.user.uid).update({
            username: username,
            photoURL: photoURL
        });

        this.showToast('✅ Сохранено!');
        setTimeout(() => location.reload(), 1000);
    }

    // ==========================================
    // ADD SNACK (Mobile Optimized)
    // ==========================================

    openAddModal() {
        currentSelection = { category: null, brand: null, flavor: null, size: null };
        document.getElementById('addModal').classList.remove('hidden');
        document.getElementById('customGrams').value = '';
        
        const now = new Date();
        document.getElementById('dateTimeInput').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);

        this.switchTab('chips');
        this.updateSummary();
    }

    closeAddModal() {
        document.getElementById('addModal').classList.add('hidden');
    }

    switchTab(tab) {
        currentSelection.category = tab;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('border-primary', 'text-primary');
                btn.classList.remove('border-transparent', 'text-gray-600');
            } else {
                btn.classList.remove('border-primary', 'text-primary');
                btn.classList.add('border-transparent', 'text-gray-600');
            }
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(tab + 'Tab').classList.remove('hidden');

        this.resetSelection();
    }

    resetSelection() {
        currentSelection.brand = null;
        currentSelection.flavor = null;
        currentSelection.size = null;
        
        document.getElementById('chipsFlavorsSection').classList.add('hidden');
        document.getElementById('chipsSizesSection').classList.add('hidden');
        document.getElementById('croutonsFlavorsSection').classList.add('hidden');
        document.getElementById('croutonsSizesSection').classList.add('hidden');
        
        this.updateSummary();
    }

    getAllBrands(category) {
        return { ...DEFAULT_SNACKS[category].brands, ...this.customBrands[category] };
    }

    renderChipsBrands() {
        const container = document.getElementById('chipsBrands');
        const brands = this.getAllBrands('chips');
        
        container.innerHTML = Object.entries(brands).map(([key, brand]) => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectBrand('chips', '${key}')">
                <div class="text-2xl mb-1">${brand.emoji}</div>
                <div class="text-xs font-semibold truncate">${brand.name}</div>
            </button>
        `).join('');
    }

    renderCroutonsBrands() {
        const container = document.getElementById('croutonsBrands');
        const brands = this.getAllBrands('croutons');
        
        container.innerHTML = Object.entries(brands).map(([key, brand]) => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectBrand('croutons', '${key}')">
                <div class="text-2xl mb-1">${brand.emoji}</div>
                <div class="text-xs font-semibold truncate">${brand.name}</div>
            </button>
        `).join('');
    }

    selectBrand(category, brandKey) {
        currentSelection.brand = brandKey;
        currentSelection.flavor = null;
        currentSelection.size = null;

        const brands = this.getAllBrands(category);
        const brand = brands[brandKey];
        const flavorsContainer = document.getElementById(category + 'Flavors');
        
        flavorsContainer.innerHTML = Object.entries(brand.flavors).map(([key, flavor]) => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectFlavor('${category}', '${key}')">
                <div class="text-xl mb-1">${flavor.emoji}</div>
                <div class="text-xs font-semibold truncate">${flavor.name}</div>
            </button>
        `).join('');

        document.getElementById(category + 'FlavorsSection').classList.remove('hidden');
        document.getElementById(category + 'SizesSection').classList.add('hidden');
        
        this.updateSummary();
    }

    selectFlavor(category, flavorKey) {
        currentSelection.flavor = flavorKey;
        currentSelection.size = null;

        const sizesContainer = document.getElementById(category + 'Sizes');
        sizesContainer.innerHTML = DEFAULT_SNACKS[category].sizes.map(size => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectSize(${size.grams})">
                <div class="text-xl mb-1">${size.emoji}</div>
                <div class="font-bold text-primary text-sm">${size.grams}г</div>
                <div class="text-xs text-gray-600">${size.label}</div>
            </button>
        `).join('');

        document.getElementById(category + 'SizesSection').classList.remove('hidden');
        
        this.updateSummary();
    }

    selectSize(grams) {
        currentSelection.size = grams;
        document.getElementById('customGrams').value = grams;
        this.updateSummary();
    }

    updateSummary() {
        const { category, brand, flavor, size } = currentSelection;

        if (!category || !brand || !flavor) {
            document.getElementById('selectionSummary').classList.add('hidden');
            return;
        }

        const brands = this.getAllBrands(category);
        const brandData = brands[brand];
        const flavorData = brandData.flavors[flavor];
        const sizeText = size ? ` • ${size}г` : '';

        document.getElementById('summaryText').textContent = 
            `${brandData.emoji} ${brandData.name} ${flavorData.emoji} ${flavorData.name}${sizeText}`;
        document.getElementById('selectionSummary').classList.remove('hidden');
    }

    async saveSnack() {
        const grams = parseInt(document.getElementById('customGrams').value);
        const dateTime = document.getElementById('dateTimeInput').value;

        if (!grams || grams <= 0) {
            if (window.tgApp) {
                window.tgApp.showAlert('Введите граммы');
            } else {
                alert('Введите граммы');
            }
            return;
        }

        if (!currentSelection.brand || !currentSelection.flavor) {
            if (window.tgApp) {
                window.tgApp.showAlert('Выберите снек');
            } else {
                alert('Выберите снек');
            }
            return;
        }

        const brands = this.getAllBrands(currentSelection.category);
        const brandData = brands[currentSelection.brand];
        const flavorData = brandData.flavors[currentSelection.flavor];

        const entry = {
            userId: this.user.uid,
            username: this.profile.username,
            userPhotoURL: this.profile.photoURL,
            category: currentSelection.category,
            brand: currentSelection.brand,
            flavor: currentSelection.flavor,
            grams: grams,
            name: `${brandData.name} ${flavorData.name}`,
            emoji: brandData.emoji,
            date: dateTime.split('T')[0],
            timestamp: firebase.firestore.Timestamp.fromDate(new Date(dateTime))
        };

        try {
            await db.collection('entries').add(entry);
            this.closeAddModal();
            await this.loadData();
            this.showToast(`✅ ${grams}г добавлено!`);
        } catch (error) {
            console.error('Error:', error);
            if (window.tgApp) {
                window.tgApp.showAlert('Ошибка: ' + error.message);
            } else {
                alert('Ошибка: ' + error.message);
            }
        }
    }

    async deleteEntry(id) {
        const confirmed = await new Promise(resolve => {
            if (window.tgApp) {
                window.tgApp.showConfirm('Удалить?', resolve);
            } else {
                resolve(confirm('Удалить?'));
            }
        });

        if (confirmed) {
            await db.collection('entries').doc(id).delete();
            this.loadData();
            this.showToast('🗑️ Удалено');
        }
    }

    showToast(message) {
        if (isTelegramApp && window.tgApp) {
            window.tgApp.hapticFeedback('light');
        }
        
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm animate-fade-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 2000);
    }
}

// ==========================================
// INIT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
