/* ==========================================================================
   Rahul Online Centre - Master Script Engine with Google Sheets Live Sync
   ========================================================================== */

// 1. आपकी Google Sheet का लाइव CSV लिंक
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1n-3SAy9Yfh7qTx8oiiz9eoCxaUUJTQuj2g1btYrp74s/gviz/tq?tqx=out:csv";

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

// डिफ़ॉल्ट टाइम-आधारित स्टेटस (सुबह 8 से रात 8)
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

      // (A) Ticker सूचना पट्टी अपडेट
      if (settings["ticker"]) {
        const tickerEl = document.getElementById("liveTickerText");
        if (tickerEl) tickerEl.innerText = settings["ticker"];
      }

      // (B) दुकान का समय अपडेट
      if (settings["timing"]) {
        const timingEl = document.getElementById("homeStoreTiming");
        if (timingEl) timingEl.innerText = settings["timing"];
      }

      // (C) आपातकालीन सूचना (Emergency Notice)
      const noticeBox = document.getElementById("liveEmergencyNotice");
      const noticeText = document.getElementById("emergencyNoticeText");
      if (noticeBox && noticeText) {
        if (settings["notice"] && settings["notice"].trim().length > 0) {
          noticeText.innerText = settings["notice"];
          noticeBox.style.display = "flex"; // नोटिस होने पर ही दिखेगा
        } else {
          noticeBox.style.display = "none"; // खाली होने पर गायब रहेगा
        }
      }

      // (D) दुकान का स्टेटस (Open/Closed/Auto)
      const statusVal = settings["status"] ? settings["status"].toLowerCase() : "";
      if (statusVal === "open") {
        applyShopStatus("● अभी खुली है (Open)", "#dcfce7", "#15803d");
      } else if (statusVal === "closed") {
        applyShopStatus("● आज बंद है (Closed)", "#fee2e2", "#dc2626");
      } else {
        setTimeBasedStatus();
      }

      // (E) UPI ID अपडेट
      if (settings["upi"]) {
        const upiEl = document.getElementById("upiIdText");
        if (upiEl) upiEl.innerText = settings["upi"];
      }
    })
    .catch((err) => {
      console.warn("Google Sheet sync error or fallback to auto:", err);
      setTimeBasedStatus();
    });
}

// पेज लोड होते ही और हर 60 सेकंड में सिंक चलाएं
document.addEventListener("DOMContentLoaded", () => {
  setTimeBasedStatus();
  syncWithGoogleSheet();
});

setInterval(syncWithGoogleSheet, 60000);
