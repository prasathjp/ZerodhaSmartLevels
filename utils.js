// =======================================================
// Zerodha Smart Levels
// utils.js
// Common utility functions
// =======================================================

window.ZSL = (() => {

    const VERSION = "4.0.0";

    function parsePrice(value) {

        if (!value) return 0;

        return Number(
            value
                .replace(/,/g, "")
                .replace("₹", "")
                .trim()
        );
    }

    function parseNumber(value) {

        if (!value) return 0;

        return Number(
            value
                .replace(/,/g, "")
                .trim()
        );
    }

    function shouldHighlight(price) {

    let target = 0;
    let threshold = 0;

    if (price < 10) {

        target = 10;
        threshold = 0.5;

    } else if (price < 100) {

        target = Math.ceil(price / 10) * 10;
        threshold = target * 0.03;      // 30→0.9, 50→1.5, 90→2.7

    } else if (price < 1000) {

        target = Math.ceil(price / 100) * 100;
        threshold = target * 0.02;      // 100→2, 200→4 ... 900→18

    } else if (price < 10000) {

        target = Math.ceil(price / 1000) * 1000;
        threshold = target * 0.01;      // 1000→10 ... 9000→90

    } else {

        target = Math.ceil(price / 10000) * 10000;
        threshold = target * 0.01;      // 20000→200, 30000→300...

    }

    return {
        target,
        distance: +(target - price).toFixed(2),
        highlight: price >= (target - threshold)
    };

}

    function previousTarget(price, interval = 100) {

        return Math.floor(price / interval) * interval;

    }

    function distancePercentage(price, target) {

        if (price === 0)
            return 0;

        return +(((target - price) / price) * 100).toFixed(2);

    }

    function debounce(callback, delay = 300) {

        let timeout;

        return (...args) => {

            clearTimeout(timeout);

            timeout = setTimeout(() => {

                callback(...args);

            }, delay);

        };

    }

    function throttle(callback, wait = 300) {

        let waiting = false;

        return (...args) => {

            if (waiting)
                return;

            callback(...args);

            waiting = true;

            setTimeout(() => {

                waiting = false;

            }, wait);

        };

    }

    function create(tag, className = "", text = "") {

        const el = document.createElement(tag);

        if (className)
            el.className = className;

        if (text)
            el.textContent = text;

        return el;

    }

    function formatPrice(value) {

        return "₹" + value.toFixed(2);

    }

    function exportCSV(rows, filename = "SmartLevels.csv") {

        if (!rows.length)
            return;

        const csv = rows.map(r => r.join(",")).join("\n");

        const blob = new Blob([csv], {
            type: "text/csv"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = filename;

        a.click();

        URL.revokeObjectURL(url);

    }

    function sortByDistance(data) {

        return [...data].sort((a, b) => a.distance - b.distance);

    }

    function uuid() {

        return crypto.randomUUID();

    }

    function sleep(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));

    }

    return {

    VERSION,

    parsePrice,

    parseNumber,

    shouldHighlight,

    previousTarget,

    distancePercentage,

    debounce,

    throttle,

    create,

    formatPrice,

    exportCSV,

    sortByDistance,

    uuid,

    sleep

};

})();
