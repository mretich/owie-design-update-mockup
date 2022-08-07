/**
 * Copyright (c) 2022, LOGIN EDV-Software, Beratung und Training GmbH
 */
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

const openBatteryOverlay = () => {
  navClose();
  const bat = document.querySelector('.battery-overlay');
  bat.style.display = "flex";
  setTimeout(()=>{bat.style.opacity = "1"},1);
}

const toggleBatteryInfo = () => {
  console.log("sdsdasd");
  const batInf = document.querySelector(".battery-content");
  if (batInf.style.maxHeight) {
    batInf.style.maxHeight = null;
  } else {
    batInf.style.maxHeight = "350px";
  }
}

const onReady = () => {
  console.log("DOM is available!");
  const nav = document.querySelector('.nav');
  nav.addEventListener('transitionend', (e) => {
    console.log('Transition ended', e, nav);
    if (nav.style.opacity === '0') nav.style.display = 'none';
  });
}
areWeReady(onReady);


