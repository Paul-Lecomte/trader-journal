// Fetch trades from Chrome storage
function fetchTrades() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({ trades: [] }, (result) => {
            resolve(result.trades);
        });
    });
}

// Format trade time using Moment.js
function formatTime(timestamp) {
    return moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
}

// Render trade history to the table
function renderTradeHistory(trades) {
    const tableBody = document.getElementById('trade-history-body');
    tableBody.innerHTML = ''; // Clear any existing rows

    trades.forEach(trade => {
        const row = document.createElement('tr');

        // Format trade time and close time
        const formattedTradeTime = formatTime(trade.tradeTime);
        const formattedCloseTime = trade.closeTime ? formatTime(trade.closeTime) : '--';

        // Calculate P/L if available
        const pl = trade.pl ? trade.pl : '--'; // Use P/L value from trade or '--' if not available

        row.innerHTML = `
            <td>${trade.symbol}</td>
            <td>${trade.side}</td>
            <td>${trade.type}</td>
            <td>${trade.qty}</td>
            <td>${trade.priceLimit || '--'}</td>
            <td>${trade.stopPrice || '--'}</td>
            <td>${trade.avgPrice}</td>
            <td>${trade.status}</td>
            <td>${trade.commission || '--'}</td>
            <td>${trade.leverage || '--'}</td>
            <td>${trade.margin || '--'}</td>
            <td>${formattedTradeTime}</td>
            <td>${formattedCloseTime}</td>
            <td>${trade.orderId}</td>
            <td>${pl}</td>
            <td><textarea class="comment" data-order-id="${trade.orderId}" placeholder="Add a comment"></textarea></td>
        `;
        tableBody.appendChild(row);

        // Check if there's a stored comment for this order
        chrome.storage.local.get({ comments: {} }, (result) => {
            const comments = result.comments || {};
            const commentField = row.querySelector('.comment');
            if (comments[trade.orderId]) {
                commentField.value = comments[trade.orderId];
            }
        });

        // Save comments to storage
        const commentField = row.querySelector('.comment');
        commentField.addEventListener('input', (event) => {
            const orderId = event.target.dataset.orderId;
            const comment = event.target.value;

            chrome.storage.local.get({ comments: {} }, (result) => {
                const comments = result.comments || {};
                comments[orderId] = comment;
                chrome.storage.local.set({ comments });
            });
        });
    });
}

// Create Win/Loss chart
function createWinLossChart(trades) {
    // Group trades by status using Lodash (could also be done using simple JS, but Lodash is easier)
    const grouped = _.groupBy(trades, 'status');

    const winCount = (grouped['Completed'] || []).filter(trade => parseFloat(trade.avgPrice) > 0).length;
    const lossCount = trades.length - winCount;

    const ctx = document.getElementById('win-loss-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                data: [winCount, lossCount],
                backgroundColor: ['#4caf50', '#f44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Create Win/Loss chart
function createWinLossChartEvolution(trades) {
    // Sort trades by trade time
    const sortedTrades = trades.sort((a, b) => a.tradeTime - b.tradeTime);

    // Extract labels (dates) and cumulative P/L
    let labels = [];
    let cumulativePL = [];
    let runningTotal = 0;

    sortedTrades.forEach(trade => {
        const tradeDate = moment(trade.tradeTime).format('YYYY-MM-DD'); // Format date
        const pl = parseFloat(trade.pl) || 0; // Use P/L or 0 if missing

        runningTotal += pl; // Update running total
        labels.push(tradeDate);
        cumulativePL.push(runningTotal);
    });

    // Destroy existing chart if it exists (to avoid duplication)
    const ctx = document.getElementById('win-loss-evolution-chart').getContext('2d');
    if (window.winLossEvolutionChart) {
        window.winLossEvolutionChart.destroy();
    }

    // Create line chart for P/L over time
    window.winLossEvolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative P/L',
                data: cumulativePL,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Date' }
                },
                y: {
                    title: { display: true, text: 'Cumulative Profit/Loss' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Initialize the app
function init() {
    fetchTrades().then((trades) => {
        renderTradeHistory(trades);
        createWinLossChart(trades);
        createWinLossChartEvolution(trades);
    });

    // Filter trades by search input
    document.getElementById('filter-button').addEventListener('click', () => {
        const searchInput = document.getElementById('search-input').value.toLowerCase();
        fetchTrades().then((trades) => {
            const filteredTrades = trades.filter(trade => trade.symbol.toLowerCase().includes(searchInput) || trade.orderId.toLowerCase().includes(searchInput));
            renderTradeHistory(filteredTrades);
            createWinLossChart(filteredTrades);
        });
    });
}

// Initialize the app when the document is ready
document.addEventListener('DOMContentLoaded', init);