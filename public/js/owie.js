// TODO: add static metadata/initial value fetch (e.g.: fetching owie-version, owie-name initial progress values?...)
//       (or we just use the old template system of the old owie web to set them statically to the html...)
// TODO: maybe create the battery and temp html container via template, since the autoupdate will be called anyways...
//       (as done in the stats...)
// AUTOUPDATE is now implemented with demo mode.
// Demo Mode starts polling /autoupdate endpoint every second

/**
 * Router Class (used for SPA Navigation)
 * @type {{checkRoute: Router.checkRoute, init: (function(): Router), routes: *[], removeRoute: (function(*): Router), addRoute: (function(*, *, *): Router), scopeDestroyTaskID: number, addRoutes: (function(*): Router), scopeDestroyTasks: *[], listener: null, onScopeDestroy: (function(*): Router)}}
 */
const Router = {
  lastHash: null,
  //Initializer function. Call this to change listening for window changes.
  init: function () {
    //Remove previous event listener if set
    if (this.listener !== null) {
      window.removeEventListener('popstate', this.listener);
      this.listener = null;
    }
    //Set new listener for "popstate"
    this.listener = window.addEventListener('popstate', function () {
      //Callback to Route checker on window state change
      this.checkRoute.call(this);
    }.bind(this));
    //Call initial routing as soon as thread is available
    setTimeout(function () {
      this.checkRoute.call(this);
    }.bind(this), 0);
    return this;
  },
  //Adding a route to the list
  addRoute: function (name, url, cb) {
    var route = this.routes.find(function (r) {
      return r.name === name;
    });
    url = url.replace(/\//ig, '/');
    if (route === void 0) {
      this.routes.push({
        callback: cb,
        name: name.toString().toLowerCase(),
        url: url
      });
    } else {
      route.callback = cb;
      route.url = url;
    }
    return this;
  },
  //Adding multiple routes to list
  addRoutes: function (routes) {
    var _this = this;
    if (routes === void 0) {
      routes = [];
    }
    routes
      .forEach(function (route) {
        _this.addRoute(route.name, route.url, route.callback);
      });
    return this;
  },
  //Removing a route from the list by route name
  removeRoute: function (name) {
    name = name.toString().toLowerCase();
    this.routes = this.routes
      .filter(function (route) {
        return route.name != name;
      });
    return this;
  },
  //Check which route to activate
  checkRoute: function () {
    //Get hash
    var hash = window.location.hash.substr(1).replace(/\//ig, '/');
    //Default to first registered route. This should probably be your 404 page.
    var route = this.routes[0];
    //Check each route
    for (var routeIndex = 0; routeIndex < this.routes.length; routeIndex++) {
      var routeToTest = this.routes[routeIndex];
      if (routeToTest.url == hash) {
        route = routeToTest;
        break;
      }
    }

    // test no reroute
    if (hash === this.lastHash) {
      console.info("This is the same Route!");
      //Reset destroy task list
      // this.scopeDestroyTasks = [];
      return;
    }

    //Run all destroy tasks
    this.scopeDestroyTasks
      .forEach(function (task) {
        task();
      });
    //Reset destroy task list
    this.scopeDestroyTasks = [];
    //Fire route callback
    // set this hast to the lastHash property, so we can find out if we need to trigger the route
    this.lastHash = hash;
    route.callback.call(window);
  },
  //Register scope destroy tasks
  onScopeDestroy: function (cb) {
    this.scopeDestroyTasks.push(cb);
    return this;
  },
  //Tasks to perform when view changes
  scopeDestroyTasks: [],
  //Registered Routes
  routes: [],
  //Listener handle for window events
  listener: null,
  scopeDestroyTaskID: 0
  // return Router;
};

const genericRouterController = function (elementIdName, callback) {
  return function initialize() {
    toggleResponsiveNav(true);
    toggleView(elementIdName, true);
    //Destroy elements on exit
    Router.onScopeDestroy(genericExitController);
    if (callback) {
      callback('init');
    }
  };
  //Unloading function
  function genericExitController() {
    toggleView(elementIdName, false);
    if (callback) {
      callback('exit');
    }
  }
};

// register routes
Router.addRoutes([
  {
    name: "Home",
    url: "",
    callback: genericRouterController('home')
  },
  {
    name: "Settings",
    url: "settings",
    callback:genericRouterController('settings', (state) => {
      let defaultNav = document.querySelector('.navbar .default');
      let settingsNav = document.querySelector('.navbar .settings');
      if (state === 'init') {
        settingsNav.style.display = "flex";
        settingsNav.classList.add("active");
        defaultNav.style.display = "none";
        defaultNav.classList.remove( "active");
      } else {
        settingsNav.style.display = "none";
        settingsNav.classList.remove("active");
        defaultNav.style.display = "flex";
        defaultNav.classList.add( "active");

      }
    })
  },
  {
    name: "Stats",
    url: "stats",
    callback:genericRouterController('stats')
  },
  {
    name: "Monitor",
    url: "monitor",
    callback:genericRouterController('monitor', (state) => {
      if (state === 'init') {
        Monitoring.init();
        Monitoring.connect();
      } else {
        Monitoring.stop()
      }
    })
  },
  {
    name: "Development WiFi Connect",
    url: "wifi",
    callback:genericRouterController('wifi')
  },

])

/**
 * Monitoring class
 */

const Monitoring = {
  packets: [],
  lastError: '',
  unknownData: '',
  term: null,
  button: null,
  socket: null,
  init: function () {
    this.term = document.getElementById("term");
    this.button = document.getElementById('startstop');
  },
  formatPacket: function (byteArray) {
    let s = '';
    byteArray.forEach((byte) => {
      s += ('0' + byte.toString(16)).slice(-2);
      s += ' ';
    });
    return s;
  },

  updateTerminal: function () {
    let text = '';
    for (let i = 0; i < this.packets.length; i++) {
      text += this.packets[i] || '';
      text += '\n';
    }
    this.term.value = (text + this.unknownData + this.lastError);
  },

  stop: function () {
    this.socket.close();
    this.socket = undefined;
  },

  connect: function () {
    let _self = this;
    this.socket = new WebSocket(`ws://${window.location.hostname}:3000/rawdata`);
    this.socket.binaryType = "arraybuffer";
    this.socket.onopen = function () {
      _self.lastError = 'connected';
      _self.updateTerminal();
      _self.button.innerText = 'Stop';
      _self.button.setAttribute('onclick', 'Monitoring.stop();');
    }
    this.socket.onclose = function () {
      _self.lastError = 'disconnected';
      _self.updateTerminal();
      // Packets will get erased right after we reconnect.
      _self.packets = [];
      _self.unknownData = '';
      _self.button.innerText = 'Connect';
      _self.button.setAttribute('onclick', 'Monitoring.connect();');
    }
    this.socket.onmessage = function (event) {
      if (!event.data instanceof ArrayBuffer) {
        _self.lastError = "non-binary data";
        _self.updateTerminal();
        return;
      }
      const data = new Uint8Array(event.data);
      if (data[0] == 0) {
        _self.unknownData = `Unknown data: ${_self.formatPacket(data.slice(1))}\n`;
        _self.updateTerminal();
        return;
      }
      if (data.length < 4) {
        _self.lastError = `data is too short, length = ${data.length}`;
        _self.updateTerminal();
        return;
      }
      _self.packets[data[3]] = _self.formatPacket(data);
      _self.updateTerminal();
    };

    this.socket.onerror = function (error) {
      _self.lastError = "websocket error";
      _self.updateTerminal();
    };
  }
}

function toggleView (elementId, visible = true) {
  const overlay = document.getElementById(elementId);
  if (visible) {
    overlay.style.display = "block";
    overlay.style.opacity = "1"
  } else {
    overlay.style.opacity = "0";
    setTimeout(function(){
      overlay.style.display = "none";
    }, 1);

  }
}

function callOwieApi (type, endpoint, data, cb) {
  let xhr = new XMLHttpRequest(),
      formData = null;
  xhr.open(type, "/"+endpoint);
  xhr.onload = (data, dat) => {
    if (xhr.status === 200) {
      if (cb) {
        cb(xhr.response);
      }
    } else {
      showAlerter("error",   "Error!</span><br>" + xhr.status);
    }
  }
  if (data) {
    formData = new FormData(data);
  }
  xhr.send(formData);
}

function handleEmptyFormFields (form) {
  let hasEmptyValues = false;
  for (let i = 0, element; element = form.elements[i++];) {
    element.classList.remove("required");
    if (element.value === "" && element.type !== "submit") {
      element.classList.add("required");
      hasEmptyValues = true;
    }
  }
  return hasEmptyValues
}

function areWeReady(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

const toggleResponsiveNav = (forceClose = false) => {
  let nav = document.getElementById("navbar");
  if (forceClose) {
    nav.classList.remove("responsive");
    return;
  }
  nav.classList.contains("responsive") ? nav.classList.remove("responsive") : nav.classList.add("responsive");
}

const toggleWifiPwVisibility = () => {
  let password = document.querySelector("#wifipw");
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
}
const toggleWifiDevPwVisibility = () => {
  let password = document.querySelector("#wifi-de-pw");
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
}

/**
 * API Call to update the OWIE WiFi Settings
 * @param e
 * @returns {boolean}
 */
const updateWifiSettings = (e) => {
  if (e.preventDefault) e.preventDefault();
  let form = document.querySelector("#wifi-settings");
  // check for empty values, set error decoration and return if empty fields are found!
  if (handleEmptyFormFields(form)) return false;
  callOwieApi("POST", "settings", form , () =>{
    showAlerter("success",  "Update was successful!<br>OWIE is rebooting...");
  })
  // We must return false to prevent the default form behavior
  return false;
}

/**
 * API Call to update the OWIE WiFi Settings
 * @param e
 * @returns {boolean}
 */
const updateWifiDevSettings = (e) => {
  if (e.preventDefault) e.preventDefault();
  let form = document.querySelector("#wifi-dev");
  // check for empty values, set error decoration and return if empty fields are found!
  if (handleEmptyFormFields(form)) return false;
  callOwieApi("POST", "wifi", form, () =>{
    showAlerter("success",  "WiFi Settings saved!<br>OWIE is rebooting...");
  })
  // We must return false to prevent the default form behavior
  return false;
}

/**
 * API call to unlock the board
 */
const disarmBoard = (btn) => {
  callOwieApi("GET", "lock?unlock", null, (data) => {
    showAlerter("success","Successfully unlocked!<br>Please restart your Board!");
    btn.parentElement.style.display = "none";
  })
}

const showAlerter = (alertType, alertText, showClose=true) => {
  const alerter = document.getElementById("toaster");
  const alertMsg = document.getElementById("alert-msg");
  // first hide an eventually open Alerter
  alerter.classList.remove("show");
  // now we clear the alerter classes
  alerter.classList.remove("success", "error", "warning");
  // add new class
  alerter.classList.add(alertType);
  // set text
  alertMsg.innerHTML = alertText;
  // unset close if needed
  document.getElementById("toaster-close").style.display = showClose?"block":"none";
  // show it now
  alerter.classList.add("show");
}

const updateBoardLockingButtons = function () {
  const lockingContent = document.querySelector(".board-locking.content");
  const contentDisabled = document.querySelector(".board-locking.content .bl-disabled")
  const contentEnabled = document.querySelector(".board-locking.content .bl-enabled");
  const isEnabled = !!lockingContent.dataset.enabled;
  if (isEnabled) {
    contentDisabled.classList.add('hidden');
    contentEnabled.classList.remove('hidden');
  } else {
    contentDisabled.classList.remove('hidden');
    contentEnabled.classList.add('hidden');
  }
}

const toggleArmingBoard = () => {
    callOwieApi('GET', "lock?toggleArm", null, (data) => {
      const lockingContent = document.querySelector(".board-locking.content");
      lockingContent.dataset.enabled = data;
      updateBoardLockingButtons();
    })
}

const toggleBatteryInfo = () => {
  const batHeader = document.querySelector(".battery-statistics");
  if (!batHeader.classList.contains("open")) {
    batHeader.classList.add("open");
  } else {
    batHeader.classList.remove("open");
  }
}

const onReady = () => {
  Router.init();
  const unlockButton = document.querySelector(".unlock-button");
  unlockButton.addEventListener('click', (e) => {
    disarmBoard(unlockButton);
  })

  // firmware update section
  const firmwareInput = document.getElementById("fwUpdInput");
  const updateUpdateBtn = document.getElementById("fwUpdBtn");
  updateUpdateBtn.addEventListener('click', (e) => {
    firmwareInput.click();
  })

  //  setting firmware update
  firmwareInput.onchange = (event) => {
    if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    const fileName = file.name;

    // only allow .bin || .bin.gz!
    let re = /(\.bin|\.bin\.gz)$/gm;
    if (!re.exec(fileName)) {
      showAlerter("error","Only .bin or .bin.gz files are allowed!");
      return false;
    }
    let xhr = new XMLHttpRequest(),
        updateProgress = document.querySelector(".firmware .update-upload-progress"),
        updateText = updateProgress.querySelector(".update-text"),
        updateLoader = updateProgress.querySelector(".lds-spinner");
    xhr.open("POST", "/upgrade");
    xhr.upload.addEventListener("progress", ({loaded, total}) => {
      let fileLoaded = Math.floor((loaded / total) * 100);
      updateText.innerHTML = `File upload in progress... (${fileLoaded}%)`;
      if (loaded == total) {
        updateText.innerHTML = "Firmware Update in progress...";
      }
    });
    xhr.onload = () => {
      let countdown = 15;
      updateLoader.classList.add('hidden');
      if (xhr.status === 200) {
        showAlerter("success", "Update was successful!<br>OWIE is rebooting...");
        setInterval(() => {
          if (countdown === 0) {
            updateText.innerHTML = "Reloading OWIE..."
            window.location.replace("/");
            return;
          }
          updateText.innerHTML = `IMPORTANT: keep the board powered on until Owie Wi-Fi becomes available again!<br>Autoreload after ${countdown} seconds!`;
          countdown--;
        }, 1000);
      } else {
        showAlerter("error", "Error!</span><br>" + xhr.status);
      }
    }
    xhr.setRequestHeader('Content-Type', "application/octet-stream");
    xhr.setRequestHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
    xhr.send(file);
    updateProgress.classList.remove('hidden');
  }
  // end firmware update section

  // settings WiFI update
  const wifiUpdateForm = document.getElementById("wifi-settings");
  if (wifiUpdateForm.attachEvent) {
    wifiUpdateForm.attachEvent("submit", updateWifiSettings);
  } else {
    wifiUpdateForm.addEventListener("submit", updateWifiSettings);
  }
  // end settings WiFi update

 // update Dev WiFi
  const wifiDevUpdateForm = document.getElementById("wifi-dev");
  if (wifiDevUpdateForm.attachEvent) {
    wifiDevUpdateForm.attachEvent("submit", updateWifiDevSettings);
  } else {
    wifiDevUpdateForm.addEventListener("submit", updateWifiDevSettings);
  }
  // end settings WiFi update

  // start handle board arming visibility
  const lockingContent = document.querySelector(".board-locking.content");

  if (lockingContent.dataset.canenable) {
    const inactiveContent = document.querySelector(".board-locking.content .bl-inactive");
    inactiveContent.classList.add('hidden');
    updateBoardLockingButtons();
  }
  // end handle board armin visibility

  // Set demo mode trigger
  const demoModeTrigger = document.querySelector(".owie-version");
  if (demoModeTrigger.attachEvent) {
    demoModeTrigger.attachEvent("click", Owie.toggleDemo);
  } else {
    demoModeTrigger.addEventListener("click", Owie.toggleDemo);
  }
  // end demo mode trigger
}

/**
 * Owie class
 * This is the main class/function combining all logic
 *
 */
const Owie = (function () {
    function toggleDemo() {
      window.toggleDemoMode();
    }

    return {
      "toggleDemo": toggleDemo,
      monitoring: Monitoring,
      router: Router
    }
  }()
);
areWeReady(onReady);


