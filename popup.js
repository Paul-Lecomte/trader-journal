document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get({ trades: [] }, (result) => {
        const trades = result.trades;
        const tableBody = document.getElementById("tradeTableBody");

        trades.forEach(trade => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${trade.entryPrice}</td>
                <td>${trade.stopLoss}</td>
                <td>${trade.takeProfit}</td>
                <td>${trade.rrRatio}</td>
                <td>${trade.tradeTime}</td>
            `;
            tableBody.appendChild(row);
        });
    });
});