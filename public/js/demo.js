console.log("You can stop demo mode by entering this:\nwindow.clearInterval(" + window.setInterval(function randomizeValues() {
    let style = document.getElementsByTagName("body")[0].style

    let owiePercentage = Math.max(0, Math.min(100, style.getPropertyValue("--owie-percentage-int") - 19 + Math.floor(Math.random() * 41)));
    let bmsPercentage = Math.max(0, Math.min(100, Math.floor(owiePercentage * 0.9 + (Math.random() * 0.2 * owiePercentage))));
    let maxCurrent = 30;
    let minCurrent = -10;

    let current = minCurrent + 0.1 * (Math.floor(Math.random() * 10 * (maxCurrent - minCurrent + 1)));

    let props = {
        "--owie-percentage-int": owiePercentage,
        "--bms-percentage-int": bmsPercentage,
        "--current": current,
    }
    for (const [key, value] of Object.entries(props)) {
        style.setProperty(key, value);
    };
}, 1000) + ");");
