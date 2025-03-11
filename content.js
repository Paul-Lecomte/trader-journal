console.log("Checking for completed trades...");

function extractCompletedTradeData() {
    const tradeTable = document.querySelector("tbody.ka-tbody.tableBody-Tu141ut0"); // Target the specific table
    if (!tradeTable) {
        console.log("Trade table not found! Retrying...");
        return; // If the table is not found, return and try again later
    }

    const tradeElements = tradeTable.querySelectorAll("tr.ka-tr.ka-row.row-Tu141ut0"); // Rows in the specific trade history table
    console.log("Found trade elements:", tradeElements);

    if (tradeElements.length === 0) {
        console.log("No trades found in the table.");
        return;
    }

    tradeElements.forEach(trade => {
        // Extract all trade details using data-label
        const symbol = trade.querySelector("td[data-label='Symbole'] .titleContent-DIAl4Kmu")?.innerText;
        const side = trade.querySelector("td[data-label='Côté'] .blue-Qz5vw9Wh")?.innerText;
        const type = trade.querySelector("td[data-label='Type']")?.innerText; // Market type
        const qty = trade.querySelector("td[data-label='Qté'] .cellContent-Tu141ut0")?.innerText;
        const priceLimit = trade.querySelector("td[data-label='Limite de Prix'] .cellContent-Tu141ut0")?.innerText;
        const stopPrice = trade.querySelector("td[data-label='Prix d’arrêt'] .cellContent-Tu141ut0")?.innerText;
        const avgPrice = trade.querySelector("td[data-label='Prix de remplissage'] span")?.innerText;
        const status = trade.querySelector("td[data-label='Statut'] .green-Qz5vw9Wh")?.innerText; // Status (e.g., 'rempli' - filled)
        const commission = trade.querySelector("td[data-label='Commission']")?.innerText; // If available
        const leverage = trade.querySelector("td[data-label='Effet de levier']")?.innerText;
        const margin = trade.querySelector("td[data-label='Marge'] span")?.innerText;
        const tradeTime = trade.querySelector("td[data-label='Placer le temps']")?.innerText; // Trade placement time
        const closeTime = trade.querySelector("td[data-label='Heure de clôture']")?.innerText; // Close time
        const orderId = trade.querySelector("td[data-label='Numéro de commande']")?.innerText; // Order number

        // Log all the trade data regardless of whether some fields are empty
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

        console.log("Trade data:", tradeData);  // Log the full trade data

        // Send the trade data to the background script or store it as required
        chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
            if (response?.success) {
                console.log("Trade successfully saved:", tradeData);
            } else {
                console.log("Failed to save trade:", response?.error);
            }
        });
    });
}

// Attach listeners for trade data changes (click and mutation observer)
document.addEventListener("click", () => setTimeout(extractCompletedTradeData, 500));

const observer = new MutationObserver(() => setTimeout(extractCompletedTradeData, 500));
observer.observe(document.body, { childList: true, subtree: true }); // Monitor for changes in the trade history table