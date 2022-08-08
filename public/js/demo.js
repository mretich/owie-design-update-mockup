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


    let currentText = current.toLocaleString(undefined, {maximumFractionDigits: 1, minimumFractionDigits: 1});
    document.getElementsByClassName("current-text")[0].getElementsByClassName("value-text")[0].innerText = currentText;

    let voltage = (15 * 2.6) + (0.01 * owiePercentage * 15 * (4.14 - 2.6));
    let voltageText = voltage.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2});
    document.getElementsByClassName("voltage-text")[0].getElementsByClassName("value-text")[0].innerText = voltageText;

    let cellBase = (voltage / 15);
    let restVolt = voltage;
    let nCells = 0;

    for (let c of document.getElementsByClassName("battery-pack")[0].getElementsByTagName("span")) {
        nCells++;
        let cellVolt = (nCells == 15) ? restVolt : cellBase + (Math.random() > 0.95 ? 0.01 : 0.00);
        restVolt = restVolt - cellVolt;
        let cellText = cellVolt.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})
        c.innerText = cellText;
    };
}, 1000) + ");");
