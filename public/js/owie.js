// TODO: extract toaster/alerter calls to a separate function
// TODO: create a function/class for updating the content via API / probably add stop/start functionality?
//       (as discussed with Richard, we will make this as simple as possible by looping the properties and set them to the
//        corresponding named classes in the DOM... except bar values, since they are set to the css variables and calculated via css)
// TODO: add static metadata/initial value fetch (e.g.: fetching owie-version, owie-name initial progress values?...)
//       (or we just use the old template system of the old owie web to set them statically to the html...)
// TODO: move demo into backend
// TODO: Where to put the OWIE name, since it doesnt look to good in the Progressbar (moving percentage if too long)
// TODO: find another element to start DEMO Mode ;P
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
    name: "Firmware Update",
    url: "firmware",
    callback:genericRouterController('firmware')
  },

])

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
//
// function hideContent (className) {
//   const overlay = document.querySelector(`.${className}`);
//   overlays.forEach((overlay) => {
//     console.log(overlay);
//     overlay.style.opacity = "0";
//     setTimeout(() => {
//       overlay.style.display = "none"
//     }, 1);
//   })
// }

function areWeReady(fn) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

//
// const navOpen = (opVal) => {
//     const nav = document.querySelector('.nav');
//     nav.style.display = "flex";
//     setTimeout(() => {
//         nav.style.opacity = opVal
//     }, 1);
// }
// const navClose = () => {
//     const nav = document.querySelector('.nav');
//     nav.style.opacity = "0";
// }
//
// const openFirmwareOverlay = () => {
//     navClose();
//     const overlay = document.querySelector('.firmware.overlay');
//     overlay.style.display = "flex";
//     setTimeout(() => {
//         overlay.style.opacity = "1"
//     }, 1);
// }
const openSettingsOverlay = () => {
    // navClose();
    const overlay = document.querySelector('.settings.overlay');
    overlay.style.display = "flex";
    setTimeout(() => {
        overlay.style.opacity = "1"
    }, 1);
}
// const openStatsOverlay = () => {
//     navClose();
//     const overlay = document.querySelector('.stats.overlay');
//     overlay.style.display = "flex";
//     setTimeout(() => {
//         overlay.style.opacity = "1"
//     }, 1);
// }
const closeOverlay = () => {
    const overlays = document.querySelectorAll('.overlay');
    overlays.forEach((overlay) => {
        console.log(overlay);
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none"
        }, 1);
    })

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

/**
 * API Call to update the OWIE WiFI Settings
 * @param e
 * @returns {boolean}
 */
const updateWifiSettings = (e) => {
  if (e.preventDefault) e.preventDefault();
  let formData = document.querySelector("#wifi-settings")
  let toaster = document.getElementById("toaster");
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/settings");
  // TODO: call API and create toaster!
  xhr.onload = () => {
    let countdown = 15;
    // updateLoader.classList.add('hidden');
    if (xhr.status === 200) {
      toaster.classList.add("success");
      document.getElementById("alert-msg").innerHTML = "Update was successful!<br>OWIE is rebooting...";
      toaster.classList.add("show");

      // setInterval(() => {
      //     if (countdown === 0) {
      //         updateText.innerHTML = "Reloading OWIE..."
      //         window.location.replace("/");
      //         return;
      //     }
      //     updateText.innerHTML = `IMPORTANT: keep the board powered on until Owie Wi-Fi becomes available again!<br>Autoreload after ${countdown} seconds!`;
      //     countdown--;
      // }, 1000);
    } else {
      toaster.classList.remove("success");
      document.getElementById("alert-msg").innerHTML = "Error!</span><br>" + xhr.status;
      toaster.classList.add("show");
    }
  }
  let data = new FormData(formData);
  xhr.send(data);
  // You must return false to prevent the default form behavior
  return false;

}

const enableBoardLocking = (blenable) => {
  // TODO: call API to enable/disable the feature
  if (blenable) {
    document.querySelector(".bl-enabled").classList.remove('hidden');
    document.querySelector(".bl-disabled").classList.add('hidden');
  } else {
    document.querySelector(".bl-disabled").classList.remove('hidden');
    document.querySelector(".bl-enabled").classList.add('hidden');
  }
}


const toggleBatteryInfo = () => {
  const batInf = document.querySelector(".battery-content");
  if (batInf.style.maxHeight) {
    batInf.style.maxHeight = null;
  } else {
    batInf.style.maxHeight = "100%";
  }
}

const onReady = () => {
  Owie.router.init();
  console.log("DOM is available!");
  // const nav = document.querySelector('.nav');
  const unlockButton = document.querySelector(".unlock-button");
  unlockButton.addEventListener('click', (e) => {
    let toaster = document.getElementById("toaster");
    toaster.classList.add("success");
    document.getElementById("alert-msg").innerHTML = "Successfully unlocked!<br>Please restart your Board!";
    toaster.classList.add("show");
    unlockButton.parentElement.style.display = "none";
  })
  // nav.addEventListener('transitionend', (e) => {
  //   console.log('Transition ended', e, nav);
  //   if (nav.style.opacity === '0') nav.style.display = 'none';
  // });

  // firmware update section
  const updateForm = document.querySelector("#update-form"),
    fileInput = document.querySelector("#updInput"),
    updateProgress = document.querySelector(".firmware .wrapper .update-upload-progress"),
    updateText = updateProgress.querySelector(".update-text"),
    updateLoader = updateProgress.querySelector(".lds-spinner");

  updateForm.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.onchange = () => {
    let toaster = document.getElementById("toaster");
    let xhr = new XMLHttpRequest();
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
      // updateLoader.classList.add('hidden');
      if (xhr.status === 200) {
        toaster.classList.add("success");
        document.getElementById("alert-msg").innerHTML = "Update was successful!<br>OWIE is rebooting...";
        toaster.classList.add("show");

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
        toaster.classList.remove("success");
        document.getElementById("alert-msg").innerHTML = "Error!</span><br>" + xhr.status;
        toaster.classList.add("show");
      }
    }
    let data = new FormData(updateForm);
    xhr.send(data);
    updateForm.classList.add("hidden");
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
}


/**
 * Owie class
 * This is the main class/function combining all logic
 *
 */
const Owie = (function () {
    function Test() {
    }

    //Initializer function. Call this to change listening for window changes.
    // Router.init = function () {
    //
    // }
    Test.log = (msg) => {
      console.log(msg);
    }
    return {test: Test, router: Router}
  }()
);
areWeReady(onReady);


