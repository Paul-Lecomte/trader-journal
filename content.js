console.log("Checking for completed trades...");

// Function to check if the Historic Page is loaded and active
function isHistoryPageLoadedAndActive() {
    const historyPage = document.querySelector('div.page-RYOkdllU.js-page[data-account-manager-page-id="history"].active-RYOkdllU');
    return historyPage !== null;  // Check if the element exists and has the active class
}

// Function to extract completed trade data
function extractCompletedTradeData() {
    const tradeTable = document.querySelector(".ka-tbody.tableBody-Tu141ut0");
    if (!tradeTable) {
        console.log("Trade table not found! Retrying...");
        return; // If the table is not found, return and try again later
    }

    const tradeElements = tradeTable.querySelectorAll(".ka-tr.ka-row.row-Tu141ut0");
    console.log("Found trade elements:", tradeElements);

    if (tradeElements.length === 0) {
        console.log("No trades found in the table.");
        return;
    }

    tradeElements.forEach(trade => {
        // Set fallback value to "No Data" if field is empty or undefined
        const symbol = trade.querySelector("td[data-label='Symbole'] .titleContent-DIAl4Kmu")?.innerText || "No Data";
        const side = trade.querySelector("td[data-label='Côté'] .blue-Qz5vw9Wh")?.innerText || "No Data";
        const type = trade.querySelector("td[data-label='Type']")?.innerText || "No Data";
        const qty = trade.querySelector("td[data-label='Qté'] .cellContent-Tu141ut0")?.innerText || "No Data";
        const priceLimit = trade.querySelector("td[data-label='Limite de Prix'] .cellContent-Tu141ut0")?.innerText || "No Data";
        const stopPrice = trade.querySelector("td[data-label='Prix d’arrêt'] .cellContent-Tu141ut0")?.innerText || "No Data";
        const avgPrice = trade.querySelector("td[data-label='Prix de remplissage'] span")?.innerText || "No Data";
        const status = trade.querySelector("td[data-label='Statut'] .green-Qz5vw9Wh")?.innerText || "No Data";
        const commission = trade.querySelector("td[data-label='Commission']")?.innerText || "No Data";
        const leverage = trade.querySelector("td[data-label='Effet de levier']")?.innerText || "No Data";
        const margin = trade.querySelector("td[data-label='Marge'] span")?.innerText || "No Data";
        const tradeTime = trade.querySelector("td[data-label='Placer le temps']")?.innerText || "No Data";
        const closeTime = trade.querySelector("td[data-label='Heure de clôture']")?.innerText || "No Data";
        const orderId = trade.querySelector("td[data-label='Numéro de commande']")?.innerText || "No Data";

        // Check if this orderId is already saved in chrome storage
        chrome.storage.local.get({ processedOrderIds: [] }, (result) => {
            const processedOrderIds = result.processedOrderIds || [];

            // If the orderId is already processed, skip this trade
            if (processedOrderIds.includes(orderId)) {
                console.log(`Order ID ${orderId} already processed. Skipping...`);
                return; // Skip this trade as it has already been processed
            }

            // Otherwise, proceed with saving the trade and updating the processedOrderIds
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

            console.log("Trade data:", tradeData);

            chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
                if (response?.success) {
                    console.log("Trade successfully saved:", tradeData);

                    // After successfully saving the trade, update the processedOrderIds
                    const newProcessedOrderIds = [...processedOrderIds, orderId];
                    chrome.storage.local.set({ processedOrderIds: newProcessedOrderIds });
                } else {
                    console.log("Failed to save trade:", response?.error);
                }
            });
        });
    });
}

// Function to run the extraction only when the History page is loaded and active
function checkAndExtractTrades() {
    if (isHistoryPageLoadedAndActive()) {
        extractCompletedTradeData();
    } else {
        console.log("History page is not loaded or active yet.");
    }
}

// Add event listener for changes in the DOM or for page load
const observer = new MutationObserver(() => {
    setTimeout(checkAndExtractTrades, 500);
});

observer.observe(document.body, { childList: true, subtree: true }); // Monitor for changes in the body