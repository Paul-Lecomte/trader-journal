document.addEventListener("DOMContentLoaded", function () {
    const openJournalButton = document.getElementById("openJournal");

    // Redirect to the full-page journaling interface
    openJournalButton.addEventListener("click", function () {
        chrome.tabs.create({
            url: chrome.runtime.getURL("frontend_build/journal.html") // Open Next.js journal
        });
    });
});