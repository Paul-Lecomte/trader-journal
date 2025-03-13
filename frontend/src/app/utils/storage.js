// Fetch data from chrome.storage or fallback to localStorage
export const fetchData = async () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
        // If chrome.storage is available (client-side and extension environment)
        return new Promise((resolve) => {
            chrome.storage.local.get("trades", (data) => {
                resolve(data.trades || []);
            });
        });
    } else {
        // Fallback to localStorage if chrome.storage is not available
        console.log("chrome.storage.local is not available. Falling back to localStorage.");
        const trades = JSON.parse(localStorage.getItem("trades")) || [];
        return trades;
    }
};

// Save comment in chrome.storage or fallback to localStorage
export const saveComment = async (tradeId, comment) => {
    if (typeof chrome !== "undefined" && chrome.storage) {
        // If chrome.storage is available
        chrome.storage.local.get("trades", (data) => {
            const updatedTrades = data.trades.map((trade) =>
                trade.id === tradeId ? { ...trade, comments: comment } : trade
            );
            chrome.storage.local.set({ trades: updatedTrades });
        });
    } else {
        // Fallback to localStorage if chrome.storage is not available
        console.log("chrome.storage.local is not available. Falling back to localStorage.");
        const trades = JSON.parse(localStorage.getItem("trades")) || [];
        const updatedTrades = trades.map((trade) =>
            trade.id === tradeId ? { ...trade, comments: comment } : trade
        );
        localStorage.setItem("trades", JSON.stringify(updatedTrades));
    }
};