"use client";
export const fetchData = async () => {
    return new Promise((resolve) => {
        chrome.storage.local.get("trades", (data) => {
            resolve(data.trades || []);
        });
    });
};

export const saveComment = async (tradeId, comment) => {
    chrome.storage.local.get("trades", (data) => {
        const updatedTrades = data.trades.map((trade) =>
            trade.id === tradeId ? { ...trade, comments: comment } : trade
        );
        chrome.storage.local.set({ trades: updatedTrades });
    });
};