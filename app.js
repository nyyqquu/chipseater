class CrispStorage {
    constructor() {
        this.storageKey = 'crispTrackerData';
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    addEntry(grams, dateTime) {
        const data = this.getData();
        const entry = {
            id: Date.now(),
            grams: parseInt(grams),
            dateTime: dateTime,
            date: dateTime.split('T')[0]
        };
        data.push(entry);
        this.saveData(data);
        return entry;
    }

    deleteEntry(id) {
        const data = this.getData();
        const filtered = data.filter(entry => entry.id !== id);
        this.saveData(filtered);
    }

    clearAll() {
        this.saveData([]);
    }
}

class CrispAnalytics {
    constructor(storage) {
        this.storage = storage;
    }

    getTodayTotal() {
        const today = new Date().toISOString().split('T')[0];
        const data = this.storage.getData();
        return data
            .filter(entry => entry.date === today)
            .reduce((sum, entry) => sum + entry.grams, 0);
    }

    getWeekTotal() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const data = this.storage.getData();
        return data
            .filter(entry => new Date(entry.date) >= weekAgo)
            .reduce((sum, entry) => sum + entry.grams, 0);
    }

    getMonthTotal() {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const data = this.storage.getData();
        return data
            .filter(entry => new Date(entry.date) >= monthAgo)
            .reduce((sum, entry) => sum + entry.grams, 0);
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                label: this.formatDateLabel(date),
                total: 0
            });
        }

        const data = this.storage.getData();
        data.forEach(entry => {
            const day = days.find(d => d.date === entry.date);
            if (day) {
                day.total += entry.grams;
            }
        });

        return days;
    }

    getMonthCumulative() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                label: this.formatDateLabel(date),
                daily: 0,
                cumulative: 0
            });
        }

        const data = this.storage.getData();
        data.forEach(entry => {
            const day = days.find(d => d.date === entry.date);
            if (day) {
                day.daily += entry.grams;
            }
        });

        let cumulative = 0;
        days.forEach(day => {
            cumulative += day.daily;
            day.cumulative = cumulative;
        });

        return days;
    }

    formatDateLabel(date) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return `${days[date.getDay()]} ${date.getDate()}`;
    }

    getMostFrequentDay() {
        const data = this.storage.getData();
        if (data.length === 0) return null;

        const dayCount = {};
        const dayNames = ['воскресеньям', 'понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам'];

        data.forEach(entry => {
            const dayOfWeek = new Date(entry.dateTime).getDay();
            dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
        });

        const maxDay = Object.keys(dayCount).reduce((a, b) => 
            dayCount[a] > dayCount[b] ? a : b
        );

        return dayNames[maxDay];
    }

    getInsight() {
        const data = this.storage.getData();
        if (data.length === 0) return null;

        const avgPerDay = this.getMonthTotal() / 30;
        const mostFrequentDay = this.getMostFrequentDay();
        const todayTotal = this.getTodayTotal();

        if (todayTotal > 200) {
            return '🚨 Сегодня вы уже съели больше 200г! Может, пора остановиться?';
        }

        if (avgPerDay > 100) {
            return `📊 В среднем вы едите ${Math.round(avgPerDay)}г чипсов в день. Попробуйте сократить!`;
        }

        if (mostFrequentDay) {
            return `📅 Вы едите чипсы чаще всего по ${mostFrequentDay}`;
        }

        return '✨ Отличная работа! Продолжайте отслеживать свои привычки.';
    }
}

class CrispUI {
    constructor(storage, analytics) {
        this.storage = storage;
        this.analytics = analytics;
        this.charts = {};
        this.initElements();
        this.initEventListeners();
        this.render();
    }

    initElements() {
        this.elements = {
            todayCount: document.getElementById('todayCount'),
            weekCount: document.getElementById('weekCount'),
            monthCount: document.getElementById('monthCount'),
            insightCard: document.getElementById('insightCard'),
            insightText: document.getElementById('insightText'),
            historyList: document.getElementById('historyList'),
            addBtn: document.getElementById('addBtn'),
            modal: document.getElementById('modal'),
            modalContent: document.getElementById('modalContent'),
            closeModal: document.getElementById('closeModal'),
            saveBtn: document.getElementById('saveBtn'),
            gramsInput: document.getElementById('gramsInput'),
            dateTimeInput: document.getElementById('dateTimeInput'),
            quickSelectBtns: document.querySelectorAll('.quick-select'),
            resetBtn: document.getElementById('resetBtn'),
            barChart: document.getElementById('barChart'),
            lineChart: document.getElementById('lineChart')
        };
    }

