console.clear();
console.log("Extracting and pairing trades...");

let extracting = false;


function isHistoryPageLoadedAndActive() {
    return document.querySelector('div.page-RYOkdllU.js-page[data-account-manager-page-id="history"].active-RYOkdllU') !== null;
}

// Store all trade history before pairing
let tradeHistory = [];

function calculatePL(entryPrice, exitPrice, qty, side) {
    entryPrice = parseFloat(entryPrice.replace(/\s/g, '').replace(',', '.'));
    exitPrice = parseFloat(exitPrice.replace(/\s/g, '').replace(',', '.'));
    qty = parseFloat(qty);

    if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(qty)) {
        return "--"; // Return placeholder if invalid
    }

    return side.toLowerCase() === "buy"
        ? (exitPrice - entryPrice) * qty  // Profit when price increases
        : (entryPrice - exitPrice) * qty; // Profit when price decreases
}

function extractTradeHistory() {
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
        console.log("No trades found.");
        extracting = false;
        return;
    }

    tradeHistory = []; // Clear old history before reloading

    tradeRows.forEach(trade => {
        const symbol = trade.querySelector("td[data-label='Symbole']")?.innerText || "--";
        const side = trade.querySelector("td[data-label='Côté']")?.innerText || "--";
        const qty = trade.querySelector("td[data-label='Qté']")?.innerText || "--";
        const avgPrice = trade.querySelector("td[data-label='Prix de remplissage']")?.innerText || "--";
        const tradeTime = trade.querySelector("td[data-label='Placer le temps']")?.innerText || "--";
        const orderId = trade.querySelector("td[data-label='Numéro de commande']")?.innerText || "--";

        if (!symbol || !side || !avgPrice || avgPrice === "--") return;

        const price = avgPrice.replace(/\s/g, '').replace(',', '.');

        tradeHistory.push({
            symbol,
            side: side.toLowerCase(),
            price,
            qty,
            tradeTime,
            orderId
        });
    });

    console.log("Collected trade history:", tradeHistory);
    pairTrades();
    extracting = false;
}

function pairTrades() {
    if (tradeHistory.length === 0) {
        console.log("No trade history available for pairing.");
        return;
    }

    let openPositions = {};
    let completedTrades = [];

    tradeHistory.forEach(trade => {
        const { symbol, side, price, qty, tradeTime, orderId } = trade;

        if (!openPositions[symbol]) {
            openPositions[symbol] = [];
        }

        if (side === "buy") {
            // Save Buy trade
            openPositions[symbol].push({ price, qty, tradeTime, orderId });
        } else if (side === "sell" && openPositions[symbol].length > 0) {
            // Match Sell with previous Buy
            let entryTrade = openPositions[symbol].shift(); // FIFO (First Buy gets closed first)
            let pl = calculatePL(entryTrade.price, price, qty, "buy");

            completedTrades.push({
                symbol,
                entrySide: "Buy",
                entryPrice: entryTrade.price,
                entryTime: entryTrade.tradeTime,
                exitSide: "Sell",
                exitPrice: price,
                exitTime: tradeTime,
                qty,
                orderId: `${entryTrade.orderId}-${orderId}`,
                pl
            });
        }
    });

    console.log("Completed Trades:", completedTrades);

    // Save only completed trades
    chrome.storage.local.set({ trades: completedTrades }, () => {
        console.log("Saved completed trades.");
    });
}

// ✅ This function is now using a properly defined `isHistoryPageLoadedAndActive()`
function checkAndExtractTrades() {
    if (isHistoryPageLoadedAndActive()) {
        setTimeout(extractTradeHistory, 2000);
    } else {
        console.log("History page is not loaded or active yet.");
    }
}

// Watch for page changes and extract trades
const observer = new MutationObserver(() => {
    setTimeout(checkAndExtractTrades, 500);
});

observer.observe(document.body, { childList: true, subtree: true });