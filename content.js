console.clear();
console.log("Checking for completed trades...");

let extracting = false;

// Store open positions for P/L calculation
let openPositions = {};

// Function to fetch closing price at exact closeTime
async function getClosingPrice(symbol, closeTime) {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);
        const data = await response.json();

        if (data.chart && data.chart.result) {
            const prices = data.chart.result[0].indicators.quote[0].close;
            const timestamps = data.chart.result[0].timestamp;

            let closestPrice = "--";
            timestamps.forEach((time, index) => {
                let date = new Date(time * 1000).toISOString().split("T")[1]; // Extract time (HH:mm)
                if (date.startsWith(closeTime.split(" ")[1])) { // Match time (HH:mm)
                    closestPrice = prices[index];
                }
            });

            return closestPrice !== "--" ? closestPrice : "N/A";
        }
    } catch (error) {
        console.error("Error fetching closing price:", error);
    }
    return "N/A";
}

// Function to calculate P/L
function calculatePL(entryPrice, exitPrice, qty, side) {
    entryPrice = parseFloat(entryPrice.replace(/\s/g, '').replace(',', '.'));
    exitPrice = parseFloat(exitPrice.replace(/\s/g, '').replace(',', '.'));
    qty = parseFloat(qty);

    if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(qty)) {
        return "--"; // Return placeholder if invalid
    }

    return side.toLowerCase() === "buy" ? (exitPrice - entryPrice) * qty : (entryPrice - exitPrice) * qty;
}

// Extract and process trade data
async function extractCompletedTradeData() {
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

    for (const trade of tradeRows) {
        const symbol = trade.querySelector("td[data-label='Symbole']")?.innerText || "--";
        const side = trade.querySelector("td[data-label='Côté']")?.innerText || "--";
        const qty = trade.querySelector("td[data-label='Qté']")?.innerText || "--";
        const avgPrice = trade.querySelector("td[data-label='Prix de remplissage']")?.innerText || "--";
        const closeTime = trade.querySelector("td[data-label='Heure de clôture']")?.innerText || "--";
        const orderId = trade.querySelector("td[data-label='Numéro de commande']")?.innerText || "--";

        if (!symbol || !avgPrice || avgPrice === "--") continue;

        const entryPrice = avgPrice.replace(/\s/g, '').replace(',', '.'); // Convert price format
        let closingPrice = await getClosingPrice(symbol, closeTime);
        let pl = calculatePL(entryPrice, closingPrice, qty, side);

        const tradeData = {
            symbol,
            side,
            qty,
            avgPrice,
            closeTime,
            orderId,
            closingPrice,
            pl
        };

        chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
            if (response?.success) {
                console.log("Trade saved with closing price:", tradeData);
            } else {
                console.log("Failed to save trade:", response?.error);
            }
        });
    }

    extracting = false;
}

// Function to check if the history page is loaded
function isHistoryPageLoadedAndActive() {
    return document.querySelector('div.page-RYOkdllU.js-page[data-account-manager-page-id="history"].active-RYOkdllU') !== null;
}

// Watch for page changes and extract trades
const observer = new MutationObserver(() => {
    if (isHistoryPageLoadedAndActive()) {
        extractCompletedTradeData();
    } else {
        console.log("History page is not loaded or active yet.");
    }
});

observer.observe(document.body, { childList: true, subtree: true });