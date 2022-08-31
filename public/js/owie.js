
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
  setTimeout(()=>{nav.style.opacity = opVal},1);
}
const navClose = () => {
  const nav = document.querySelector('.nav');
  nav.style.opacity = "0";
}



const openFirmwareOverlay = () => {
  navClose();
  const overlay = document.querySelector('.firmware-overlay');
  overlay.style.display = "flex";
  setTimeout(()=>{overlay.style.opacity = "1"},1);
}
const closeFirmwareOverlay = () => {
  const overlay = document.querySelector('.firmware-overlay');
  overlay.style.opacity = "0";
  setTimeout(()=>{overlay.style.display = "none"},1);
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
    updateProgress = document.querySelector(".firmware-overlay .wrapper .update-upload-progress"),
    updateText = updateProgress.querySelector(".update-text"),
    updateLoader = updateProgress.querySelector(".lds-spinner");

  updateForm.addEventListener("click", () =>{
    fileInput.click();
  });

  fileInput.onchange = () => {
    let toaster = document.getElementById("toaster");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/upgrade");
    xhr.upload.addEventListener("progress", ({loaded, total}) => {
      let fileLoaded = Math.floor((loaded / total) * 100);
      updateText.innerHTML = `File upload in progress... (${fileLoaded}%)`;
      if(loaded == total){
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
          countdown --;
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

}
areWeReady(onReady);