    initEventListeners() {
        this.elements.addBtn.addEventListener('click', () => this.openModal());
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });

        this.elements.quickSelectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.quickSelectBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.elements.gramsInput.value = btn.dataset.grams;
            });
        });

        this.elements.saveBtn.addEventListener('click', () => this.saveEntry());
        this.elements.resetBtn.addEventListener('click', () => this.resetData());

        this.elements.gramsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEntry();
        });
    }

    openModal() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        this.elements.dateTimeInput.value = localDateTime;
        
        this.elements.gramsInput.value = '';
        this.elements.quickSelectBtns.forEach(b => b.classList.remove('active'));

        this.elements.modal.classList.remove('hidden');
        setTimeout(() => {
            this.elements.modal.classList.add('show');
        }, 10);

        this.elements.gramsInput.focus();
    }

    closeModal() {
        this.elements.modal.classList.remove('show');
        setTimeout(() => {
            this.elements.modal.classList.add('hidden');
        }, 300);
    }

    saveEntry() {
        const grams = parseInt(this.elements.gramsInput.value);
        const dateTime = this.elements.dateTimeInput.value;

        if (!grams || grams <= 0) {
            alert('Пожалуйста, введите количество грамм');
            return;
        }

        if (!dateTime) {
            alert('Пожалуйста, выберите дату и время');
            return;
        }

        this.storage.addEntry(grams, dateTime);
        this.closeModal();
        this.render();

        this.showToast(`✅ Добавлено ${grams}г`);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    resetData() {
        if (confirm('Вы уверены, что хотите удалить все данные?')) {
            this.storage.clearAll();
            this.render();
            this.showToast('🗑️ Данные очищены');
        }
    }

    render() {
        this.renderStats();
        this.renderInsight();
        this.renderHistory();
        this.renderCharts();
    }

    renderStats() {
        this.elements.todayCount.textContent = this.analytics.getTodayTotal();
        this.elements.weekCount.textContent = this.analytics.getWeekTotal();
        this.elements.monthCount.textContent = this.analytics.getMonthTotal();
    }

    renderInsight() {
        const insight = this.analytics.getInsight();
        if (insight) {
            this.elements.insightCard.classList.remove('hidden');
            this.elements.insightText.textContent = insight;
        } else {
            this.elements.insightCard.classList.add('hidden');
        }
    }

    renderHistory() {
        const data = this.storage.getData().sort((a, b) => 
            new Date(b.dateTime) - new Date(a.dateTime)
        );

        if (data.length === 0) {
            this.elements.historyList.innerHTML = '<p class="text-gray-400 text-center py-8">Записей пока нет</p>';
            return;
        }

        this.elements.historyList.innerHTML = data.map(entry => {
            const date = new Date(entry.dateTime);
            const formattedDate = date.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="history-item flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-crisp-yellow rounded-full flex items-center justify-center">
                            <i data-lucide="cookie" class="w-5 h-5 text-crisp-dark"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800">${entry.grams}г</p>
                            <p class="text-sm text-gray-500">${formattedDate}</p>
                        </div>
                    </div>
                    <button class="delete-btn text-gray-400 hover:text-red-500 transition" data-id="${entry.id}">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            `;
        }).join('');

        lucide.createIcons();

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.storage.deleteEntry(id);
                this.render();
                this.showToast('🗑️ Запись удалена');
            });
        });
    }

    renderCharts() {
        this.renderBarChart();
        this.renderLineChart();
    }

    renderBarChart() {
        const data = this.analytics.getLast7Days();
        
        if (this.charts.bar) {
            this.charts.bar.destroy();
        }

        const ctx = this.elements.barChart.getContext('2d');
        this.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'Грамм',
                    data: data.map(d => d.total),
                    backgroundColor: '#FF9A3D',
                    borderColor: '#C65D21',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'г';
                            }
                        }
                    }
                }
            }
        });
    }

    renderLineChart() {
        const data = this.analytics.getMonthCumulative();
        
        if (this.charts.line) {
            this.charts.line.destroy();
        }

        const ctx = this.elements.lineChart.getContext('2d');
        this.charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'Накопленный итог',
                    data: data.map(d => d.cumulative),
                    borderColor: '#E63946',
                    backgroundColor: 'rgba(230, 57, 70, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'г';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const storage = new CrispStorage();
    const analytics = new CrispAnalytics(storage);
    const ui = new CrispUI(storage, analytics);

    console.log('🍟 CrispTracker initialized!');
});
