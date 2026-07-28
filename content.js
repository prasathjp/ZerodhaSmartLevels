// ==========================================================
// Zerodha Smart Levels v4.0
// content.js
// Section A - Foundation
// ==========================================================

(() => {
    "use strict";

    if (window.__ZSL_INITIALIZED__) {
        console.log("[ZSL] Already initialized");
        return;
    }

    window.__ZSL_INITIALIZED__ = true;

    const APP = {

        VERSION: "4.0.0",

        settings: null,

        table: null,

        observer: null,

        scanTimer: null,

        stocks: [],

        rowCache: new Map(),

        initialized: false

    };

    const DEFAULT_SETTINGS = {

        enabled: true,

        highlightEnabled: true,

        notificationsEnabled: true,

        threshold: 20,

        targetInterval: 100,

        refreshInterval: 1000,

        darkMode: true

    };

    //-------------------------------------------------------
    // Load Settings
    //-------------------------------------------------------

    async function loadSettings() {

        return new Promise(resolve => {

            chrome.runtime.sendMessage(
                {
                    action: "getSettings"
                },
                settings => {

                    APP.settings =
                        settings || DEFAULT_SETTINGS;

                    resolve();

                });

        });

    }

    //-------------------------------------------------------
    // Find Screener Table
    //-------------------------------------------------------

    function findTable() {

        const tables =
            document.querySelectorAll("table");

        for (const table of tables) {

            const priceHeader =
                table.querySelector(
                    'th[data-label="Last Price"], th:last-child'
                );

            if (
                table.querySelector(
                    'td[data-label="Last Price"]'
                )
            ) {

                return table;

            }

        }

        return null;

    }

    //-------------------------------------------------------
    // Helpers
    //-------------------------------------------------------

    function getText(parent, selector) {

        const el = parent.querySelector(selector);

        return el ? el.textContent.trim() : "";

    }

    function getNumber(parent, selector) {

        const value =
            getText(parent, selector);

        return Number(
            value
                .replace(/,/g, "")
                .replace("₹", "")
                .replace("%", "")
        ) || 0;

    }

    //-------------------------------------------------------
    // Build Row Cache
    //-------------------------------------------------------

    function cacheRows() {

        APP.rowCache.clear();

        const rows =
            APP.table.querySelectorAll(
                "tbody tr"
            );

        rows.forEach(row => {

            const symbolElement =
                row.querySelector(
                    'td[data-label="Name"] .tradingsymbol'
                );

            const priceElement =
                row.querySelector(
                    'td[data-label="Last Price"] span'
                );

            const changeElement =
                row.querySelector(
                    'td[data-label="Change %"] span'
                );

            if (!symbolElement || !priceElement)
                return;

            const symbol =
                symbolElement.textContent.trim();

            row.dataset.zslId = symbol;

            APP.rowCache.set(symbol, {

                row,

                symbolElement,

                priceElement,

                changeElement

            });

        });

        console.log(
            `[ZSL] Cached ${APP.rowCache.size} rows`
        );

    }

    //-------------------------------------------------------
    // Scan Cached Rows
    //-------------------------------------------------------

    function scanRows() {

        APP.stocks = [];

        APP.rowCache.forEach(cache => {

            const price =
                Number(
                    cache.priceElement
                        .textContent
                        .replace(/,/g, "")
                );

            if (!price)
                return;

            const target =
                ZSL.nextTarget(
                    price,
                    APP.settings.targetInterval
                );

            APP.stocks.push({

                symbol:
                    cache.symbolElement.textContent.trim(),

                price,

                target,

                distance:
                    ZSL.distance(
                        price,
                        target
                    ),

                distancePct:
                    ZSL.distancePercentage(
                        price,
                        target
                    ),

                change:
                    cache.changeElement
                        ? cache.changeElement.textContent.trim()
                        : "",

                row:
                    cache.row

            });

        });

        APP.stocks =
            ZSL.sortByDistance(APP.stocks);

    }
      //-------------------------------------------------------
    // Header Management
    //-------------------------------------------------------

    const EXTRA_COLUMNS = [
        "Target",
        "Distance",
        "Distance %",
        "Rank"
    ];

    function ensureHeaders() {

        const headerRow =
            APP.table.querySelector("thead tr");

        if (!headerRow)
            return;

        if (headerRow.querySelector(".zsl-header"))
            return;

        const menuHeader =
            headerRow.querySelector(".col-menu");

        EXTRA_COLUMNS.forEach(title => {

            const th = document.createElement("th");

            th.className = "zsl-header";

            th.textContent = title;

            if (menuHeader)
                headerRow.insertBefore(th, menuHeader);
            else
                headerRow.appendChild(th);

        });

    }

    //-------------------------------------------------------
    // Cell Helpers
    //-------------------------------------------------------

    function createCell(value) {

        const td = document.createElement("td");

        td.className = "zsl-cell";

        td.textContent = value;

        return td;

    }

    function removeExtraCells(row) {

        row.querySelectorAll(".zsl-cell")
            .forEach(cell => cell.remove());

    }

    function insertBeforeMenu(row, cell) {

        const menu =
            row.querySelector(".col-menu");

        if (menu)
            row.insertBefore(cell, menu);
        else
            row.appendChild(cell);

    }

    //-------------------------------------------------------
    // Highlight Engine
    //-------------------------------------------------------

    function clearHighlight(row) {

        row.classList.remove(
            "zsl-green",
            "zsl-yellow",
            "zsl-orange",
            "zsl-red",
            "zsl-flash"
        );

    }

    function applyHighlight(stock) {

        const row = stock.row;

        clearHighlight(row);

        const css =
            ZSL.getHighlightClass(
                stock.distance
            );

        if (!css)
            return;

        row.classList.add(css);

        const flashKey =
            stock.symbol +
            "_" +
            stock.target;

        if (
            row.dataset.flashKey !== flashKey
        ) {

            row.dataset.flashKey = flashKey;

            row.classList.add("zsl-flash");

            setTimeout(() => {

                row.classList.remove(
                    "zsl-flash"
                );

            }, 1500);

        }

    }

    //-------------------------------------------------------
    // Render Table
    //-------------------------------------------------------

    function renderTable() {

        ensureHeaders();

        APP.stocks.forEach((stock, index) => {

            removeExtraCells(stock.row);

            insertBeforeMenu(
                stock.row,
                createCell(
                    "₹" +
                    stock.target.toFixed(2)
                )
            );

            insertBeforeMenu(
                stock.row,
                createCell(
                    "₹" +
                    stock.distance.toFixed(2)
                )
            );

            insertBeforeMenu(
                stock.row,
                createCell(
                    stock.distancePct.toFixed(2) +
                    "%"
                )
            );

            insertBeforeMenu(
                stock.row,
                createCell(
                    "#" + (index + 1)
                )
            );

            applyHighlight(stock);

        });

    }

    //-------------------------------------------------------
    // Filter Support
    //-------------------------------------------------------

    function showOnlyHighlighted(enable) {

        APP.stocks.forEach(stock => {

            if (!enable) {

                stock.row.style.display = "";

                return;

            }

            if (
                stock.distance <=
                APP.settings.threshold
            ) {

                stock.row.style.display = "";

            } else {

                stock.row.style.display = "none";

            }

        });

    }

    //-------------------------------------------------------
    // Dashboard Data
    //-------------------------------------------------------

    function publishData() {

        window.ZSL_STOCKS = APP.stocks;

        window.dispatchEvent(

            new CustomEvent(

                "zsl-data-updated",

                {

                    detail: {

                        stocks: APP.stocks,

                        timestamp: Date.now()

                    }

                }

            )

        );

    }

    //-------------------------------------------------------
    // Refresh Cycle
    //-------------------------------------------------------

    function refreshData() {

        if (!APP.table)
            return;

        scanRows();

        renderTable();

        publishData();

    }
      //-------------------------------------------------------
    // Notifications
    //-------------------------------------------------------

    const notifiedTargets = new Set();

    function processNotifications() {

        if (!APP.settings.notificationsEnabled)
            return;

        APP.stocks.forEach(stock => {

            if (stock.distance > APP.settings.threshold)
                return;

            const key =
                `${stock.symbol}_${stock.target}`;

            if (notifiedTargets.has(key))
                return;

            notifiedTargets.add(key);

            chrome.runtime.sendMessage({
                action: "notify",
                title: stock.symbol,
                message:
                    `Only ₹${stock.distance.toFixed(2)} left to ₹${stock.target}`
            });

        });

    }

    //-------------------------------------------------------
    // CSV Export
    //-------------------------------------------------------

    function exportCurrentStocks() {

        const rows = [

            [
                "Rank",
                "Symbol",
                "Price",
                "Target",
                "Distance",
                "Distance %",
                "Change %"
            ]

        ];

        APP.stocks.forEach((stock, index) => {

            rows.push([

                index + 1,

                stock.symbol,

                stock.price,

                stock.target,

                stock.distance,

                stock.distancePct,

                stock.change

            ]);

        });

        ZSL.exportCSV(rows, "ZerodhaSmartLevels.csv");

    }

    //-------------------------------------------------------
    // Mutation Observer
    //-------------------------------------------------------

    function startObserver() {

        APP.observer = new MutationObserver(

            ZSL.debounce(() => {

                const table = findTable();

                if (!table)
                    return;

                if (table !== APP.table) {

                    APP.table = table;

                    cacheRows();

                }

                refreshData();

            }, 400)

        );

        APP.observer.observe(document.body, {

            childList: true,

            subtree: true

        });

    }

    //-------------------------------------------------------
    // Keyboard Shortcuts
    //-------------------------------------------------------

    document.addEventListener("keydown", e => {

        if (!e.altKey)
            return;

        switch (e.key.toLowerCase()) {

            case "e":

                exportCurrentStocks();

                break;

            case "h":

                showOnlyHighlighted(true);

                break;

            case "a":

                showOnlyHighlighted(false);

                break;

        }

    });

    //-------------------------------------------------------
    // Initialize
    //-------------------------------------------------------

    async function initialize() {

        console.log(
            "[ZSL] Initializing..."
        );

        await loadSettings();

        APP.table = findTable();

        if (!APP.table) {

            console.log(
                "[ZSL] Waiting for Screener..."
            );

            startObserver();

            return;

        }

        cacheRows();

        refreshData();

        APP.scanTimer = setInterval(() => {

            refreshData();

        }, APP.settings.refreshInterval);

        startObserver();

        APP.initialized = true;

        console.log(
            `[ZSL] Ready - ${APP.stocks.length} stocks`
        );

    }

    //-------------------------------------------------------
    // Global API
    //-------------------------------------------------------

    window.ZSL_APP = {

        refresh: refreshData,

        exportCSV: exportCurrentStocks,

        showHighlighted: () => showOnlyHighlighted(true),

        showAll: () => showOnlyHighlighted(false),

        getStocks: () => APP.stocks,

        getSettings: () => APP.settings

    };

    initialize();

})();
