console.log("Checking for completed trades...");

function extractCompletedTradeData() {
    const tradeElements = document.querySelectorAll("tr.ka-row"); // Rows in the trade history table
    console.log("Found trade elements:", tradeElements);

    tradeElements.forEach(trade => {
        // Extract trade details from the specific columns
        const symbol = trade.querySelector("td[data-label='Symbole'] .titleContent-DIAl4Kmu")?.innerText;
        const side = trade.querySelector("td[data-label='Côté'] .blue-Qz5vw9Wh")?.innerText;
        const qty = trade.querySelector("td[data-label='Qté'] .cellContent-Tu141ut0")?.innerText;
        const avgPrice = trade.querySelector("td[data-label='Prix de remplissage'] span")?.innerText;
        const takeProfit = trade.querySelector("td[data-label='Prise de profits'] .cellContent-Tu141ut0")?.innerText;
        const stopLoss = trade.querySelector("td[data-label='Stop Loss'] .cellContent-Tu141ut0")?.innerText;
        const lastPrice = trade.querySelector("td[data-label='Dernier prix'] .cellContent-Tu141ut0")?.innerText;
        const unrealizedPnl = trade.querySelector("td[data-label='Profits & Pertes non réalisés'] .cellContent-Tu141ut0")?.innerText;
        const marketValue = trade.querySelector("td[data-label='Valeur de marché'] .cellContent-Tu141ut0")?.innerText;
        const leverage = trade.querySelector("td[data-label='Effet de levier'] .cellContent-Tu141ut0")?.innerText;
        const margin = trade.querySelector("td[data-label='Marge'] .cellContent-Tu141ut0")?.innerText;

        const tradeTime = new Date().toISOString(); // Get current timestamp
        const closeTime = trade.querySelector("td[data-label='Heure de clôture'] .cellContent-Tu141ut0")?.innerText; // Check if close time is available

        // Only log the trade if it has a close time (indicating it's completed)
        if (symbol && side && qty && avgPrice && closeTime) {
            const tradeData = {
                symbol,
                side,
                qty,
                avgPrice,
                takeProfit,
                stopLoss,
                lastPrice,
                unrealizedPnl,
                marketValue,
                leverage,
                margin,
                tradeTime,
                closeTime // Include close time for completed trades
            };
            console.log("Completed trade data:", tradeData);  // Log the completed trade data

            // Send the trade data to the background script or store it as required
            chrome.runtime.sendMessage({ action: "saveTrade", tradeData }, (response) => {
                if (response?.success) {
                    console.log("Trade successfully saved:", tradeData);
                } else {
                    console.log("Failed to save trade:", response?.error);
                }
            });
        } else {
            console.log("Incomplete or open trade data, skipping...");
        }
    });
}

// Attach listeners for trade data changes (click and mutation observer)
document.addEventListener("click", () => setTimeout(extractCompletedTradeData, 500));

const observer = new MutationObserver(() => setTimeout(extractCompletedTradeData, 500));
observer.observe(document.body, { childList: true, subtree: true }); // Monitor for changes in the trade history table