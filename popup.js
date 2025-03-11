document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("tradeTableBody");
    const clearAllButton = document.getElementById("clearAll");
    const exportCSVButton = document.getElementById("exportCSV");

    // Function to format timestamps to a readable format
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    // Function to load trades from chrome storage and display them
    function loadTrades() {
        chrome.storage.local.get({ trades: [] }, (result) => {
            tableBody.innerHTML = "";  // Clear the table body before adding new rows
            result.trades.forEach((trade, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${trade.symbol}</td>
                    <td>${trade.side}</td>
                    <td>${trade.qty}</td>
                    <td>${trade.avgPrice}</td>
                    <td>${trade.priceLimit}</td>
                    <td>${trade.stopPrice}</td>
                    <td>${trade.avgPrice}</td>
                    <td>${trade.status}</td>
                    <td>${trade.commission}</td>
                    <td>${trade.leverage}</td>
                    <td>${trade.margin}</td>
                    <td>${formatTimestamp(trade.tradeTime)}</td>
                    <td>${formatTimestamp(trade.closeTime)}</td>
                    <td><button class="deleteTrade" data-index="${index}">Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
        });
    }

    // Event listener for deleting a trade
    tableBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("deleteTrade")) {
            const index = event.target.getAttribute("data-index");
            chrome.storage.local.get({ trades: [] }, (result) => {
                const trades = result.trades;
                trades.splice(index, 1);  // Remove the trade at the given index
                chrome.storage.local.set({ trades }, loadTrades);  // Save updated trades and reload
            });
        }
    });

    // Event listener for clearing all trades
    clearAllButton.addEventListener("click", function () {
        chrome.storage.local.set({ trades: [] }, loadTrades);  // Clear all trades and reload
    });

    // Event listener for exporting trades as CSV
    exportCSVButton.addEventListener("click", function () {
        chrome.storage.local.get({ trades: [] }, (result) => {
            let csvContent = "data:text/csv;charset=utf-8,Symbol,Side,Qty,Avg Price,Take Profit,Stop Loss,Last Price,Unrealized PnL,Market Value,Leverage,Margin,Trade Time,Close Time\n";
            result.trades.forEach(trade => {
                csvContent += `${trade.symbol},${trade.side},${trade.qty},${trade.avgPrice},${trade.priceLimit},${trade.stopPrice},${trade.avgPrice},${trade.status},${trade.commission},${trade.leverage},${trade.margin},${formatTimestamp(trade.tradeTime)},${formatTimestamp(trade.closeTime)}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "trade_logs.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    // Function to save trade data when a new trade is added
    function saveTrade(tradeData) {
        chrome.storage.local.get({ trades: [] }, (result) => {
            const trades = result.trades || [];
            trades.push(tradeData); // Add the new trade to the trades array
            chrome.storage.local.set({ trades }, loadTrades); // Save the trades and reload
        });
    }

    // This is where you would save the trade data, for example, after processing a completed trade
    // Example tradeData object
    const tradeData = {
        symbol: "EURUSD",
        side: "Buy",
        type: "Market",
        qty: 1,
        priceLimit: "1.2000",
        stopPrice: "1.1900",
        avgPrice: "1.1950",
        status: "Closed",
        commission: "5 USD",
        leverage: "10x",
        margin: "100 USD",
        tradeTime: Date.now(), // Current time in milliseconds
        closeTime: Date.now(), // Current time in milliseconds
        orderId: "12345"
    };

    // Save the trade data
    saveTrade(tradeData);

    // Initial load of trades when the popup is opened
    loadTrades();
});