document.addEventListener("DOMContentLoaded", function () {
    const openJournalButton = document.getElementById("openJournal");

    // Redirect to the full-page journaling interface
    openJournalButton.addEventListener("click", function () {
        chrome.tabs.create({ url: "frontend/journal" }); // Open Next.js journal
    });
});
