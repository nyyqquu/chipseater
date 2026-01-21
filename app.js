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
                    sour_cream: { name: "Сметана и зелень", emoji: "🌿" },
                    bacon: { name: "Бекон", emoji: "🥓" },
                    crab: { name: "Краб", emoji: "🦀" }
                }
            },
            pringles: {
                name: "Pringles",
                emoji: "🎯",
                flavors: {
                    original: { name: "Original", emoji: "🥔" },
                    sour_cream: { name: "Sour Cream & Onion", emoji: "🧅" },
                    paprika: { name: "Paprika", emoji: "🌶️" },
                    cheese: { name: "Cheese", emoji: "🧀" },
                    pizza: { name: "Pizza", emoji: "🍕" }
                }
            },
            cheetos: {
                name: "Cheetos",
                emoji: "🧡",
                flavors: {
                    cheese: { name: "Сыр", emoji: "🧀" },
                    flamin_hot: { name: "Flamin' Hot", emoji: "🔥" },
                    ketchup: { name: "Кетчуп", emoji: "🍅" }
                }
            },
            doritos: {
                name: "Doritos",
                emoji: "🔺",
                flavors: {
                    nacho: { name: "Nacho Cheese", emoji: "🧀" },
                    cool_ranch: { name: "Cool Ranch", emoji: "🌿" },
                    chilli: { name: "Chilli", emoji: "🌶️" }
                }
            }
        },
        sizes: [
            { grams: 40, label: "Маленькая", emoji: "📦" },
            { grams: 90, label: "Средняя", emoji: "📦📦" },
            { grams: 150, label: "Большая", emoji: "📦📦📦" },
            { grams: 250, label: "XL", emoji: "📦📦📦📦" }
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
                    cheese: { name: "Сыр", emoji: "🧀" },
                    salami: { name: "Салями", emoji: "🍕" },
                    chicken: { name: "Курица", emoji: "🍗" }
                }
            },
            kirieshki: {
                name: "Кириешки",
                emoji: "🌾",
                flavors: {
                    rye_salt: { name: "Ржаные с солью", emoji: "🧂" },
                    bacon: { name: "Бекон", emoji: "🥓" },
                    salami: { name: "Салями", emoji: "🍕" },
                    chicken: { name: "Курица", emoji: "🍗" }
                }
            },
            flint: {
                name: "Flint",
                emoji: "💎",
                flavors: {
                    garlic: { name: "Чеснок", emoji: "🧄" },
                    cheese: { name: "Сыр", emoji: "🧀" },
                    bacon: { name: "Бекон", emoji: "🥓" },
                    crab: { name: "Краб", emoji: "🦀" }
                }
            }
        },
        sizes: [
            { grams: 60, label: "Маленькая", emoji: "📦" },
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
        console.log('User logged in:', user.email);
        currentUser = user;

        // Check if profile exists
        const profileDoc = await db.collection('users').doc(user.uid).get();

        if (!profileDoc.exists) {
            // Show profile setup
            this.showProfileSetup(user);
        } else {
            // Load app
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
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Login error:', error);
            alert('Ошибка входа: ' + error.message);
        }
    }

    showProfileSetup(user) {
        document.getElementById('loginScreen').style.display = 'none';
        const modal = document.getElementById('profileSetupModal');
        modal.classList.remove('hidden');

        document.getElementById('emailDisplay').value = user.email;
        document.getElementById('profilePreview').src = user.photoURL || 'https://via.placeholder.com/150';

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
        const username = document.getElementById('usernameInput').value.trim();

        if (!username) {
            alert('Пожалуйста, введите ник');
            return;
        }

        // Check if username is taken
        const usernameQuery = await db.collection('users')
            .where('username', '==', username)
            .get();

        if (!usernameQuery.empty && usernameQuery.docs[0].id !== user.uid) {
            alert('Этот ник уже занят');
            return;
        }

        const photoFile = document.getElementById('photoInput').files[0];
        let photoURL = user.photoURL;

        // Upload photo if selected
        if (photoFile) {
            const storageRef = storage.ref(`avatars/${user.uid}`);
            await storageRef.put(photoFile);
            photoURL = await storageRef.getDownloadURL();
        }

        // Save profile
        await db.collection('users').doc(user.uid).set({
            username: username,
            email: user.email,
            photoURL: photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Reload
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
        this.initUI();
        this.loadData();
    }

    initUI() {
        // Update header
        document.getElementById('currentUserName').textContent = `@${this.profile.username}`;
        document.getElementById('headerAvatar').src = this.profile.photoURL || 'https://via.placeholder.com/150';

        // Event listeners
        document.getElementById('addBtn').onclick = () => this.openAddModal();
        document.getElementById('closeModal').onclick = () => this.closeAddModal();
        document.getElementById('logoutBtn').onclick = () => new AuthManager().logout();
        document.getElementById('profileBtn').onclick = () => this.showProfile();

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => this.switchTab(btn.dataset.tab);
        });

        // Initialize tabs
        this.renderChipsBrands();
        this.renderCroutonsBrands();

        lucide.createIcons();
    }

    async loadData() {
        await this.loadMyStats();
        await this.loadLeaderboard();
        await this.loadHistory();
        await this.renderComparisonChart();
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

        document.getElementById('myTodayCount').textContent = todayTotal;
        document.getElementById('myWeekCount').textContent = weekTotal;
        document.getElementById('myMonthCount').textContent = monthTotal;
    }

    async loadLeaderboard() {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const snapshot = await db.collection('entries')
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

        const leaderboard = Object.values(userTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        this.renderLeaderboard(leaderboard);
    }

    renderLeaderboard(leaderboard) {
        const container = document.getElementById('leaderboard');

        if (leaderboard.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-4">Пока нет данных</p>';
            return;
        }

        container.innerHTML = leaderboard.map((user, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = index < 3 ? medals[index] : `${index + 1}.`;
            const isMe = user.userId === this.user.uid;

            return `
                <div class="flex items-center gap-3 p-3 rounded-lg ${isMe ? 'bg-crisp-light border-2 border-crisp-orange' : 'bg-gray-50'}">
                    <span class="text-2xl w-8">${medal}</span>
                    <img src="${user.photoURL || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full object-cover">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">${user.username} ${isMe ? '(Вы)' : ''}</p>
                    </div>
                    <p class="text-xl font-bold text-crisp-dark">${user.total}г</p>
                </div>
            `;
        }).join('');
    }

    async loadHistory() {
        const snapshot = await db.collection('entries')
            .where('userId', '==', this.user.uid)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, ...doc.data() });
        });

        this.renderHistory(entries);
    }

    renderHistory(entries) {
        const container = document.getElementById('historyList');

        if (entries.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-8">Записей пока нет</p>';
            return;
        }

        container.innerHTML = entries.map(entry => {
            const date = entry.timestamp.toDate();
            const formatted = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-crisp-light transition">
                    <div class="flex items-center gap-3">
                        <div class="text-2xl">${entry.emoji || '🍟'}</div>
                        <div>
                            <p class="font-semibold text-gray-800">${entry.grams}г • ${entry.name}</p>
                            <p class="text-sm text-gray-500">${formatted}</p>
                        </div>
                    </div>
                    <button class="delete-btn text-gray-400 hover:text-red-500 transition" onclick="app.deleteEntry('${entry.id}')">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    async renderComparisonChart() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: this.formatDateLabel(date),
                users: {}
            });
        }

        const snapshot = await db.collection('entries')
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

        this.drawComparisonChart(days);
    }

    drawComparisonChart(days) {
        const ctx = document.getElementById('comparisonChart').getContext('2d');

        // Get all unique users
        const allUsers = new Set();
        days.forEach(day => {
            Object.keys(day.users).forEach(userId => allUsers.add(userId));
        });

        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const datasets = Array.from(allUsers).map((userId, index) => {
            const username = days.find(d => d.users[userId])?.users[userId]?.username || 'Unknown';
            return {
                label: username,
                data: days.map(d => d.users[userId]?.total || 0),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                borderWidth: 2,
                borderRadius: 8
            };
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days.map(d => d.label),
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value + 'г'
                        }
                    }
                }
            }
        });
    }

    formatDateLabel(date) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return `${days[date.getDay()]} ${date.getDate()}`;
    }

    // ==========================================
    // ADD SNACK MODAL
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
                btn.classList.add('active', 'border-crisp-orange', 'text-crisp-orange');
                btn.classList.remove('border-transparent', 'text-gray-600');
            } else {
                btn.classList.remove('active', 'border-crisp-orange', 'text-crisp-orange');
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

    renderChipsBrands() {
        const container = document.getElementById('chipsBrands');
        container.innerHTML = Object.entries(SNACKS_DATABASE.chips.brands).map(([key, brand]) => `
            <button class="select-btn p-4 border-2 border-gray-300 rounded-xl hover:border-crisp-orange hover:bg-crisp-light transition text-center" onclick="app.selectBrand('chips', '${key}')">
                <div class="text-3xl mb-2">${brand.emoji}</div>
                <div class="text-sm font-semibold">${brand.name}</div>
            </button>
        `).join('');
    }

    renderCroutonsBrands() {
        const container = document.getElementById('croutonsBrands');
        container.innerHTML = Object.entries(SNACKS_DATABASE.croutons.brands).map(([key, brand]) => `
            <button class="select-btn p-4 border-2 border-gray-300 rounded-xl hover:border-crisp-orange hover:bg-crisp-light transition text-center" onclick="app.selectBrand('croutons', '${key}')">
                <div class="text-3xl mb-2">${brand.emoji}</div>
                <div class="text-sm font-semibold">${brand.name}</div>
            </button>
        `).join('');
    }

    selectBrand(category, brandKey) {
        currentSelection.brand = brandKey;
        currentSelection.flavor = null;
        currentSelection.size = null;

        const brand = SNACKS_DATABASE[category].brands[brandKey];
        const flavorsContainer = document.getElementById(category + 'Flavors');
        
        flavorsContainer.innerHTML = Object.entries(brand.flavors).map(([key, flavor]) => `
            <button class="select-btn p-4 border-2 border-gray-300 rounded-xl hover:border-crisp-orange hover:bg-crisp-light transition text-center" onclick="app.selectFlavor('${category}', '${key}')">
                <div class="text-2xl mb-1">${flavor.emoji}</div>
                <div class="text-xs font-semibold">${flavor.name}</div>
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
            <button class="select-btn p-4 border-2 border-gray-300 rounded-xl hover:border-crisp-orange hover:bg-crisp-light transition text-center" onclick="app.selectSize(${size.grams})">
                <div class="text-2xl mb-1">${size.emoji}</div>
                <div class="font-bold text-crisp-dark">${size.grams}г</div>
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

        const brandData = SNACKS_DATABASE[category].brands[brand];
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
            alert('Введите количество грамм');
            return;
        }

        if (!currentSelection.brand || !currentSelection.flavor) {
            alert('Выберите снек');
            return;
        }

        const brandData = SNACKS_DATABASE[currentSelection.category].brands[currentSelection.brand];
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

        await db.collection('entries').add(entry);

        this.closeAddModal();
        this.loadData();
        this.showToast(`✅ ${entry.name} ${grams}г добавлено`);
    }

    async deleteEntry(id) {
        if (confirm('Удалить запись?')) {
            await db.collection('entries').doc(id).delete();
            this.loadData();
            this.showToast('🗑️ Запись удалена');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 2000);
    }

    showProfile() {
        alert('Профиль: ' + this.profile.username + '\n' + this.profile.email);
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
    
    // Save button handler
    document.getElementById('saveSnackBtn').onclick = () => {
        if (window.app) {
            window.app.saveSnack();
        }
    };

    console.log('🍟 CrispTracker Pro with Firebase initialized!');
});
