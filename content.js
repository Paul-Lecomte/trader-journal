console.clear();
console.log("Checking for completed trades...");

let extracting = false;
let lastExtractTime = 0;
const extractionCooldown = 2000; // 2 seconds cooldown between extractions

function isHistoryPageLoadedAndActive() {
    return document.querySelector('div.page-RYOkdllU.js-page[data-account-manager-page-id="history"].active-RYOkdllU') !== null;
}

function extractCompletedTradeData() {
    if (extracting) return;

    const now = Date.now();
    if (now - lastExtractTime < extractionCooldown) {
        console.log("Skipping extraction: Cooldown in effect.");
        return;
    }

    extracting = true;
    lastExtractTime = now;

    const tradeTable = document.querySelector(".ka-table.orders");
    if (!tradeTable) {
        console.warn("Trade table not found! Retrying...");
        extracting = false;
        return;
    }

    const tradeRows = document.querySelectorAll("tr.ka-tr.ka-row");
    console.log(`Found ${tradeRows.length} trade rows.`);

    if (tradeRows.length === 0) {
        console.log("No trades found.");
        extracting = false;
        return;
    }

    chrome.storage.local.get({ processedOrderIds: [] }, (result) => {
        const processedOrderIds = new Set(result.processedOrderIds || []);
        let newTrades = [];

        tradeRows.forEach(trade => {
            const orderId = trade.querySelector("td[data-label='Numéro de commande']")?.innerText || "--";

            if (processedOrderIds.has(orderId)) {
                console.log(`Skipping already processed trade: ${orderId}`);
                return;
            }

            const tradeData = {
                symbol: trade.querySelector("td[data-label='Symbole']")?.innerText || "--",
                side: trade.querySelector("td[data-label='Côté']")?.innerText || "--",
                type: trade.querySelector("td[data-label='Type']")?.innerText || "--",
                qty: trade.querySelector("td[data-label='Qté']")?.innerText || "--",
                priceLimit: trade.querySelector("td[data-label='Limite de Prix']")?.innerText || "--",
                stopPrice: trade.querySelector("td[data-label='Prix d’arrêt']")?.innerText || "--",
                avgPrice: trade.querySelector("td[data-label='Prix de remplissage']")?.innerText || "--",
                status: trade.querySelector("td[data-label='Statut']")?.innerText || "--",
                commission: trade.querySelector("td[data-label='Commission']")?.innerText || "--",
                leverage: trade.querySelector("td[data-label='Effet de levier']")?.innerText || "--",
                margin: trade.querySelector("td[data-label='Marge']")?.innerText || "--",
                tradeTime: trade.querySelector("td[data-label='Placer le temps']")?.innerText || "--",
                closeTime: trade.querySelector("td[data-label='Heure de clôture']")?.innerText || "--",
                orderId
            };

            newTrades.push(tradeData);
            processedOrderIds.add(orderId);
        });

        if (newTrades.length > 0) {
            chrome.runtime.sendMessage({ action: "saveTrades", trades: newTrades }, (response) => {
                if (response?.success) {
                    console.log(`Successfully saved ${newTrades.length} new trades.`);
                    chrome.storage.local.set({ processedOrderIds: Array.from(processedOrderIds) });
                } else {
                    console.error("Failed to save trades:", response?.error);
                }
            });
        } else {
            console.log("No new trades to save.");
        }
    });

    extracting = false;
}

function checkAndExtractTrades() {
    if (isHistoryPageLoadedAndActive()) {
        extractCompletedTradeData();
    } else {
        console.log("History page is not loaded or active.");
    }
}

// 🔹 **Efficient MutationObserver with Throttle**
const observer = new MutationObserver(() => {
    setTimeout(checkAndExtractTrades, 500);
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("Trade extraction observer initialized.");