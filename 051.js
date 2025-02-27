// Client-side: JavaScript with expense tracking features and data visualization
const Chart = require('chart.js');

let transactions = [];

function addTransaction(description, amount, category) {
    const transaction = { description, amount, category, date: new Date() };
    transactions.push(transaction);
    updateReport();
}

function categorizeExpenses() {
    const categories = {};
    transactions.forEach(transaction => {
        if (!categories[transaction.category]) {
            categories[transaction.category] = 0;
        }
        categories[transaction.category] += transaction.amount;
    });
    return categories;
}

function generateReport() {
    const categories = categorizeExpenses();
    const report = [];
    for (const category in categories) {
        report.push({ category, total: categories[category] });
    }
    return report;
}

function updateReport() {
    const report = generateReport();
    const reportList = document.getElementById('report-list');
    reportList.innerHTML = '';
    report.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.category}: $${item.total.toFixed(2)}`;
        reportList.appendChild(listItem);
    });
    visualizeData();
}

function visualizeData() {
    const categories = Object.keys(categorizeExpenses());
    const amounts = Object.values(categorizeExpenses());
    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses by Category',
                data: amounts,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
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

// Example usage
addTransaction('Groceries', 50, 'Food');
addTransaction('Gas', 30, 'Transportation');
addTransaction('Dinner', 40, 'Food');