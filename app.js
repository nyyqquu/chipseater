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
// SNACK DATABASE
// ==========================================

const SNACKS_DATABASE = {
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

// ==========================================
// UTILS
// ==========================================

function showRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('quoteText').textContent = quote;
}

// ==========================================
// AUTH MANAGER
// ==========================================

class AuthManager {
    constructor() {
        this.initAuthListener();
    }

    initAuthListener() {
        auth.onAuthStateChanged(user => {
            if (user) {
                this.handleLogin(user);
            } else {
                this.showLoginScreen();
            }
        });
    }

    async handleLogin(user) {
        currentUser = user;
        const profileDoc = await db.collection('users').doc(user.uid).get();

        if (!profileDoc.exists) {
            this.showProfileSetup(user);
        } else {
            document.getElementById('loginScreen').style.display = 'none';
            window.app = new CrispTrackerApp(user, profileDoc.data());
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('googleLoginBtn').onclick = () => this.loginWithGoogle();
    }

    async loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                await auth.signInWithRedirect(provider);
            } else {
                console.error('Login error:', error);
                alert('Ошибка входа: ' + error.message);
            }
        }
    }

    showProfileSetup(user) {
        document.getElementById('loginScreen').style.display = 'none';
        const modal = document.getElementById('profileSetupModal');
        modal.classList.remove('hidden');

        document.getElementById('emailDisplay').value = user.email;
        document.getElementById('profilePreview').src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email);

        document.getElementById('changePhotoBtn').onclick = () => {
            document.getElementById('photoInput').click();
        };

        document.getElementById('photoInput').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('profilePreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        document.getElementById('saveProfileBtn').onclick = () => this.saveProfile(user);
    }

    async saveProfile(user) {
        const username = document.getElementById('usernameInput').value.trim().toLowerCase();

        if (!username || !/^[a-z0-9_]+$/.test(username)) {
            alert('Ник должен содержать только латиницу, цифры и _');
            return;
        }

        const usernameQuery = await db.collection('users')
            .where('username', '==', username)
            .get();

        if (!usernameQuery.empty && usernameQuery.docs[0].id !== user.uid) {
            alert('Этот ник уже занят');
            return;
        }

        const photoFile = document.getElementById('photoInput').files[0];
        let photoURL = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username);

        if (photoFile) {
            const storageRef = storage.ref(`avatars/${user.uid}`);
            await storageRef.put(photoFile);
            photoURL = await storageRef.getDownloadURL();
        }

        await db.collection('users').doc(user.uid).set({
            username: username,
            email: user.email,
            photoURL: photoURL,
            friends: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        location.reload();
    }

    async logout() {
        if (confirm('Выйти из аккаунта?')) {
            await auth.signOut();
            location.reload();
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
        this.initUI();
        this.loadCustomBrands();
        this.loadData();
    }

    initUI() {
        document.getElementById('headerAvatar').src = this.profile.photoURL;

        // Buttons
        document.getElementById('addBtn').onclick = () => this.openAddModal();
        document.getElementById('closeModal').onclick = () => this.closeAddModal();
        document.getElementById('profileBtn').onclick = () => this.openEditProfile();
        document.getElementById('friendsBtn').onclick = () => this.openFriendsModal();
        document.getElementById('closeFriendsModal').onclick = () => this.closeFriendsModal();
        document.getElementById('searchFriendBtn').onclick = () => this.searchFriend();
        document.getElementById('saveSnackBtn').onclick = () => this.saveSnack();
        document.getElementById('newQuoteBtn').onclick = () => showRandomQuote();
        document.getElementById('logoutBtn').onclick = () => new AuthManager().logout();

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

        // Add brand
        document.getElementById('addChipsBrandBtn').onclick = () => this.openAddBrand('chips');
        document.getElementById('addCroutonsBrandBtn').onclick = () => this.openAddBrand('croutons');
        document.getElementById('cancelBrandBtn').onclick = () => this.closeAddBrand();
        document.getElementById('saveBrandBtn').onclick = () => this.saveCustomBrand();

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => this.switchTab(btn.dataset.tab);
        });

        this.renderChipsBrands();
        this.renderCroutonsBrands();
        showRandomQuote();

        lucide.createIcons();
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
            this.loadTopUsers(),
            this.loadHistory(),
            this.renderCharts()
        ]);
    }

    async loadTopUsers() {
        const friends = this.profile.friends || [];
        const userIds = [this.user.uid, ...friends];

        document.getElementById('friendsBadge').textContent = friends.length;
        if (friends.length > 0) {
            document.getElementById('friendsBadge').classList.remove('hidden');
        }

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
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        if (topUsers.length === 0) {
            document.getElementById('topUsers').innerHTML = '<p class="text-sm text-gray-400 w-full text-center py-4">Добавьте друзей</p>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];

        document.getElementById('topUsers').innerHTML = topUsers.map((user, index) => {
            const medal = index < 3 ? medals[index] : '';
            const isMe = user.userId === this.user.uid;

            return `
                <div class="flex-shrink-0 bg-${isMe ? 'yellow-50 border-2 border-primary' : 'gray-50'} rounded-xl p-3 min-w-[140px]">
                    <div class="flex items-center gap-2 mb-2">
                        <img src="${user.photoURL}" class="w-10 h-10 rounded-full object-cover">
                        <span class="text-xl">${medal}</span>
                    </div>
                    <p class="text-sm font-bold text-text truncate">${user.username}</p>
                    <p class="text-xs text-gray-600">${user.total}г</p>
                </div>
            `;
        }).join('');
    }

    async loadHistory() {
        const snapshot = await db.collection('entries')
            .where('userId', '==', this.user.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });

        if (entries.length === 0) {
            document.getElementById('historyList').innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Записей нет</p>';
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
                <div class="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-yellow-50 transition">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="text-2xl">${entry.emoji || '🍟'}</div>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-semibold text-text truncate">${entry.grams}г • ${entry.name}</p>
                            <p class="text-xs text-gray-500">${formatted}</p>
                        </div>
                    </div>
                    <button onclick="app.deleteEntry('${entry.id}')" class="text-gray-400 hover:text-red-500 ml-2">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    async renderCharts() {
        await this.renderMyChart();
        await this.renderComparisonChart();
    }

    async renderMyChart() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: date.getDate().toString(),
                total: 0
            });
        }

        const snapshot = await db.collection('entries')
            .where('userId', '==', this.user.uid)
            .where('date', '>=', days[0].date)
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
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: v => v + 'г' }
                    }
                }
            }
        });
    }

    async renderComparisonChart() {
        const friends = this.profile.friends || [];
        const userIds = [this.user.uid, ...friends].slice(0, 5);

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: date.getDate().toString(),
                users: {}
            });
        }

        const snapshot = await db.collection('entries')
            .where('userId', 'in', userIds)
            .where('date', '>=', days[0].date)
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
                pointRadius: 3
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
                        labels: { boxWidth: 12, font: { size: 10 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: v => v + 'г' }
                    }
                }
            }
        });
    }

    // ==========================================
    // FRIENDS
    // ==========================================

    openFriendsModal() {
        document.getElementById('friendsModal').classList.remove('hidden');
        this.loadFriendsList();
    }

    closeFriendsModal() {
        document.getElementById('friendsModal').classList.add('hidden');
    }

    async loadFriendsList() {
        const friends = this.profile.friends || [];

        if (friends.length === 0) {
            document.getElementById('friendsList').innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Нет друзей</p>';
            return;
        }

        const friendsData = await Promise.all(
            friends.map(async (friendId) => {
                const doc = await db.collection('users').doc(friendId).get();
                return doc.exists ? { id: friendId, ...doc.data() } : null;
            })
        );

        const validFriends = friendsData.filter(f => f !== null);

        document.getElementById('friendsList').innerHTML = validFriends.map(friend => `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                <img src="${friend.photoURL}" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-text truncate">${friend.username}</p>
                    <p class="text-xs text-gray-500 truncate">${friend.email}</p>
                </div>
                <button onclick="app.removeFriend('${friend.id}')" class="text-red-500 hover:text-red-600">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `).join('');

        lucide.createIcons();
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
                <button onclick="app.addFriend('${user.id}')" class="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-sm">
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
        this.loadFriendsList();
        this.loadData();
        this.showToast('✅ Друг добавлен!');
    }

    async removeFriend(friendId) {
        if (!confirm('Удалить?')) return;

        const friends = (this.profile.friends || []).filter(id => id !== friendId);
        await db.collection('users').doc(this.user.uid).update({ friends });

        this.profile.friends = friends;
        this.loadFriendsList();
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
        lucide.createIcons();
    }

    closeEditProfile() {
        document.getElementById('editProfileModal').classList.add('hidden');
    }

    async saveEditProfile() {
        const username = document.getElementById('editUsernameInput').value.trim().toLowerCase();

        if (!username || !/^[a-z0-9_]+$/.test(username)) {
            alert('Ник: латиница, цифры, _');
            return;
        }

        if (username !== this.profile.username) {
            const usernameQuery = await db.collection('users')
                .where('username', '==', username)
                .get();

            if (!usernameQuery.empty) {
                alert('Ник занят');
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
    // ADD SNACK
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
        return { ...SNACKS_DATABASE[category].brands, ...this.customBrands[category] };
    }

    renderChipsBrands() {
        const container = document.getElementById('chipsBrands');
        const brands = this.getAllBrands('chips');
        
        container.innerHTML = Object.entries(brands).map(([key, brand]) => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectBrand('chips', '${key}')">
                <div class="text-xl mb-1">${brand.emoji}</div>
                <div class="text-xs font-semibold truncate">${brand.name}</div>
            </button>
        `).join('');
    }

    renderCroutonsBrands() {
        const container = document.getElementById('croutonsBrands');
        const brands = this.getAllBrands('croutons');
        
        container.innerHTML = Object.entries(brands).map(([key, brand]) => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectBrand('croutons', '${key}')">
                <div class="text-xl mb-1">${brand.emoji}</div>
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
                <div class="text-lg mb-1">${flavor.emoji}</div>
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
        sizesContainer.innerHTML = SNACKS_DATABASE[category].sizes.map(size => `
            <button type="button" class="p-3 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-yellow-50 transition text-center active:scale-95" onclick="app.selectSize(${size.grams})">
                <div class="text-lg mb-1">${size.emoji}</div>
                <div class="font-bold text-primary">${size.grams}г</div>
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
            alert('Введите граммы');
            return;
        }

        if (!currentSelection.brand || !currentSelection.flavor) {
            alert('Выберите снек');
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
            alert('Ошибка: ' + error.message);
        }
    }

    async deleteEntry(id) {
        if (confirm('Удалить?')) {
            await db.collection('entries').doc(id).delete();
            this.loadData();
            this.showToast('🗑️ Удалено');
        }
    }

    // ==========================================
    // CUSTOM BRANDS
    // ==========================================

    openAddBrand(category) {
        this.currentBrandCategory = category;
        document.getElementById('addBrandModal').classList.remove('hidden');
        document.getElementById('newBrandName').value = '';
        document.getElementById('newBrandEmoji').value = '';
        document.getElementById('newBrandFlavors').value = '';
        lucide.createIcons();
    }

    closeAddBrand() {
        document.getElementById('addBrandModal').classList.add('hidden');
    }

    async saveCustomBrand() {
        const name = document.getElementById('newBrandName').value.trim();
        const emoji = document.getElementById('newBrandEmoji').value.trim() || '🍟';
        const flavorsText = document.getElementById('newBrandFlavors').value.trim();

        if (!name || !flavorsText) {
            alert('Заполните все поля');
            return;
        }

        const flavors = {};
        flavorsText.split(',').forEach((flavor, index) => {
            const trimmed = flavor.trim();
            if (trimmed) {
                flavors[`custom_${index}`] = {
                    name: trimmed,
                    emoji: '🍽️'
                };
            }
        });

        const brandKey = `custom_${Date.now()}`;
        this.customBrands[this.currentBrandCategory][brandKey] = {
            name: name,
            emoji: emoji,
            flavors: flavors
        };

        await db.collection('customBrands').doc(this.user.uid).set({
            brands: this.customBrands
        });

        this.closeAddBrand();
        this.renderChipsBrands();
        this.renderCroutonsBrands();
        this.showToast('✅ Бренд добавлен!');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm';
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
