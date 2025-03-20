// Fetch trades from Chrome storage
function fetchTrades() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({ trades: [] }, (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error fetching trades:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log('Fetched trades:', result.trades); // Log fetched trades
                resolve(result.trades);
            }
        });
    });
}

// Format trade time using Moment.js
function formatTime(timestamp) {
    return moment(timestamp).format('MMMM Do YYYY, h:mm:ss a');
}

// Format P/L with a fallback to '--' if it's invalid
function formatPL(pl) {
    const parsedPL = parseFloat(pl);
    return isNaN(parsedPL) ? '--' : parsedPL.toFixed(2); // Check if it's a valid number, otherwise return '--'
}

// Render trade history to the table
function renderTradeHistory(trades) {
    const tableBody = document.getElementById('trade-history-body');
    tableBody.innerHTML = ''; // Clear any existing rows

    if (!Array.isArray(trades) || trades.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="16">No trades found.</td></tr>';
        return;
    }

    trades.forEach(trade => {
        const row = document.createElement('tr');

        // Format entry and exit times
        const formattedEntryTime = formatTime(trade.entryTime);
        const formattedExitTime = trade.exitTime ? formatTime(trade.exitTime) : '--';

        // Calculate P/L if available and round it to 2 decimal places
        const pl = formatPL(trade.pl); // Use the formatPL function to handle P/L

        row.innerHTML = `
            <td>${trade.symbol || '--'}</td>
            <td>${trade.entrySide || '--'}</td>
            <td>${trade.exitSide || '--'}</td>
            <td>${trade.qty || '--'}</td>
            <td>${trade.entryPrice || '--'}</td>
            <td>${trade.exitPrice || '--'}</td>
            <td>${trade.leverage || '--'}</td>
            <td>${trade.margin || '--'}</td>
            <td>${trade.status || '--'}</td>
            <td>${formattedEntryTime || '--'}</td>
            <td>${formattedExitTime || '--'}</td>
            <td>${trade.orderId || '--'}</td>
            <td>${pl || '--'}</td>
            <td>${trade.riskToRewardRatio || '--'}</td>
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

// Create Win/Loss chart (based on P/L)
function createWinLossChart(trades) {
    if (!trades || trades.length === 0) return;

    // Count wins and losses based on P/L value
    const winCount = trades.filter(trade => parseFloat(trade.pl) > 0).length;
    const lossCount = trades.filter(trade => parseFloat(trade.pl) < 0).length;

    // Get chart context
    const ctx = document.getElementById('win-loss-chart').getContext('2d');

    // Destroy existing chart if it exists (to avoid duplication)
    if (window.winLossChart) {
        window.winLossChart.destroy();
    }

    // Create a new pie chart
    window.winLossChart = new Chart(ctx, {
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

// Create Win/Loss chart evolution over time (based on cumulative P/L)
function createWinLossChartEvolution(trades) {
    if (!trades || trades.length === 0) return;

    // Sort trades by entry time
    const sortedTrades = trades.sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

    // Extract labels (dates) and cumulative P/L
    let labels = [];
    let cumulativePL = [];
    let runningTotal = 0;

    sortedTrades.forEach(trade => {
        const tradeDate = moment(trade.entryTime).format('YYYY-MM-DD'); // Format date
        const pl = parseFloat(trade.pl) || 0; // Use P/L or 0 if missing

        runningTotal += pl; // Update running total
        labels.push(tradeDate);
        cumulativePL.push(runningTotal.toFixed(2)); // Round cumulative P/L to 2 decimal places
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

// Clear all stored data (trades and comments)
function clearAllData() {
    chrome.storage.local.remove(['processedOrderIds', 'trades', 'comments'], () => {
        console.log('All data has been cleared.');
        location.reload(); // Reloads the page to reflect the cleared data
    });
}

// Initialize the app
function init() {
    fetchTrades().then((trades) => {
        renderTradeHistory(trades);
        createWinLossChart(trades);
        createWinLossChartEvolution(trades);
    }).catch(error => {
        console.error('Error during initialization:', error);
    });

    // Filter trades by search input
    document.getElementById('filter-button').addEventListener('click', () => {
        const searchInput = document.getElementById('search-input').value.toLowerCase();
        fetchTrades().then((trades) => {
            const filteredTrades = trades.filter(trade => trade.symbol.toLowerCase().includes(searchInput) || trade.orderId.toLowerCase().includes(searchInput));
            renderTradeHistory(filteredTrades);
            createWinLossChart(filteredTrades);
        }).catch(error => {
            console.error('Error during trade filtering:', error);
        });
    });

    // Add event listener for the "Clear Data" button
    document.getElementById('clear-data-button').addEventListener('click', clearAllData);
}

// Initialize the app when the document is ready
document.addEventListener('DOMContentLoaded', init);