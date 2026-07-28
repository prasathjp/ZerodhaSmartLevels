// ==========================================================
// Zerodha Smart Levels
// background.js
// Manifest V3 Service Worker
// ==========================================================

const DEFAULT_SETTINGS = {
    enabled: true,
    highlightEnabled: true,
    notificationsEnabled: true,
    soundEnabled: false,
    autoRefresh: true,
    refreshInterval: 1000,
    threshold: 20,
    targetInterval: 100,
    darkMode: true
};

// ----------------------------------------------------------
// Install
// ----------------------------------------------------------
chrome.runtime.onInstalled.addListener(async (details) => {

    const data = await chrome.storage.sync.get();

    if (!data.settings) {
        await chrome.storage.sync.set({
            settings: DEFAULT_SETTINGS
        });
    }

    console.log("=======================================");
    console.log(" Zerodha Smart Levels Installed");
    console.log(" Version :", chrome.runtime.getManifest().version);
    console.log("=======================================");

});

// ----------------------------------------------------------
// Message Listener
// ----------------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {

        case "notify":

            if (!request.title || !request.message)
                return;

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon128.png",
                title: request.title,
                message: request.message,
                priority: 2
            });

            sendResponse({
                success: true
            });

            break;

        case "getSettings":

            chrome.storage.sync.get("settings").then(result => {

                sendResponse(result.settings || DEFAULT_SETTINGS);

            });

            return true;

        case "saveSettings":

            chrome.storage.sync.set({
                settings: request.settings
            }).then(() => {

                sendResponse({
                    success: true
                });

            });

            return true;

        case "ping":

            sendResponse({
                status: "alive"
            });

            break;

        default:

            sendResponse({
                success: false,
                message: "Unknown action"
            });

            break;
    }

    return true;

});

// ----------------------------------------------------------
// Startup
// ----------------------------------------------------------
chrome.runtime.onStartup.addListener(() => {

    console.log("Zerodha Smart Levels Started");

});

// ----------------------------------------------------------
// Notification Click
// ----------------------------------------------------------
chrome.notifications.onClicked.addListener(() => {

    chrome.tabs.query(
        {
            url: "https://kite.zerodha.com/*"
        },
        (tabs) => {

            if (tabs.length > 0) {

                chrome.tabs.update(tabs[0].id, {
                    active: true
                });

            } else {

                chrome.tabs.create({
                    url: "https://kite.zerodha.com/"
                });

            }

        });

});

// ----------------------------------------------------------
// Keep Alive
// ----------------------------------------------------------
setInterval(() => {

    console.log("Service Worker Alive");

}, 240000);
