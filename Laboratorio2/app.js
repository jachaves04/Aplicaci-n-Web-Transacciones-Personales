new Vue({
    el: '#app',
    data: {
        description: '',
        amount: '',
        date: '',
        type: 'income',
        entries: [],
        chart: null,
    },
    created() {
        this.loadEntries();
    },
    methods: {
        addEntry() {
            const newEntry = {
                id: Date.now(),
                description: this.description,
                amount: parseFloat(this.amount),
                type: this.type,
                date: this.date || new Date().toLocaleDateString()  // Usar la fecha ingresada o la fecha actual si no se proporciona
            };
            this.entries.push(newEntry);
            this.description = '';
            this.amount = '';
            this.date = '';
            this.type = 'income';
            this.saveEntries();
            this.updateChart();
        },
        saveEntries() {
            localStorage.setItem('entries', JSON.stringify(this.entries));
        },
        loadEntries() {
            const entries = localStorage.getItem('entries');
            if (entries) {
                this.entries = JSON.parse(entries);
                this.updateChart();
            }
        },
        updateChart() {
            const incomeData = {};
            const expenseData = {};

            this.entries.forEach(entry => {
                const date = entry.date;
                if (entry.type === 'income') {
                    if (!incomeData[date]) incomeData[date] = 0;
                    incomeData[date] += entry.amount;
                } else if (entry.type === 'expense') {
                    if (!expenseData[date]) expenseData[date] = 0;
                    expenseData[date] += entry.amount;
                }
            });

            const labels = Array.from(new Set([...Object.keys(incomeData), ...Object.keys(expenseData)])).sort((a, b) => new Date(a) - new Date(b));

            const incomeDataset = labels.map(label => incomeData[label] || 0);
            const expenseDataset = labels.map(label => expenseData[label] || 0);

            if (this.chart) {
                this.chart.destroy();
            }

            const ctx = document.getElementById('expensesChart').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: incomeDataset,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Gastos',
                            data: expenseDataset,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },
    filters: {
        currency(value) {
            return `$${value.toFixed(2)}`;
        }
    }
});
