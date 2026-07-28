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

    function nextTarget(price, interval = 100) {

        return Math.ceil(price / interval) * interval;

    }

    function previousTarget(price, interval = 100) {

        return Math.floor(price / interval) * interval;

    }

    function distance(price, target) {

        return +(target - price).toFixed(2);

    }

    function distancePercentage(price, target) {

        if (price === 0)
            return 0;

        return +(((target - price) / price) * 100).toFixed(2);

    }

    function getHighlightClass(diff) {

        if (diff <= 5)
            return "zsl-green";

        if (diff <= 10)
            return "zsl-yellow";

        if (diff <= 20)
            return "zsl-orange";

        if (diff <= 50)
            return "zsl-red";

        return "";

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

        nextTarget,

        previousTarget,

        distance,

        distancePercentage,

        getHighlightClass,

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
