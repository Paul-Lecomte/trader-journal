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

        // Format the trade time
        const formattedTradeTime = formatTime(trade.tradeTime);

        row.innerHTML = `
      <td>${trade.symbol}</td>
      <td>${trade.side}</td>
      <td>${trade.type}</td>
      <td>${trade.qty}</td>
      <td>${trade.avgPrice}</td>
      <td>${trade.status}</td>
      <td>${trade.orderId}</td>
      <td>${formattedTradeTime}</td>
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

// Initialize the app
function init() {
    fetchTrades().then((trades) => {
        renderTradeHistory(trades);
        createWinLossChart(trades);
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