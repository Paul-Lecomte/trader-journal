console.log("TradingView Trade Logger Injected");

function extractTradeData() {
    const tradeElements = document.querySelectorAll(".trade-container"); // Update with correct selector

    tradeElements.forEach(trade => {
        const entryPrice = trade.querySelector(".entry-price")?.innerText;
        const stopLoss = trade.querySelector(".stop-loss")?.innerText;
        const takeProfit = trade.querySelector(".take-profit")?.innerText;
        const rrRatio = trade.querySelector(".rr-ratio")?.innerText;
        const tradeTime = new Date().toISOString();

        if (entryPrice && stopLoss && takeProfit && rrRatio) {
            const tradeData = {
                entryPrice,
                stopLoss,
                takeProfit,
                rrRatio,
                tradeTime
            };

            chrome.storage.local.get({ trades: [] }, (result) => {
                const trades = result.trades;
                trades.push(tradeData);
                chrome.storage.local.set({ trades });
            });

            console.log("Trade saved:", tradeData);
        }
    });
}

const observer = new MutationObserver(extractTradeData);
observer.observe(document.body, { childList: true, subtree: true });