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

        if (!symbol || !side || !avgPrice || avgPrice === "--") return;

        const price = avgPrice.replace(/\s/g, '').replace(',', '.');

        tradeHistory.push({
            symbol,
            side: side.toLowerCase(),
            type,
            price,
            qty,
            tradeTime,
            closeTime,
            margin,
            leverage,
            status,
            orderId,
            priceLimit,
            stopPrice,
            commission
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
        const { symbol, side, price, qty, tradeTime, closeTime, margin, leverage, status, orderId } = trade;

        if (!openPositions[symbol]) {
            openPositions[symbol] = [];
        }

        if (side === "buy") {
            openPositions[symbol].push({ price, qty, tradeTime, closeTime, margin, leverage, status, orderId });
        } else if (side === "sell" && openPositions[symbol].length > 0) {
            let entryTrade = openPositions[symbol].shift();
            let pl = calculatePL(entryTrade.price, price, qty, "buy");

            // Calculate Risk and Reward using entry and exit price
            let risk = Math.abs(parseFloat(entryTrade.price) - parseFloat(price)); // Difference between entry and exit price
            let reward = Math.abs(parseFloat(price) - parseFloat(entryTrade.price)); // Same logic for reward

            // Calculate Risk-to-Reward Ratio
            let riskToRewardRatio = risk > 0 ? (reward / risk).toFixed(2) : "--"; // Avoid division by 0 and provide "--" if risk is 0

            completedTrades.push({
                symbol,
                entrySide: "Buy",
                entryPrice: entryTrade.price,
                entryTime: entryTrade.tradeTime,
                exitSide: "Sell",
                exitPrice: price,
                exitTime: closeTime,
                qty,
                margin: entryTrade.margin,
                leverage: entryTrade.leverage,
                status: entryTrade.status,
                orderId: `${entryTrade.orderId}-${orderId}`,
                pl,
                riskToRewardRatio
            });
        }
    });

    console.log("Completed Trades:", completedTrades);

    chrome.storage.local.set({ trades: completedTrades }, () => {
        console.log("Saved completed trades with additional details.");
    });
}

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