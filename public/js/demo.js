
window.toggleDemoMode = function() {
    if (window.demo_intervalId) {
        window.clearInterval(window.demo_intervalId);
        delete window.demo_intervalId;
        return;
    }
    window.demo_iterate();
    window.demo_intervalId = window.setInterval(window.demo_iterate, 1000);
};

window.demo_iterate = function() {

    // fake uptime; based on first function call
    window.demo_startTime = window.demo_startTime || Date.now();
    window.demo_fakeUsage = window.demo_fakeUsage || {};

    let uptime = Math.floor((Date.now() - window.demo_startTime) / 1000),
        s = uptime % 60,
        m = (uptime % 3600 - s) / 60,
        h = Math.floor(uptime / 3600),
        prettyUptime = (h<1?'':h+':') + (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s);

    document.
        getElementsByClassName("uptime")[0].
            getElementsByClassName("value-text")[0].
                innerText = prettyUptime;
    //

    let style = document.getElementsByTagName("body")[0].style

    let maxCurrent = 15;
    let minCurrent = -3;

    let oldPercent = (style.getPropertyValue("--owie-percentage-int")||50);
    let isRegen = (oldPercent == 0) || ((oldPercent < 100) && Math.random() >= 0.5);

    let current = 0.1 * Math.floor(10 * Math.random() * (isRegen?minCurrent:maxCurrent));
    let owiePercentage = Math.max(0, Math.min(100, oldPercent - Math.sign(current) * (Math.floor(Math.random() * 16))));
    let bmsPercentage = Math.max(0, Math.min(100, Math.floor(owiePercentage * 0.9 + (Math.random() * 0.2 * owiePercentage))));


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

    for (let c of document.getElementsByClassName("battery-voltage-text")) {
        nCells++;
        let cellVolt = (nCells == 15) ? restVolt : cellBase + (Math.random() > 0.95 ? 0.01 : 0.00);
        restVolt = restVolt - cellVolt;
        let cellText = cellVolt.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})
        c.innerText = cellText;
    };

    // fake mAh usage/regen, loosly based on fake current
    let fakeUsage = Math.abs(current / 3.6)
    let target = current < 0?"regen":"usage";

    window.demo_fakeUsage[target] =
       (window.demo_fakeUsage[target] || 0) + fakeUsage;

    let elem = document.
        getElementsByClassName("usage-statistics")[0].
            getElementsByClassName(target)[0].
                getElementsByClassName("value-text")[0];

    fakeUsage = Math.floor(window.demo_fakeUsage[target]);

    if (elem.innerText != fakeUsage) {
        elem.innerText =  fakeUsage; }
    //
};