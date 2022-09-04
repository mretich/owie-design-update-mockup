function areWeReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

const navOpen = (opVal) => {
    const nav = document.querySelector('.nav');
    nav.style.display = "flex";
    setTimeout(() => {
        nav.style.opacity = opVal
    }, 1);
}
const navClose = () => {
    const nav = document.querySelector('.nav');
    nav.style.opacity = "0";
}

const openFirmwareOverlay = () => {
    navClose();
    const overlay = document.querySelector('.firmware.overlay');
    overlay.style.display = "flex";
    setTimeout(() => {
        overlay.style.opacity = "1"
    }, 1);
}
const openSettingsOverlay = () => {
    navClose();
    const overlay = document.querySelector('.settings.overlay');
    overlay.style.display = "flex";
    setTimeout(() => {
        overlay.style.opacity = "1"
    }, 1);
}
const openStatsOverlay = () => {
    navClose();
    const overlay = document.querySelector('.stats.overlay');
    overlay.style.display = "flex";
    setTimeout(() => {
        overlay.style.opacity = "1"
    }, 1);
}
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

const myFunction = () => {
    let x = document.getElementById("myNavbar");
    if (x.className === "navbar") {
        x.className += " responsive";
    } else {
        x.className = "navbar";
    }
}

const toggleWifiPwVisibility = () => {
    let password = document.querySelector("#wifipw");
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
}

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
    console.log("DOM is available!");
    const nav = document.querySelector('.nav');
    const unlockButton = document.querySelector(".unlock-button");
    unlockButton.addEventListener('click', (e) => {
        let toaster = document.getElementById("toaster");
        toaster.classList.add("success");
        document.getElementById("alert-msg").innerHTML = "Successfully unlocked!<br>Please restart your Board!";
        toaster.classList.add("show");
        unlockButton.parentElement.style.display = "none";
    })
    nav.addEventListener('transitionend', (e) => {
        console.log('Transition ended', e, nav);
        if (nav.style.opacity === '0') nav.style.display = 'none';
    });

    // firmware update section
    const updateForm = document.querySelector("#update-form"),
        fileInput = document.querySelector("#updInput"),
        updateProgress = document.querySelector(".firmware.overlay .wrapper .update-upload-progress"),
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
areWeReady(onReady);


