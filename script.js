/* ==========================================================================
   Rahul Online Centre - Master Script Engine (Full Integrated Version)
   - Google Sheets Live Sync (Status, Ticker, Timing, UPI, Notice)
   - Dark Mode & Drawer Navigation
   - Token & Service Calculation Engine
   - Dynamic UPI / QR & Payment Buttons on apply.html
   ========================================================================== */

// 1. आपकी Google Sheet का लाइव CSV लिंक
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1n-3SAy9Yfh7qTx8oiiz9eoCxaUUJTQuj2g1btYrp74s/gviz/tq?tqx=out:csv";
let currentUPI = "9546565270@ybl"; // डिफ़ॉल्ट बैकअप UPI

// 2. डार्क मोड (Dark Mode Toggle & Persistence)
const themeBtn = document.getElementById("themeBtn");
if (localStorage.getItem("roc_theme") === "dark") {
  document.body.classList.add("dark-mode");
  if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

if (themeBtn) {
  themeBtn.onclick = function () {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("roc_theme", isDark ? "dark" : "light");
    themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  };
}

// 3. साइड मेनू ड्रॉर (Drawer Navigation Toggle)
const menuBtn = document.getElementById("menuBtn");
const closeDrawerBtn = document.getElementById("closeDrawer");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");

function openSideMenu() {
  if (drawer) drawer.classList.add("active");
  if (overlay) overlay.classList.add("active");
}

function closeSideMenu() {
  if (drawer) drawer.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}

if (menuBtn) menuBtn.onclick = openSideMenu;
if (closeDrawerBtn) closeDrawerBtn.onclick = closeSideMenu;
if (overlay) overlay.onclick = closeSideMenu;

// 4. दुकान की स्थिति (Status Helper)
function applyShopStatus(text, bg, color) {
  const homeBadge = document.getElementById("homeStoreStatus");
  const drawerBadge = document.getElementById("drawerStoreStatus");
  const serviceBadge = document.getElementById("serviceStoreStatus");

  [homeBadge, drawerBadge, serviceBadge].forEach((badge) => {
    if (badge) {
      badge.innerText = text;
      badge.style.background = bg;
      badge.style.color = color;
    }
  });
}

function setTimeBasedStatus() {
  const currentHour = new Date().getHours();
  if (currentHour >= 8 && currentHour < 20) {
    applyShopStatus("● अभी खुली है (Open)", "#dcfce7", "#15803d");
  } else {
    applyShopStatus("● अभी बंद है (Closed)", "#fee2e2", "#dc2626");
  }
}

// 5. Google Sheet से लाइव डेटा लोड करना
function syncWithGoogleSheet() {
  fetch(SHEET_CSV_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.text();
    })
    .then((csvText) => {
      const rows = csvText.trim().split("\n");
      const settings = {};

      rows.forEach((row) => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 2) {
          const key = cols[0].replace(/^["']|["']$/g, "").trim().toLowerCase();
          const val = cols[1].replace(/^["']|["']$/g, "").trim();
          settings[key] = val;
        }
      });

      // (A) Ticker
      if (settings["ticker"]) {
        const tickerEl = document.getElementById("liveTickerText");
        if (tickerEl) tickerEl.innerText = settings["ticker"];
      }

      // (B) Timing
      if (settings["timing"]) {
        const timingEl = document.getElementById("homeStoreTiming");
        if (timingEl) timingEl.innerText = settings["timing"];
      }

      // (C) Emergency Notice
      const noticeBox = document.getElementById("liveEmergencyNotice");
      const noticeText = document.getElementById("emergencyNoticeText");
      if (noticeBox && noticeText) {
        if (settings["notice"] && settings["notice"].trim().length > 0) {
          noticeText.innerText = settings["notice"];
          noticeBox.style.display = "flex";
        } else {
          noticeBox.style.display = "none";
        }
      }

      // (D) Shop Status
      const statusVal = settings["status"] ? settings["status"].toLowerCase() : "";
      if (statusVal === "open") {
        applyShopStatus("● अभी खुली है (Open)", "#dcfce7", "#15803d");
      } else if (statusVal === "closed") {
        applyShopStatus("● आज बंद है (Closed)", "#fee2e2", "#dc2626");
      } else {
        setTimeBasedStatus();
      }

      // (E) UPI ID
      if (settings["upi"]) {
        currentUPI = settings["upi"];
        const upiEl = document.getElementById("upiIdText");
        if (upiEl) upiEl.innerText = currentUPI;
      }
    })
    .catch((err) => {
      console.warn("Google Sheet sync error:", err);
      setTimeBasedStatus();
    });
}

// 6. टोकन फॉर्म व पेमेंट मोड लॉजिक (Token Form & Dynamic Payment Logic)
function initTokenFormLogic() {
  const serviceCheckboxes = document.querySelectorAll('input[type="checkbox"][name="services"], input[type="checkbox"][data-price]');
  const totalFeeEl = document.getElementById("totalFeeAmount") || document.querySelector(".total-fee-val");
  const feeDisplayBox = document.querySelector(".fee-box") || document.getElementById("feeBox");
  const paymentRadios = document.querySelectorAll('input[name="paymentMode"], input[name="payment_mode"], input[name="pay_mode"]');
  const qrContainer = document.getElementById("onlineQrSection") || document.getElementById("qrContainer");

  // शुल्क कैलकुलेट करना
  function calculateTotal() {
    let total = 0;
    serviceCheckboxes.forEach((cb) => {
      if (cb.checked) {
        const price = parseInt(cb.getAttribute("data-price") || cb.value.match(/\d+/) || 0, 10);
        total += isNaN(price) ? 0 : price;
      }
    });

    const totalText = "₹" + total;
    const feeElem = document.querySelector(".fee-amount") || document.getElementById("feeText");
    if (feeElem) feeElem.innerText = totalText;
    
    // अगर कुल शुल्क का कोई बड़ा टेक्स्ट है
    const allFeeTexts = document.querySelectorAll(".fee-total-text, #totalFee");
    allFeeTexts.forEach(el => el.innerText = totalText);

    updatePaymentDisplay(total);
  }

  // पेमेंट सेक्शन (QR और PhonePe/GPay बटन दिखाना या छिपाना)
  function updatePaymentDisplay(total) {
    let isOnlineSelected = false;
    paymentRadios.forEach((radio) => {
      if (radio.checked && (radio.value.toLowerCase().includes("online") || radio.value.toLowerCase().includes("upi") || radio.id.includes("online") || radio.id.includes("upi"))) {
        isOnlineSelected = true;
      }
    });

    // अगर कोई रेडियो बटन चेक नहीं है, पर दूसरा वाला चुना हुआ है
    const onlineRadio = document.querySelector('input[type="radio"][value*="UPI"], input[type="radio"][value*="ऑनलाइन"], #payOnline');
    if (onlineRadio && onlineRadio.checked) {
      isOnlineSelected = true;
    }

    if (qrContainer) {
      if (isOnlineSelected) {
        qrContainer.style.display = "block";
      } else {
        qrContainer.style.display = "none";
      }
    }
  }

  serviceCheckboxes.forEach((cb) => cb.addEventListener("change", calculateTotal));
  paymentRadios.forEach((radio) => radio.addEventListener("change", () => calculateTotal()));

  // शुरुआत में चलाएं
  calculateTotal();
}

// पेज लोड
document.addEventListener("DOMContentLoaded", () => {
  setTimeBasedStatus();
  syncWithGoogleSheet();
  initTokenFormLogic();
});

setInterval(syncWithGoogleSheet, 60000);
