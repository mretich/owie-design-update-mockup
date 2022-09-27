let statsDomWritten = false;
window.toggleDemoMode = function () {
  if (window.demo_intervalId) {
    window.clearInterval(window.demo_intervalId);
    delete window.demo_intervalId;
    return;
  }
  window.demo_iterate();
  window.demo_intervalId = window.setInterval(window.demo_iterate, 1000);
};


window.demo_iterate = function () {
  callOwieApi("GET", "autoupdate", null, (data) => {
    if (data) {
      let jsonData = JSON.parse(data);

      document.getElementsByClassName("uptime")[0].getElementsByClassName("value-text")[0].innerText = jsonData.uptime.value;
      let style = document.getElementsByTagName("body")[0].style
      let props = {
        "--owie-percentage-int": jsonData.owie_percentage.value,
        "--bms-percentage-int": jsonData.bms_percentage.value,
        "--current": jsonData.current.value,
      }

      for (const [key, value] of Object.entries(props)) {
        style.setProperty(key, value);
      }

      document.getElementsByClassName("current-text")[0].getElementsByClassName("value-text")[0].innerText =jsonData.current.value;

      document.getElementsByClassName("voltage-text")[0].getElementsByClassName("value-text")[0].innerText = jsonData.voltage.value;

      let nCells = 0;
      for (let c of document.getElementsByClassName("battery-voltage-text")) {
        let cellVolt = jsonData.battery_cells.value[nCells];
        c.innerText = cellVolt;
        nCells++;
      }

      // NEED to calculate the percentage for progressbar
      // min:0 max:60
      let temps = 0;
      for (let c of document.querySelectorAll(".temp-item")) {
        let temp = jsonData.temperatures.value[temps];
        let percentage = 100/60*temp;
        let gaugeBar = c.querySelector('.temperature-gauge__bar');
        let lbl = c.querySelector('.value-text');
        gaugeBar.style.width = percentage + "%";
        lbl.innerText = temp;

        temps++;
      }

      let usage = document.getElementsByClassName("usage-statistics")[0].getElementsByClassName("usage")[0].getElementsByClassName("value-text")[0];
      let regen = document.getElementsByClassName("usage-statistics")[0].getElementsByClassName("regen")[0].getElementsByClassName("value-text")[0];

      if (usage.innerText != jsonData.usage.value) {
        usage.innerText = jsonData.usage.value;
      }
      if (regen.innerText != jsonData.regen.value) {
        regen.innerText = jsonData.regen.value;
      }

      // generate and update the stats Page!
      let statsContainer = document.querySelector('.stats.content-container .wrapper');
      let template = document.getElementById("stat-container-template");

      setTimeout(() => {
        Object.entries(jsonData).forEach((entry) => {
          const [key, item] = entry;
          if (!Array.isArray(item.value)) {
            item.value =  [item.value];
          }
          if (!statsDomWritten) {
            item.value.forEach((value, idx) => {
              let rowTpl = template.content.cloneNode(true) ;
              rowTpl.firstElementChild.classList.add(`stats-${key}_${idx}`);
              statsContainer.append(rowTpl);
            })

          }
          item.value.forEach((value, idx) => {
            let baseEl = document.getElementsByClassName(`stats-${key}_${idx}`)[0];
            baseEl.querySelector('.owie-label').innerHTML = key.toUpperCase() + "&nbsp;" + ((item.value.length > 1)?idx:"");
            baseEl.querySelector('.value-text').innerHTML = value;
            baseEl.querySelector('.value-label').innerHTML = "&nbsp;" + item.unit;
          });
        });
        statsDomWritten = true;
      }, 0);
    }
  });
};