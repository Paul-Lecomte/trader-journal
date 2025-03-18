console.clear();
console.log("Checking for completed trades...");

let extracting = false;

function isHistoryPageLoadedAndActive() {
    return document.querySelector('div.page-RYOkdllU.js-page[data-account-manager-page-id="history"].active-RYOkdllU') !== null;
}

// Store open positions for P/L calculation
let openPositions = {};

function calculatePL(entryPrice, exitPrice, qty, side) {
    entryPrice = parseFloat(entryPrice.replace(/\s/g, '').replace(',', '.'));
    exitPrice = parseFloat(exitPrice.replace(/\s/g, '').replace(',', '.'));
    qty = parseFloat(qty);

    if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(qty)) {
        return "--"; // Return placeholder if invalid
    }

    // Calculate P/L based on side (Buy or Sell)
    if (side.toLowerCase() === "buy") {
        return (exitPrice - entryPrice) * qty;  // Profit when price increases
    } else if (side.toLowerCase() === "sell") {
        return (entryPrice - exitPrice) * qty;  // Profit when price decreases
    }
    return "--";  // If neither Buy nor Sell, return placeholder
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
    console.log("Found trade rows:", tradeRows.length);

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

        if (!symbol || !side || !avgPrice || avgPrice === "--") return; // Ignore invalid trades

        const price = avgPrice.replace(/\s/g, '').replace(',', '.'); // Convert price format

        if (!openPositions[symbol]) {
            openPositions[symbol] = [];
        }

        let pl = "--";
        let closingPrice = "--";

        if (side.toLowerCase() === "buy") {
            openPositions[symbol].push({ price, qty, orderId, tradeTime });
        } else if (side.toLowerCase() === "sell" && openPositions[symbol].length > 0) {
            let buyTrade = openPositions[symbol].shift(); // Match with first Buy trade
            pl = calculatePL(buyTrade.price, price, qty, side);
            closingPrice = price;
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
            orderId,
            pl,
            closingPrice
        };

        chrome.storage.local.get({ processedOrderIds: [] }, (result) => {
            const processedOrderIds = result.processedOrderIds || [];

            if (!processedOrderIds.includes(orderId)) {
                chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
                    if (response?.success) {
                        console.log("Trade successfully saved:", tradeData);
                        processedOrderIds.push(orderId);
                        chrome.storage.local.set({ processedOrderIds });
                    } else {
                        console.log("Failed to save trade:", response?.error);
                    }
                });
            } else {
                console.log(`Order ID ${orderId} already processed. Updating P/L...`);
                chrome.storage.local.get({ trades: [] }, (data) => {
                    const trades = data.trades.map(trade => trade.orderId === orderId ? { ...trade, pl, closingPrice } : trade);
                    chrome.storage.local.set({ trades });
                });
            }
        });
    });

    extracting = false;
}

function checkAndExtractTrades() {
    if (isHistoryPageLoadedAndActive()) {
        // Wait for 2 seconds before continuing
        setTimeout(extractCompletedTradeData, 2000);
    } else {
        console.log("History page is not loaded or active yet.");
    }
}

// Watch for page changes and extract trades
const observer = new MutationObserver(() => {
    setTimeout(checkAndExtractTrades, 500);
});

observer.observe(document.body, { childList: true, subtree: true });