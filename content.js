console.clear();
console.log("Checking for completed trades...");

let extracting = false;

function isHistoryPageLoadedAndActive() {
    const historyPage = document.querySelector('div.page-RYOkdllU.js-page[data-account-manager-page-id="history"].active-RYOkdllU');
    return historyPage !== null;
}

function extractCompletedTradeData() {
    if (extracting) return;
    extracting = true;

    const tradeTable = document.querySelector(".ka-table.orders");
    if (!tradeTable) {
        console.log("Trade table not found! Retrying...");
        extracting = false;
        return;
    }

    const tradeRows = document.querySelectorAll("tr.ka-tr.ka-row");
    console.log("Found trade rows:", tradeRows);

    if (tradeRows.length === 0) {
        console.log("No trades found in the table.");
        extracting = false;
        return;
    }

    tradeRows.forEach(trade => {
        const symbol = trade.querySelector("td[data-label='Symbole']")?.innerText || "--";
        const side = trade.querySelector("td[data-label='Côté']")?.innerText || "--";
        const type = trade.querySelector("td[data-label='Type']")?.innerText || "--";
        const qty = trade.querySelector("td[data-label='Qté']")?.innerText || "--";
        const priceLimit = trade.querySelector("td[data-label='Limite de Prix']")?.innerText || "--";
        const stopPrice = trade.querySelector("td[data-label='Prix d’arrêt']")?.innerText || "--";
        const avgPrice = trade.querySelector("td[data-label='Prix de remplissage']")?.innerText || "--";
        const status = trade.querySelector("td[data-label='Statut']")?.innerText || "--";
        const commission = trade.querySelector("td[data-label='Commission']")?.innerText || "--";
        const leverage = trade.querySelector("td[data-label='Effet de levier']")?.innerText || "--";
        const margin = trade.querySelector("td[data-label='Marge']")?.innerText || "--";
        const tradeTime = trade.querySelector("td[data-label='Placer le temps']")?.innerText || "--";
        const closeTime = trade.querySelector("td[data-label='Heure de clôture']")?.innerText || "--";
        const orderId = trade.querySelector("td[data-label='Numéro de commande']")?.innerText || "--";

        chrome.storage.local.get({ processedOrderIds: [] }, (result) => {
            const processedOrderIds = result.processedOrderIds || [];

            if (processedOrderIds.includes(orderId)) {
                console.log(`Order ID ${orderId} already processed. Skipping...`);
                return;
            }

            const tradeData = {
                symbol,
                side,
                type,
                qty,
                priceLimit,
                stopPrice,
                avgPrice,
                status,
                commission,
                leverage,
                margin,
                tradeTime,
                closeTime,
                orderId
            };

            chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
                if (response?.success) {
                    console.log("Trade successfully saved:", tradeData);
                    processedOrderIds.push(orderId);
                    chrome.storage.local.set({ processedOrderIds });
                } else {
                    console.log("Failed to save trade:", response?.error);
                }
            });
        });
    });

    extracting = false;
}

function checkAndExtractTrades() {
    if (isHistoryPageLoadedAndActive()) {
        extractCompletedTradeData();
    } else {
        console.log("History page is not loaded or active yet.");
    }
}

const observer = new MutationObserver(() => {
    setTimeout(checkAndExtractTrades, 500);
});

observer.observe(document.body, { childList: true, subtree: true });