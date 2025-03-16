chrome.runtime.onInstalled.addListener(() => {
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15); // Generate a nonce
    console.log("Generated nonce:", nonce);

    // Inject the nonce into the popup.html or content.html dynamically
    const script = document.getElementById('popup-script');
    script.setAttribute('nonce', nonce);

    // Now you can load external scripts dynamically or inline scripts
    const inlineScript = `
        document.getElementById('saveButton').addEventListener('click', () => {
            // Your inline JavaScript code here
            const tradeData = {}; // Gather trade data
            chrome.runtime.sendMessage({
                action: 'saveTrade',
                tradeData: tradeData
            }, (response) => {
                console.log('Trade saved:', response.success);
            });
        });
    `;

    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.textContent = inlineScript;
    scriptElement.setAttribute('nonce', nonce);  // Attach the nonce
    document.body.appendChild(scriptElement);  // Add to the DOM
});