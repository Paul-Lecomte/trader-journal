chrome.runtime.onInstalled.addListener(() => {
    console.log("TradingView Trade Logger Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveTrade") {
        chrome.storage.local.get({ trades: [] }, (result) => {
            const trades = result.trades;
            trades.push(message.tradeData);
            chrome.storage.local.set({ trades }, () => {
                console.log("Trade saved in background:", message.tradeData);
                sendResponse({ success: true });
            });
        });
        return true; // Required for async sendResponse
    }
});