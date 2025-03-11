document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("tradeTableBody");
    const clearAllButton = document.getElementById("clearAll");

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
                    <td>${trade.tradeTime}</td>
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

    loadTrades();
});