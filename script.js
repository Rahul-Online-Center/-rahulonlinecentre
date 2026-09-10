/* ==========================================================================
   RAHUL ONLINE CENTRE - MASTER ENGINE (script.js)
   Theme + Side Drawer + Live Status + Admin Storage Sync
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. LIGHT / DARK THEME ENGINE (Universal Key Sync)
  const themeBtn = document.getElementById("themeBtn");
  const savedTheme = localStorage.getItem("roc_theme") || localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");

      localStorage.setItem("roc_theme", isDark ? "dark" : "light");
      localStorage.setItem("theme", isDark ? "dark" : "light");

      themeBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    });
  }

  // 2. 3-LINE SIDE DRAWER MENU ENGINE
  const menuBtn = document.getElementById("menuBtn");
  const closeDrawerBtn = document.getElementById("closeDrawer");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");

  function openDrawer() {
    if (drawer && overlay) {
      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeDrawer() {
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("active")) {
      closeDrawer();
    }
  });

  // 3. LIVE STORE STATUS ENGINE (Home + Drawer + Services Sync)
  function updateAllStoreBadges() {
    const statusBadges = document.querySelectorAll(
      "#homeStoreStatus, #drawerStoreStatus, #serviceStoreStatus, #storeStatusBadge"
    );

    if (statusBadges.length === 0) return;

    const savedStatus =
      localStorage.getItem("roc_status") ||
      localStorage.getItem("roc_site_status") ||
      "auto";

    const hour = new Date().getHours();
    const isAutoOpen = hour >= 8 && hour < 20;

    let statusText = "";
    let bgColor = "";
    let textColor = "";

    if (savedStatus === "open") {
      statusText = "● अभी खुली है (Open)";
      bgColor = "#dcfce7";
      textColor = "#15803d";
    } else if (savedStatus === "closed") {
      statusText = "● आज बंद है (Closed)";
      bgColor = "#fee2e2";
      textColor = "#dc2626";
    } else {
      if (isAutoOpen) {
        statusText = "● अभी खुली है (Open)";
        bgColor = "#dcfce7";
        textColor = "#15803d";
      } else {
        statusText = "● अभी बंद है (Closed)";
        bgColor = "#fee2e2";
        textColor = "#dc2626";
      }
    }

    statusBadges.forEach((badge) => {
      badge.innerText = statusText;
      badge.style.background = bgColor;
      badge.style.color = textColor;
    });
  }

  // 4. ADMIN PANEL SETTINGS SYNC (Ticker, Timing, UPI)
  const savedTicker =
    localStorage.getItem("roc_ticker") ||
    localStorage.getItem("roc_site_ticker");
  if (savedTicker) {
    const marqueeList = document.querySelectorAll(".top-bar marquee, #liveTickerText");
    marqueeList.forEach((mq) => (mq.innerText = savedTicker));
  }

  const savedTiming =
    localStorage.getItem("roc_timing") ||
    localStorage.getItem("roc_site_timing");
  if (savedTiming) {
    const timingElements = document.querySelectorAll(
      "#homeStoreTiming, .timing-text"
    );
    timingElements.forEach((el) => (el.innerText = savedTiming));
  }

  const savedUPI = localStorage.getItem("roc_upi");
  if (savedUPI) {
    const upiElements = document.querySelectorAll("#upiIdText, #applyUpiText");
    upiElements.forEach((el) => (el.innerText = savedUPI));
  }

  updateAllStoreBadges();
  setInterval(updateAllStoreBadges, 60000);
});
