console.log("TradingView Trade Logger Injected");

function extractTradeData() {
    const tradeElements = document.querySelectorAll("[class*='order-'], [class*='position-']"); // More flexible selector

    tradeElements.forEach(trade => {
        const entryPrice = trade.querySelector("[class*='entry']")?.innerText;
        const stopLoss = trade.querySelector("[class*='stop']")?.innerText;
        const takeProfit = trade.querySelector("[class*='profit']")?.innerText;
        const rrRatio = trade.querySelector("[class*='risk']")?.innerText;
        const tradeTime = new Date().toISOString();

        if (entryPrice && stopLoss && takeProfit && rrRatio) {
            const tradeData = { entryPrice, stopLoss, takeProfit, rrRatio, tradeTime };

            chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
                if (response?.success) {
                    console.log("Trade successfully saved in background:", tradeData);
                }
            });
        }
    });
}

// Ensure script runs when the user interacts with a trade
document.addEventListener("click", () => setTimeout(extractTradeData, 500));

const observer = new MutationObserver(() => setTimeout(extractTradeData, 500));
observer.observe(document.body, { childList: true, subtree: true });