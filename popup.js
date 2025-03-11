document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("tradeTableBody");
    const clearAllButton = document.getElementById("clearAll");
    const exportCSVButton = document.getElementById("exportCSV");

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    function loadTrades() {
        chrome.storage.local.get({ trades: [] }, (result) => {
            tableBody.innerHTML = "";
            result.trades.forEach((trade, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${trade.entryPrice}</td>
                    <td>${trade.stopLoss}</td>
                    <td>${trade.takeProfit}</td>
                    <td>${trade.rrRatio}</td>
                    <td>${formatTimestamp(trade.tradeTime)}</td>
                    <td><button class="deleteTrade" data-index="${index}">Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
        });
    }

    tableBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("deleteTrade")) {
            const index = event.target.getAttribute("data-index");
            chrome.storage.local.get({ trades: [] }, (result) => {
                const trades = result.trades;
                trades.splice(index, 1);
                chrome.storage.local.set({ trades }, loadTrades);
            });
        }
    });

    clearAllButton.addEventListener("click", function () {
        chrome.storage.local.set({ trades: [] }, loadTrades);
    });

    exportCSVButton.addEventListener("click", function () {
        chrome.storage.local.get({ trades: [] }, (result) => {
            let csvContent = "data:text/csv;charset=utf-8,Entry Price,Stop Loss,Take Profit,R:R Ratio,Trade Time\n";
            result.trades.forEach(trade => {
                csvContent += `${trade.entryPrice},${trade.stopLoss},${trade.takeProfit},${trade.rrRatio},${formatTimestamp(trade.tradeTime)}\n`;
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

    loadTrades();
});