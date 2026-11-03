// TechHunter - Giao diện hiện đại theo triết lý Kokonut Ui & Hoạt họa Anime.js
// Đặc trưng: Bento grid, thẻ xúc giác (tactile cards), số đếm nhảy mượt mà (numeric counter),
// xuất hiện phân tầng (staggered list reveal) và phím tắt thông minh.

let currentResults = [];
let currentStats = null;
let currentViewMode = "grid"; // "grid" hoặc "list"
let searchDebounceTimer = null;
let lastScrollY = 0;
let scrollUpAccumulator = 0;

// === KHỞI CHẠY KHI DOM SẴN SÀNG ===

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSearchHistory();
  initFabScrollListener();
  initGlobalKeyboardShortcuts();
  lucide.createIcons();
  
  // Đồng bộ trạng thái giao diện ban đầu của các nút khoảng giá (< 5tr)
  updatePricePresetButtons(5000000);

  // Mở tab Giá hàng ngày làm trang mặc định
  switchTab("prices");
  loadWatchdogs();
});

// === HOẠT HỌA VI MÔ VỚI ANIME.JS (KOKONUT UI ANIMATION HELPERS) ===

// 1. Hiệu ứng số đếm tăng dần (Numeric counting animation)
function animateNumericValue(element, targetValue, duration = 380, formatType = "vnd") {
  if (!element) return;
  const num = Number(targetValue) || 0;

  // Nếu không có thư viện anime hoặc giá trị bằng 0
  if (typeof anime === "undefined") {
    element.textContent = formatType === "vnd" ? formatVND(num) : (formatType === "count" ? `${num} món` : num);
    return;
  }

  const counter = { val: 0 };
  anime({
    targets: counter,
    val: num,
    round: 1,
    duration: duration,
    easing: "easeOutExpo",
    update: () => {
      if (formatType === "vnd") {
        element.textContent = formatVND(counter.val);
      } else if (formatType === "count") {
        element.textContent = `${Math.round(counter.val)} món`;
      } else {
        element.textContent = Math.round(counter.val);
      }
    }
  });
}

// 2. Hiệu ứng xuất hiện phân tầng danh sách thẻ (Staggered list reveal)
function animateStaggerElements(containerSelector, itemSelector) {
  if (typeof anime === "undefined") return;
  const items = document.querySelectorAll(`${containerSelector} ${itemSelector}`);
  if (!items || items.length === 0) return;

  anime.set(items, { opacity: 0, translateY: 10 });
  anime({
    targets: items,
    opacity: [0, 1],
    translateY: [10, 0],
    delay: anime.stagger(28),
    duration: 260,
    easing: "easeOutQuad"
  });
}

// 3. Phím tắt toàn cục thông minh (Ctrl + K hoặc / để focus tìm kiếm)
function initGlobalKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    // Ctrl + K hoặc Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      focusActiveSearchInput();
    }
    // Phím '/' khi không gõ vào ô nhập liệu
    if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      focusActiveSearchInput();
    }
  });
}

function focusActiveSearchInput() {
  const viewPrices = document.getElementById("view-prices");
  if (viewPrices && !viewPrices.classList.contains("hidden")) {
    const input = document.getElementById("daily-price-search");
    if (input) {
      input.focus();
      input.select();
    }
  } else {
    const input = document.getElementById("search-input");
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// === QUẢN LÝ SIDEBAR THÒ THỤT TRÊN MOBILE (OFF-CANVAS DRAWER) ===

function openMobileFilter() {
  const sidebar = document.getElementById("filter-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) return;

  sidebar.classList.remove("-translate-x-full");
  sidebar.classList.add("translate-x-0");
  backdrop.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeMobileFilter() {
  const sidebar = document.getElementById("filter-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) return;

  sidebar.classList.remove("translate-x-0");
  sidebar.classList.add("-translate-x-full");
  backdrop.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

// === QUẢN LÝ GIAO DIỆN (THEME SÁNG / TỐI) ===

function initTheme() {
  const savedTheme = localStorage.getItem("tdh-theme") || "light";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("tdh-theme", nextTheme);

  // Hiệu ứng xoay icon vi mô khi bấm đổi theme
  if (typeof anime !== "undefined") {
    anime({
      targets: "#theme-icon",
      rotate: [0, 360],
      duration: 350,
      easing: "easeOutQuad"
    });
  }
}

function applyTheme(theme) {
  const icon = document.getElementById("theme-icon");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    if (icon) {
      icon.setAttribute("data-lucide", "moon");
      icon.className = "w-4 h-4 text-blue-400";
    }
  } else {
    document.documentElement.classList.remove("dark");
    if (icon) {
      icon.setAttribute("data-lucide", "sun");
      icon.className = "w-4 h-4 text-amber-500";
    }
  }
  lucide.createIcons();
}

// === QUẢN LÝ NÚT X XÓA NHANH INPUT ===

function toggleClearBtn(input, btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (input.value && input.value.trim().length > 0) {
    btn.classList.remove("hidden");
  } else {
    btn.classList.add("hidden");
  }
}

function clearInput(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = "";
  if (btn) btn.classList.add("hidden");
  input.focus();

  if (inputId === "search-input") {
    performSearch("");
  }
}

function handleSearchInput(input) {
  toggleClearBtn(input, 'search-clear-btn');
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    performSearch(input.value.trim());
  }, 320);
}

// === QUẢN LÝ LỊCH SỬ TÌM KIẾM (SEARCH HISTORY) ===

const HISTORY_STORAGE_KEY = "tdh_search_history";

function getSearchHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return ["iPhone 13", "RTX 3060", "ThinkPad T14"];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSearchHistoryList(list) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 8)));
  } catch (err) {
    console.error("Lỗi lưu lịch sử:", err);
  }
}

function addSearchHistory(query) {
  const clean = (query || "").trim();
  if (!clean || clean.length < 2) return;

  let history = getSearchHistory();
  history = history.filter(item => item.toLowerCase() !== clean.toLowerCase());
  history.unshift(clean);
  saveSearchHistoryList(history);
  renderSearchHistory();
}

function removeSearchHistoryItem(itemToRemove) {
  let history = getSearchHistory();
  history = history.filter(item => item !== itemToRemove);
  saveSearchHistoryList(history);
  renderSearchHistory();
}

function clearSearchHistory() {
  saveSearchHistoryList([]);
  renderSearchHistory();
}

function initSearchHistory() {
  renderSearchHistory();
}

function renderSearchHistory() {
  const container = document.getElementById("search-history-chips");
  const clearBtn = document.getElementById("clear-history-btn");
  if (!container) return;

  const history = getSearchHistory();
  if (history.length === 0) {
    container.innerHTML = `<span class="text-[11px] text-neutral-400 italic">Chưa có lịch sử tìm kiếm</span>`;
    if (clearBtn) clearBtn.classList.add("hidden");
    return;
  }

  if (clearBtn) clearBtn.classList.remove("hidden");
  container.innerHTML = "";

  history.forEach(kw => {
    const chip = document.createElement("div");
    chip.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-xs font-medium group select-none tactile-card";
    chip.onclick = () => setQuery(kw);

    chip.innerHTML = `
      <span class="truncate max-w-[120px]">${escapeHtml(kw)}</span>
      <button 
        type="button" 
        class="text-neutral-400 hover:text-rose-500 rounded p-0.5 transition" 
        title="Xóa mục này"
        onclick="event.stopPropagation(); removeSearchHistoryItem('${escapeHtml(kw)}')"
      >
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    `;
    container.appendChild(chip);
  });

  lucide.createIcons();
}

// === QUẢN LÝ NÚT BỘ LỌC NỔI (FAB) TRÊN MOBILE ===

function initFabScrollListener() {
  const fab = document.getElementById("mobile-filter-fab");
  if (!fab) return;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY || window.pageYOffset;
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 100) {
      fab.classList.add("translate-y-24", "opacity-0", "pointer-events-none");
      fab.classList.remove("translate-y-0", "opacity-100");
      scrollUpAccumulator = 0;
      lastScrollY = currentScrollY;
      return;
    }

    if (delta > 3) {
      fab.classList.add("translate-y-24", "opacity-0", "pointer-events-none");
      fab.classList.remove("translate-y-0", "opacity-100");
      scrollUpAccumulator = 0;
    } else if (delta < -3) {
      scrollUpAccumulator += Math.abs(delta);
      if (scrollUpAccumulator > 12) {
        fab.classList.remove("translate-y-24", "opacity-0", "pointer-events-none");
        fab.classList.add("translate-y-0", "opacity-100");
      }
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

// === THANH TRƯỢT KHOẢNG GIÁ & ĐỒNG BỘ CÁC NÚT PRESET ===

const PRESET_ACTIVE_CLASS = "py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold transition text-center border border-blue-600 dark:border-blue-500 shadow-xs";
const PRESET_INACTIVE_CLASS = "py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-slate-700 dark:text-slate-300 transition text-center border border-slate-200/80 dark:border-slate-700";

function updatePricePresetButtons(priceNum) {
  const num = Number(priceNum) || 0;
  const presets = [
    { id: "preset-btn-0", val: 0 },
    { id: "preset-btn-5tr", val: 5000000 },
    { id: "preset-btn-12tr", val: 12000000 },
    { id: "preset-btn-20tr", val: 20000000 }
  ];

  let targetId = null;
  if (num === 0 || num >= 30000000) {
    targetId = "preset-btn-0";
  } else if (num === 5000000) {
    targetId = "preset-btn-5tr";
  } else if (num === 12000000) {
    targetId = "preset-btn-12tr";
  } else if (num === 20000000) {
    targetId = "preset-btn-20tr";
  }

  presets.forEach(p => {
    const btn = document.getElementById(p.id);
    if (!btn) return;
    btn.className = (p.id === targetId) ? PRESET_ACTIVE_CLASS : PRESET_INACTIVE_CLASS;
  });
}

function handleSliderChange(val, skipSearch = false) {
  const label = document.getElementById("slider-price-label");
  const hiddenInput = document.getElementById("filter-max-price");
  const num = Number(val);

  if (num >= 30000000 || num === 0) {
    if (label) label.textContent = "Tất cả giá";
    if (hiddenInput) hiddenInput.value = "";
  } else {
    if (label) label.textContent = `≤ ${formatVND(num)}`;
    if (hiddenInput) hiddenInput.value = num;
  }

  updatePricePresetButtons(num);

  if (!skipSearch) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(document.getElementById("search-input").value);
    }, 250);
  }
}

function setPricePreset(val, skipSearch = false) {
  const slider = document.getElementById("price-range-slider");
  const num = Number(val);
  if (!slider) return;

  if (num === 0 || num >= 30000000) {
    slider.value = 30000000;
    handleSliderChange(30000000, skipSearch);
  } else {
    slider.value = num;
    handleSliderChange(num, skipSearch);
  }
}

// === CHỌN DANH MỤC THIẾT BỊ (PILLS) ===

function selectCategory(cat) {
  document.getElementById("filter-category").value = cat;

  const pills = document.querySelectorAll(".cat-pill");
  pills.forEach(p => {
    const pCat = p.getAttribute("data-cat");
    if (pCat === cat) {
      p.className = "cat-pill active p-3 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold transition text-left flex items-center gap-2 shadow-xs";
    } else {
      p.className = "cat-pill p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left flex items-center gap-2 shadow-xs";
    }
  });

  performSearch(document.getElementById("search-input").value);
}

// === CHỌN NGUỒN NỀN TẢNG (PILLS) ===

function selectSource(src) {
  document.getElementById("filter-source").value = src;
  const label = document.getElementById("source-filter-label");

  const pills = document.querySelectorAll(".source-pill");
  pills.forEach(p => {
    const pSrc = p.getAttribute("data-source");
    if (pSrc === src) {
      p.className = "source-pill active py-2 px-2.5 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold transition text-left flex items-center gap-1.5 shadow-xs";
      if (label) {
        const nameSpan = p.querySelector("span:last-child");
        label.textContent = nameSpan ? nameSpan.textContent : src;
      }
    } else {
      p.className = "source-pill py-2 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left flex items-center gap-1.5";
    }
  });

  performSearch(document.getElementById("search-input").value);
}

// === ĐẶT LẠI TOÀN BỘ BỘ LỌC (RESET) ===

function resetFilters() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
    toggleClearBtn(searchInput, "search-clear-btn");
  }

  selectCategory("all");
  selectSource("all");
  setPricePreset(5000000, true);

  document.getElementById("filter-region").value = "all";
  document.getElementById("filter-hide-scam").checked = true;
  document.getElementById("filter-user-only").checked = false;
  document.getElementById("filter-sort").value = "deal";

  clearTimeout(searchDebounceTimer);
  performSearch("");
}

// === ĐIỀU HƯỚNG TAB KÈM HOẠT HỌA CHUYỂN CẢNH ===

function switchTab(tab) {
  const viewSearch = document.getElementById("view-search");
  const viewWatchdog = document.getElementById("view-watchdog");
  const viewVerify = document.getElementById("view-verify");
  const viewPrices = document.getElementById("view-prices");
  const tabSearchBtn = document.getElementById("tab-search-btn");
  const tabWatchdogBtn = document.getElementById("tab-watchdog-btn");
  const tabVerifyBtn = document.getElementById("tab-verify-btn");
  const tabPricesBtn = document.getElementById("tab-prices-btn");
  const mobileFab = document.getElementById("mobile-filter-fab");

  viewSearch.classList.add("hidden");
  viewWatchdog.classList.add("hidden");
  viewVerify.classList.add("hidden");
  if (viewPrices) viewPrices.classList.add("hidden");
  closeMobileFilter();

  const normalClass = "px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium";
  const activeClass = "px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold";

  tabSearchBtn.className = normalClass;
  tabWatchdogBtn.className = normalClass;
  tabVerifyBtn.className = normalClass;
  if (tabPricesBtn) tabPricesBtn.className = normalClass;

  let activeView = null;

  if (tab === "prices") {
    if (viewPrices) {
      viewPrices.classList.remove("hidden");
      activeView = viewPrices;
    }
    if (tabPricesBtn) tabPricesBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.add("hidden");
    loadDailyPrices();
  } else if (tab === "search") {
    viewSearch.classList.remove("hidden");
    activeView = viewSearch;
    tabSearchBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.remove("hidden");
    if (currentResults.length === 0) {
      performSearch(document.getElementById("search-input")?.value || "");
    }
  } else if (tab === "verify") {
    viewVerify.classList.remove("hidden");
    activeView = viewVerify;
    tabVerifyBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.add("hidden");
  } else if (tab === "watchdog") {
    viewWatchdog.classList.remove("hidden");
    activeView = viewWatchdog;
    tabWatchdogBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.add("hidden");
    loadWatchdogs();
  }

  // Chuyển cảnh mượt mà bằng Anime.js
  if (activeView && typeof anime !== "undefined") {
    anime.set(activeView, { opacity: 0, translateY: 6 });
    anime({
      targets: activeView,
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 220,
      easing: "easeOutQuad"
    });
  }

  lucide.createIcons();
}

function setQuery(q) {
  const input = document.getElementById("search-input");
  input.value = q;
  toggleClearBtn(input, "search-clear-btn");
  performSearch(q);
}

function handleSearch(e) {
  if (e) e.preventDefault();
  const q = document.getElementById("search-input").value.trim();
  performSearch(q);
}

// === GỌI API TÌM KIẾM TỔNG HỢP ===

async function performSearch(query) {
  if (query && query.trim().length > 0) {
    addSearchHistory(query.trim());
  }

  const loading = document.getElementById("loading-state");
  const resultsGrid = document.getElementById("results-grid");
  const emptyState = document.getElementById("empty-state");
  const statsBanner = document.getElementById("stats-banner");

  loading.classList.remove("hidden");
  resultsGrid.innerHTML = "";
  emptyState.classList.add("hidden");

  const category = document.getElementById("filter-category").value;
  const source = document.getElementById("filter-source")?.value || "all";
  const maxPrice = document.getElementById("filter-max-price").value;
  const region = document.getElementById("filter-region").value;
  const hideScam = document.getElementById("filter-hide-scam").checked;
  const userOnly = document.getElementById("filter-user-only").checked;
  const sortBy = document.getElementById("filter-sort").value;

  const params = new URLSearchParams({
    q: query || "",
    category,
    region,
    hideScam: hideScam ? "true" : "false",
    userOnly: userOnly ? "true" : "false",
    sortBy
  });

  if (source && source !== "all") {
    params.append("sources", source);
  }

  if (maxPrice) params.append("maxPrice", maxPrice);

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();

    loading.classList.add("hidden");

    currentResults = data.items || [];
    currentStats = data.stats;

    if (currentResults.length === 0) {
      emptyState.classList.remove("hidden");
      statsBanner.classList.add("hidden");
      document.getElementById("results-count").textContent = "0";
      return;
    }

    renderStats(query, data.stats);
    loadFacebookGroups(query, category);

    document.getElementById("results-count").textContent = currentResults.length;
    document.getElementById("results-time").textContent = data.durationMs || 100;

    renderResults(currentResults);

  } catch (err) {
    loading.classList.add("hidden");
    console.error("Lỗi tìm kiếm:", err);
  }
}

// Tải danh sách nhóm Facebook
async function loadFacebookGroups(query = "", category = "all") {
  const container = document.getElementById("fb-groups-list");
  if (!container) return;

  try {
    const res = await fetch(`/api/facebook-groups?q=${encodeURIComponent(query || "")}&category=${category}`);
    const groups = await res.json();

    if (!groups || groups.length === 0) {
      document.getElementById("fb-groups-banner").classList.add("hidden");
      return;
    }

    document.getElementById("fb-groups-banner").classList.remove("hidden");
    container.innerHTML = "";

    groups.forEach(g => {
      const a = document.createElement("a");
      a.href = g.searchUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-neutral-800 dark:text-neutral-200 font-semibold transition shadow-2xs group text-xs tactile-card";
      
      const countClean = (g.members || '').replace(/[\.\,\+]/g, '').trim();
      const num = parseInt(countClean, 10);
      const memberLabel = num && !isNaN(num) ? `${Math.round(num / 1000)}k tv` : g.members;

      a.innerHTML = `
        <span class="text-blue-600 dark:text-blue-400 font-bold">#</span>
        <span class="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">${escapeHtml(g.name)}</span>
        <span class="text-[10px] text-neutral-400 font-normal">(${escapeHtml(memberLabel)})</span>
        <i data-lucide="external-link" class="w-3 h-3 text-neutral-400 group-hover:text-blue-600 transition"></i>
      `;

      container.appendChild(a);
    });

    lucide.createIcons();
  } catch (err) {
    console.error("Lỗi tải nhóm FB:", err);
  }
}

// === CHẾ ĐỘ XEM (GRID / LIST VIEW) ===

function setViewMode(mode) {
  currentViewMode = mode;
  const gridBtn = document.getElementById("view-mode-grid");
  const listBtn = document.getElementById("view-mode-list");

  const activeBtnClass = "p-1.5 rounded-md text-blue-600 bg-white dark:bg-neutral-900 shadow-xs";
  const inactiveBtnClass = "p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200";

  if (mode === "grid") {
    gridBtn.className = activeBtnClass;
    listBtn.className = inactiveBtnClass;
  } else {
    listBtn.className = activeBtnClass;
    gridBtn.className = inactiveBtnClass;
  }

  renderResults(currentResults);
}

function applySorting() {
  const sortBy = document.getElementById("filter-sort").value;
  if (!currentResults || currentResults.length === 0) return;

  currentResults.sort((a, b) => {
    if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "newest") return (b.postedTime || 0) - (a.postedTime || 0);

    const getDealPriority = (item) => {
      if (item.dealRating?.level === "super_deal") return 4;
      if (item.dealRating?.level === "good_deal") return 3;
      if (item.dealRating?.level === "fair") return 2;
      return 1;
    };
    return getDealPriority(b) - getDealPriority(a);
  });

  renderResults(currentResults);
}

// Render banner thống kê khoảng giá với hiệu ứng Anime.js Numeric Counting
function renderStats(query, stats) {
  const banner = document.getElementById("stats-banner");
  if (!stats || stats.total === 0) {
    banner.classList.add("hidden");
    return;
  }

  banner.classList.remove("hidden");
  document.getElementById("stat-query-name").textContent = query ? `cho "${query}"` : "";

  // Hiệu ứng số nhảy mượt mà
  animateNumericValue(document.getElementById("stat-min-price"), stats.minPrice, 320, "vnd");
  animateNumericValue(document.getElementById("stat-median-price"), stats.medianPrice, 360, "vnd");
  animateNumericValue(document.getElementById("stat-max-price"), stats.maxPrice, 400, "vnd");
  animateNumericValue(document.getElementById("stat-deal-count"), stats.superDealCount, 300, "count");
}

// === RENDER THẺ SẢN PHẨM (HỖ TRỢ CẢ GRID VÀ LIST) ===

function renderResults(items) {
  const container = document.getElementById("results-grid");
  container.innerHTML = "";

  if (currentViewMode === "list") {
    container.className = "space-y-3";
  } else {
    container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  }

  items.forEach(item => {
    let sourceBadgeClass = "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-700/80";
    if (item.sourceBadge === "nhattao") sourceBadgeClass = "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700/80";
    if (item.sourceBadge === "cellphones") sourceBadgeClass = "bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border-rose-300 dark:border-rose-700/80";
    if (item.sourceBadge === "tgdd") sourceBadgeClass = "bg-yellow-50 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700/80";
    if (item.sourceBadge === "hoangha") sourceBadgeClass = "bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 border-purple-300 dark:border-purple-700/80";
    if (item.sourceBadge === "fpt") sourceBadgeClass = "bg-orange-50 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200 border-orange-300 dark:border-orange-700/80";
    if (item.sourceBadge === "laptop88") sourceBadgeClass = "bg-teal-50 text-teal-900 dark:bg-teal-950/60 dark:text-teal-200 border-teal-300 dark:border-teal-700/80";
    if (item.sourceBadge === "pcpart") sourceBadgeClass = "bg-cyan-50 text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700/80";

    let ratingBadge = '';
    if (item.dealRating && item.dealRating.level === "super_deal") {
      ratingBadge = `<span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shrink-0">🔥 Kèo rất hời</span>`;
    } else if (item.dealRating && item.dealRating.level === "good_deal") {
      ratingBadge = `<span class="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shrink-0">✨ Giá tốt</span>`;
    }

    let hardwareBadge = '';
    if (item.hardwareVerifications && item.hardwareVerifications.length > 0) {
      const hv = item.hardwareVerifications[0];
      if (hv.isValid) {
        hardwareBadge = `
          <div onclick="inspectHardwareCode('${hv.raw}')" class="cursor-pointer text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition min-w-0">
            <span class="flex items-center gap-1 min-w-0 truncate font-mono">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"></i>
              <span class="truncate">${hv.type}: ${hv.formatted || hv.raw}</span>
            </span>
            <span class="underline text-[10px] shrink-0 text-emerald-600 dark:text-emerald-400 font-sans">Chi tiết ↗</span>
          </div>
        `;
      } else {
        hardwareBadge = `
          <div onclick="inspectHardwareCode('${hv.raw}')" class="cursor-pointer text-[11px] px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition min-w-0 font-medium">
            <span class="flex items-center gap-1 min-w-0 truncate">
              <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"></i>
              <span class="truncate">${hv.label}</span>
            </span>
            <span class="underline text-[10px] shrink-0 text-rose-600 dark:text-rose-400 font-sans">Xem ↗</span>
          </div>
        `;
      }
    }

    const card = document.createElement("div");

    if (currentViewMode === "list") {
      card.className = "deal-card bento-box tactile-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0";
      card.innerHTML = `
        <div class="flex items-center space-x-3.5 min-w-0 flex-1">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="shrink-0 block">
            <img 
              src="${item.image}" 
              alt="${escapeHtml(item.title)}" 
              referrerpolicy="no-referrer"
              class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:opacity-90 transition"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'"
            >
          </a>
          <div class="space-y-1.5 min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${sourceBadgeClass}">${item.source}</span>
              ${ratingBadge}
              <span class="text-[11px] text-neutral-400 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${escapeHtml(item.location || 'Toàn quốc')}</span>
              <span class="text-[11px] text-neutral-400">• ${timeAgo(item.postedTime)}</span>
            </div>
            <h4 class="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 line-clamp-2 break-anywhere leading-snug">
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition inline-flex items-center gap-1.5 group" title="${escapeHtml(item.title)}">
                <span>${escapeHtml(item.title)}</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-blue-500 shrink-0 inline"></i>
              </a>
            </h4>
            ${hardwareBadge}
          </div>
        </div>

        <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
          <div class="text-left sm:text-right">
            <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">${formatVND(item.price)}</div>
            <span class="text-[11px] text-neutral-400">${item.isShop ? '🏪 Cửa hàng' : '👤 Người dùng'}</span>
          </div>
        </div>
      `;
    } else {
      card.className = "deal-card bento-box tactile-card overflow-hidden flex flex-col justify-between min-w-0";
      card.innerHTML = `
        <div class="min-w-0 flex flex-col h-full">
          <div class="relative h-44 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden group shrink-0">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="block w-full h-full">
              <img 
                src="${item.image}" 
                alt="${escapeHtml(item.title)}" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover group-hover:scale-104 transition-transform duration-200"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'"
              >
            </a>
            
            <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-neutral-700 dark:text-neutral-200 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-2.5 py-1 rounded-lg gap-2 shadow-xs border border-neutral-200/60 dark:border-neutral-800/60 pointer-events-none">
              <span class="truncate min-w-0 flex items-center gap-1 font-medium">
                <i data-lucide="map-pin" class="w-3 h-3 text-neutral-400 shrink-0"></i>
                <span class="truncate">${escapeHtml(item.location || 'Toàn quốc')}</span>
              </span>
              <span class="shrink-0 flex items-center gap-1 text-neutral-500 dark:text-neutral-400 font-medium">
                <i data-lucide="clock" class="w-3 h-3 shrink-0"></i>
                <span>${timeAgo(item.postedTime)}</span>
              </span>
            </div>
          </div>

          <div class="p-4 space-y-3 min-w-0 flex-1 flex flex-col justify-between">
            <div class="space-y-2.5 min-w-0">
              
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold border ${sourceBadgeClass}">
                  ${item.source}
                </span>
                ${ratingBadge}
              </div>

              <h4 class="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 line-clamp-2 break-anywhere leading-snug">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition inline group" title="${escapeHtml(item.title)}">
                  <span>${escapeHtml(item.title)}</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-blue-500 inline ml-1 align-baseline shrink-0"></i>
                </a>
              </h4>

              <div class="flex items-baseline justify-between gap-1 min-w-0 pt-0.5">
                <div class="min-w-0">
                  <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight truncate">
                    ${formatVND(item.price)}
                  </div>
                  <div class="text-xs text-neutral-400 truncate">
                    ${item.dealRating?.desc || "Mức giá hợp lý"}
                  </div>
                </div>
                
                <div class="shrink-0">
                  <span class="text-[11px] px-2 py-0.5 rounded-md font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                    ${item.isShop ? '🏪 Cửa hàng' : '👤 Người dùng'}
                  </span>
                </div>
              </div>

              <div class="bg-neutral-50 dark:bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 min-h-[46px] flex items-center overflow-hidden">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed break-anywhere m-0">
                ${escapeHtml(item.description || item.condition || "Đã qua sử dụng")}
                </p>
              </div>

              ${hardwareBadge}

            </div>
          </div>
        </div>
      `;
    }

    container.appendChild(card);
  });

  lucide.createIcons();

  // Hiệu ứng xuất hiện phân tầng Anime.js
  animateStaggerElements("#results-grid", ".deal-card");
}

// === THẨM ĐỊNH MÃ PHẦN CỨNG (IMEI / SERIAL) ===

function inspectHardwareCode(code) {
  switchTab("verify");
  setVerifyCode(code);
}

function setVerifyCode(code) {
  const input = document.getElementById("verify-input");
  input.value = code;
  toggleClearBtn(input, "verify-clear-btn");
  handleVerifyCode();
}

async function handleVerifyCode() {
  const input = document.getElementById("verify-input");
  const code = input.value.trim();
  const resultContainer = document.getElementById("verify-result");

  if (!code) {
    alert("Vui lòng nhập số IMEI hoặc Serial để kiểm tra.");
    return;
  }

  resultContainer.innerHTML = `
    <div class="py-8 text-center text-neutral-500 flex items-center justify-center space-x-2">
      <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
      <span class="text-xs font-medium">Đang kiểm tra thuật toán Luhn & dải TAC quốc tế...</span>
    </div>
  `;
  resultContainer.classList.remove("hidden");

  try {
    const res = await fetch("/api/verify-hardware", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const report = await res.json();
    renderVerifyReport(report);
  } catch (err) {
    resultContainer.innerHTML = `<div class="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 text-xs font-medium">Lỗi kết nối máy chủ kiểm tra.</div>`;
  }
}

function renderVerifyReport(report) {
  const container = document.getElementById("verify-result");
  const isValid = report.isValid;
  const isDanger = report.riskLevel === "danger" || !isValid;

  const statusBadge = isDanger
    ? `<div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3 min-w-0">
         <i data-lucide="alert-octagon" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"></i>
         <div class="min-w-0 break-anywhere">
           <h4 class="text-sm font-bold text-rose-800 dark:text-rose-300">${report.label}</h4>
           <p class="text-xs text-rose-700 dark:text-rose-200/90 mt-0.5">${report.message}</p>
         </div>
       </div>`
    : `<div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3 min-w-0">
         <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"></i>
         <div class="min-w-0 break-anywhere">
           <h4 class="text-sm font-bold text-emerald-800 dark:text-emerald-300">${report.label}</h4>
           <p class="text-xs text-emerald-700 dark:text-emerald-200/90 mt-0.5">${report.message}</p>
         </div>
       </div>`;

  let linksHtml = '';
  if (report.lookupLinks) {
    linksHtml = `
      <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
        <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">Các trang tra cứu chính thức (mở 1-click):</span>
        <div class="flex flex-wrap gap-2 text-xs">
          ${report.lookupLinks.appleCoverage ? `
            <a href="${report.lookupLinks.appleCoverage}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700 tactile-card">
              <span>Apple Check Coverage</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-neutral-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.sickw ? `
            <a href="${report.lookupLinks.sickw}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700 tactile-card">
              <span>Kiểm tra iCloud ẩn (Sickw)</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-neutral-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.imeiInfo ? `
            <a href="${report.lookupLinks.imeiInfo}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700 tactile-card">
              <span>Tra cứu GSMA (IMEI.info)</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-neutral-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.dellSupport ? `
            <a href="${report.lookupLinks.dellSupport}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700 tactile-card">
              <span>Dell Support</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-neutral-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.lenovoSupport ? `
            <a href="${report.lookupLinks.lenovoSupport}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5 transition border border-neutral-200 dark:border-neutral-700 tactile-card">
              <span>Lenovo Warranty</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-neutral-400"></i>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-4">
      ${statusBadge}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div class="min-w-0">
          <span class="text-neutral-500 dark:text-neutral-400 block mb-0.5">Mã đã nhập:</span>
          <span class="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm break-anywhere">${escapeHtml(report.raw)}</span>
        </div>
        ${report.formatted ? `
          <div class="min-w-0">
            <span class="text-neutral-500 dark:text-neutral-400 block mb-0.5">Định dạng tiêu chuẩn:</span>
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm break-anywhere">${escapeHtml(report.formatted)}</span>
          </div>
        ` : ''}
        ${report.tac ? `
          <div class="min-w-0">
            <span class="text-neutral-500 dark:text-neutral-400 block mb-0.5">Mã dải TAC (8 số đầu):</span>
            <span class="font-mono font-medium text-neutral-700 dark:text-neutral-300">${escapeHtml(report.tac)}</span>
          </div>
        ` : ''}
        ${report.brandHint ? `
          <div class="min-w-0">
            <span class="text-neutral-500 dark:text-neutral-400 block mb-0.5">Nhận diện thương hiệu & xuất xứ:</span>
            <span class="text-emerald-700 dark:text-emerald-400 font-bold truncate block">${escapeHtml(report.brandHint)}</span>
          </div>
        ` : ''}
      </div>

      ${linksHtml}
    </div>
  `;

  lucide.createIcons();
}

// === QUẢN LÝ THEO DÕI GIÁ (WATCHDOG) ===

const WATCHDOGS_STORAGE_KEY = "tdh_local_watchdogs";

function getLocalWatchdogs() {
  try {
    const raw = localStorage.getItem(WATCHDOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalWatchdogs(list) {
  try {
    localStorage.setItem(WATCHDOGS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

async function loadWatchdogs() {
  const localList = getLocalWatchdogs();
  if (localList.length > 0) {
    renderWatchdogs(localList);
  }

  try {
    const res = await fetch("/api/watchdogs");
    if (res.ok) {
      const serverList = await res.json();
      if (Array.isArray(serverList) && serverList.length > 0) {
        saveLocalWatchdogs(serverList);
        renderWatchdogs(serverList);
      } else if (localList.length > 0) {
        // Đồng bộ danh sách từ máy lên server nếu server chưa có
        for (const wd of localList) {
          fetch("/api/watchdogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wd)
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn("Dùng danh sách theo dõi từ bộ nhớ cục bộ:", err.message);
  }
}

function renderWatchdogs(list) {
  const container = document.getElementById("watchdogs-list");
  const countEl = document.getElementById("watchdogs-count");
  const badge = document.getElementById("active-watchdog-badge");

  const activeCount = list.filter(w => w.enabled).length;
  countEl.textContent = `${activeCount}/${list.length} mục`;

  if (activeCount > 0) {
    badge.textContent = activeCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-500 text-xs">
        Chưa có mục theo dõi nào. Điền thông tin ở khung bên trái để kích hoạt quét tự động.
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  list.forEach(w => {
    const item = document.createElement("div");
    item.className = `p-4 rounded-xl border ${w.enabled ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800/60 opacity-60'} flex items-center justify-between gap-3 transition min-w-0 shadow-xs tactile-card`;

    item.innerHTML = `
      <div class="space-y-1 min-w-0 flex-1">
        <div class="flex items-center space-x-2 min-w-0 flex-wrap">
          <span class="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">${escapeHtml(w.keyword)}</span>
          <span class="text-xs px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-bold shrink-0">
            &le; ${formatVND(w.maxPrice)}
          </span>
          ${w.telegramBotToken ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">Telegram</span>' : ''}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center space-x-2 truncate">
          <span>Phát hiện: <b class="text-rose-600 dark:text-rose-400 font-bold">${w.alertCount || 0}</b> deal</span>
          <span>•</span>
          <span class="truncate">${w.lastChecked ? timeAgo(w.lastChecked) : 'Chờ quét'}</span>
        </div>
      </div>

      <div class="flex items-center space-x-2 shrink-0">
        <button 
          onclick="toggleWatchdog('${w.id}')" 
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border ${w.enabled ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200'}"
        >
          ${w.enabled ? 'Đang bật' : 'Tạm dừng'}
        </button>
        <button 
          onclick="deleteWatchdog('${w.id}')" 
          class="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
          title="Xóa"
        >
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    container.appendChild(item);
  });

  lucide.createIcons();
}

async function handleCreateWatchdog(e) {
  e.preventDefault();
  const keyword = document.getElementById("wd-keyword").value.trim();
  const maxPrice = document.getElementById("wd-max-price").value;
  const category = document.getElementById("wd-category").value;
  const telegramBotToken = document.getElementById("wd-bot-token").value.trim();
  const telegramChatId = document.getElementById("wd-chat-id").value.trim();

  const newWd = {
    id: `wd-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    keyword,
    maxPrice: Number(maxPrice) || 0,
    category,
    telegramBotToken,
    telegramChatId,
    enabled: true,
    createdAt: Date.now(),
    lastChecked: null,
    alertCount: 0,
    seenIds: []
  };

  const list = getLocalWatchdogs();
  list.push(newWd);
  saveLocalWatchdogs(list);
  renderWatchdogs(list);

  document.getElementById("wd-keyword").value = "";
  document.getElementById("wd-max-price").value = "";
  alert("Đã thêm theo dõi: " + keyword);

  try {
    await fetch("/api/watchdogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWd)
    });
  } catch (err) {
    // Lưu cục bộ thành công
  }
}

async function toggleWatchdog(id) {
  const list = getLocalWatchdogs();
  const item = list.find(w => w.id === id);
  if (item) {
    item.enabled = !item.enabled;
    saveLocalWatchdogs(list);
    renderWatchdogs(list);
  }

  try {
    await fetch(`/api/watchdogs/${id}/toggle`, { method: "PATCH" });
  } catch (err) {}
}

async function deleteWatchdog(id) {
  if (!confirm("Xác nhận xóa mục theo dõi này?")) return;
  let list = getLocalWatchdogs();
  list = list.filter(w => w.id !== id);
  saveLocalWatchdogs(list);
  renderWatchdogs(list);

  try {
    await fetch(`/api/watchdogs/${id}`, { method: "DELETE" });
  } catch (err) {}
}

async function triggerManualScan() {
  const btn = document.getElementById("manual-scan-btn");
  const originalHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>Đang quét...</span>`;
    lucide.createIcons();
  }

  const list = getLocalWatchdogs();
  try {
    const res = await fetch("/api/watchdogs/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchdogs: list })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Đã quét xong ${data.scannedCount} mục! Đã gửi ${data.alertsSent} thông báo mới đến Telegram.`);
      loadWatchdogs();
    } else {
      alert("Lỗi khi quét: " + (data.error || "Không thể hoàn thành"));
    }
  } catch (err) {
    alert("Lỗi kết nối máy chủ quét: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      lucide.createIcons();
    }
  }
}

async function testTelegram() {
  const botToken = document.getElementById("wd-bot-token").value.trim();
  const chatId = document.getElementById("wd-chat-id").value.trim();

  if (!botToken || !chatId) {
    alert("Vui lòng điền Bot Token và Chat ID trước khi bấm thử.");
    return;
  }

  try {
    const res = await fetch("/api/telegram/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botToken, chatId })
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data?.success) {
      alert("Gửi thành công! Kiểm tra tin nhắn trong Telegram của bạn.");
    } else {
      const errMsg = data?.error || (res.status === 404 ? "Cổng kết nối Telegram chưa sẵn sàng trên đám mây. Vui lòng đợi bản triển khai hoàn tất." : `Lỗi máy chủ (mã: ${res.status})`);
      alert("Thất bại: " + errMsg);
    }
  } catch (err) {
    alert("Lỗi kết nối: " + err.message);
  }
}

// === CÁC TIỆN ÍCH HELPER ===

function formatVND(amount) {
  if (!amount || isNaN(amount)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function timeAgo(timestamp) {
  if (!timestamp) return "Mới đây";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes}p trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================================================================
// === BẢNG GIÁ LINH KIỆN ĐIỆN TỬ HÀNG NGÀY (DAILY HARDWARE PRICES) ===
// =========================================================================

// Danh mục dữ liệu giá chuẩn xác hiển thị ngay lập tức (không lo gián đoạn mạng)
const FALLBACK_DAILY_PRICES = [
  // Card đồ họa (gpu)
  {
    id: "gpu-rtx3060-12g",
    name: "NVIDIA GeForce RTX 3060 12GB (Cũ 98-99%)",
    category: "gpu",
    categoryName: "Card đồ họa (gpu)",
    minPrice: 4800000,
    avgPrice: 5350000,
    changeAmount: -150000,
    changePercent: -2.7,
    trend: "down",
    recommendationLabel: "🔥 Giá chạm đáy - kèo hời",
    spec: "12GB GDDR6, 192-bit, TDP 170W, Fullbox / Hết BH hãng",
    searchKeyword: "RTX 3060 12GB",
    suggestedMaxPrice: 5400000
  },
  {
    id: "gpu-rtx3070-8g",
    name: "NVIDIA GeForce RTX 3070 8GB (Cũ)",
    category: "gpu",
    categoryName: "Card đồ họa (gpu)",
    minPrice: 6200000,
    avgPrice: 6850000,
    changeAmount: 0,
    changePercent: 0,
    trend: "stable",
    recommendationLabel: "✨ Giá ổn định",
    spec: "8GB GDDR6, 256-bit, chơi mượt 2K Ultra Settings",
    searchKeyword: "RTX 3070",
    suggestedMaxPrice: 6900000
  },
  {
    id: "gpu-rtx4060-8g",
    name: "NVIDIA GeForce RTX 4060 8GB (Lướt BH dài)",
    category: "gpu",
    categoryName: "Card đồ họa (gpu)",
    minPrice: 6800000,
    avgPrice: 7300000,
    changeAmount: -200000,
    changePercent: -2.6,
    trend: "down",
    recommendationLabel: "🔥 Giảm nhẹ - đáng mua",
    spec: "Kiến trúc Ada Lovelace, DLSS 3 Frame Gen, ăn cực ít điện (115W)",
    searchKeyword: "RTX 4060",
    suggestedMaxPrice: 7400000
  },
  {
    id: "gpu-gtx1660s-6g",
    name: "NVIDIA GeForce GTX 1660 Super 6GB (Cũ)",
    category: "gpu",
    categoryName: "Card đồ họa (gpu)",
    minPrice: 2200000,
    avgPrice: 2550000,
    changeAmount: -50000,
    changePercent: -1.9,
    trend: "down",
    recommendationLabel: "🔥 Vua phân khúc giá rẻ",
    spec: "6GB GDDR6, chiến mượt Esport FO4, CS2, Valorant, GTA V",
    searchKeyword: "GTX 1660 Super",
    suggestedMaxPrice: 2600000
  },
  {
    id: "gpu-rx6600-8g",
    name: "AMD Radeon RX 6600 8GB (Cũ / Còn BH)",
    category: "gpu",
    categoryName: "Card đồ họa (gpu)",
    minPrice: 3200000,
    avgPrice: 3650000,
    changeAmount: 50000,
    changePercent: 1.4,
    trend: "up",
    recommendationLabel: "✨ Giá tốt P/P",
    spec: "8GB GDDR6, hiệu năng nhỉnh hơn RTX 2060, tiêu thụ 132W",
    searchKeyword: "RX 6600",
    suggestedMaxPrice: 3700000
  },

  // Vi xử lý (cpu)
  {
    id: "cpu-i5-12400f",
    name: "Intel Core i5-12400F (Tray / Box cũ)",
    category: "cpu",
    categoryName: "Vi xử lý (cpu)",
    minPrice: 2150000,
    avgPrice: 2450000,
    changeAmount: -50000,
    changePercent: -2.0,
    trend: "down",
    recommendationLabel: "🔥 CPU quốc dân giá tốt",
    spec: "6 nhân 12 luồng, xung boost 4.4GHz, Socket LGA1700",
    searchKeyword: "i5 12400F",
    suggestedMaxPrice: 2500000
  },
  {
    id: "cpu-i5-13400f",
    name: "Intel Core i5-13400F (Lướt / BH)",
    category: "cpu",
    categoryName: "Vi xử lý (cpu)",
    minPrice: 3500000,
    avgPrice: 3950000,
    changeAmount: -150000,
    changePercent: -3.6,
    trend: "down",
    recommendationLabel: "🔥 Giảm mạnh",
    spec: "10 nhân 16 luồng (6P + 4E), đa nhiệm và render khỏe",
    searchKeyword: "i5 13400F",
    suggestedMaxPrice: 4000000
  },
  {
    id: "cpu-i3-12100f",
    name: "Intel Core i3-12100F (Cũ / Tray)",
    category: "cpu",
    categoryName: "Vi xử lý (cpu)",
    minPrice: 1400000,
    avgPrice: 1650000,
    changeAmount: 0,
    changePercent: 0,
    trend: "stable",
    recommendationLabel: "✨ Giá rẻ mượt mà",
    spec: "4 nhân 8 luồng, đơn nhân rất khỏe cho game online",
    searchKeyword: "i3 12100F",
    suggestedMaxPrice: 1700000
  },
  {
    id: "cpu-ryzen-5-5600",
    name: "AMD Ryzen 5 5600 (AM4, Cũ / Tray)",
    category: "cpu",
    categoryName: "Vi xử lý (cpu)",
    minPrice: 2000000,
    avgPrice: 2300000,
    changeAmount: -50000,
    changePercent: -2.1,
    trend: "down",
    recommendationLabel: "🔥 Best P/P cho dàn AM4",
    spec: "6 nhân 12 luồng, 32MB L3 Cache, xung boost 4.4GHz",
    searchKeyword: "Ryzen 5 5600",
    suggestedMaxPrice: 2350000
  },
  {
    id: "cpu-ryzen-7-5700x3d",
    name: "AMD Ryzen 7 5700X3D (Vua gaming AM4)",
    category: "cpu",
    categoryName: "Vi xử lý (cpu)",
    minPrice: 4600000,
    avgPrice: 5100000,
    changeAmount: -100000,
    changePercent: -1.9,
    trend: "down",
    recommendationLabel: "🔥 Đang hot - cực khỏe",
    spec: "8 nhân 16 luồng, 96MB 3D V-Cache, FPS game esport cực cao",
    searchKeyword: "5700X3D",
    suggestedMaxPrice: 5200000
  },

  // RAM & ssd
  {
    id: "ram-ddr4-16g-3200",
    name: "RAM Desktop DDR4 16GB Bus 3200 (Kingston / Corsair)",
    category: "ram_ssd",
    categoryName: "RAM & ssd",
    minPrice: 600000,
    avgPrice: 750000,
    changeAmount: 0,
    changePercent: 0,
    trend: "stable",
    recommendationLabel: "✨ Giá bình ổn",
    spec: "Kingston Fury, Corsair LPX, G.Skill Ripjaws Bus 3200MHz",
    searchKeyword: "RAM 16GB 3200",
    suggestedMaxPrice: 800000
  },
  {
    id: "ram-ddr5-32g-6000",
    name: "Kit RAM DDR5 32GB (2x16GB) Bus 5600 - 6000MHz",
    category: "ram_ssd",
    categoryName: "RAM & ssd",
    minPrice: 1950000,
    avgPrice: 2350000,
    changeAmount: -100000,
    changePercent: -4.0,
    trend: "down",
    recommendationLabel: "🔥 Giảm sâu - nên nâng cấp",
    spec: "Corsair Vengeance, Kingston Renegade, Intel XMP 3.0 / AMD EXPO",
    searchKeyword: "RAM DDR5 32GB",
    suggestedMaxPrice: 2400000
  },
  {
    id: "ssd-nvme-1tb-gen4",
    name: "SSD NVMe M.2 1TB PCIe Gen 4x4 (5000-7000MB/s)",
    category: "ram_ssd",
    categoryName: "RAM & ssd",
    minPrice: 1350000,
    avgPrice: 1650000,
    changeAmount: 50000,
    changePercent: 3.1,
    trend: "up",
    recommendationLabel: "✨ Ổn định",
    spec: "Samsung 980 Pro, Kingston KC3000, Kioxia Exceria Pro 1TB",
    searchKeyword: "SSD NVMe 1TB",
    suggestedMaxPrice: 1700000
  },
  {
    id: "ssd-nvme-500g",
    name: "SSD NVMe M.2 500GB PCIe Gen 3/Gen 4 cũ",
    category: "ram_ssd",
    categoryName: "RAM & ssd",
    minPrice: 650000,
    avgPrice: 820000,
    changeAmount: -30000,
    changePercent: -3.5,
    trend: "down",
    recommendationLabel: "🔥 Giá rất tốt",
    spec: "Sức khỏe Good 98-100%, ghi ít TBW, BH còn dài",
    searchKeyword: "SSD 500GB",
    suggestedMaxPrice: 850000
  },

  // Điện thoại cũ
  {
    id: "phone-ip13-128",
    name: "Apple iPhone 13 128GB (Quốc tế cũ 98-99%)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 8800000,
    avgPrice: 9900000,
    changeAmount: -300000,
    changePercent: -2.9,
    trend: "down",
    recommendationLabel: "🔥 Rớt giá tốt - nên xúc",
    spec: "Màn 6.1 OLED Super Retina, chip A15 Bionic, pin 85-92%",
    searchKeyword: "iPhone 13 128GB",
    suggestedMaxPrice: 10000000
  },
  {
    id: "phone-ip14prm-128",
    name: "Apple iPhone 14 Pro Max 128GB (Cũ 99%)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 17500000,
    avgPrice: 18900000,
    changeAmount: -400000,
    changePercent: -2.1,
    trend: "down",
    recommendationLabel: "🔥 Kèo thơm cao cấp",
    spec: "Dynamic Island, màn 120Hz ProMotion, camera 48MP, pin trâu",
    searchKeyword: "iPhone 14 Pro Max",
    suggestedMaxPrice: 19000000
  },
  {
    id: "phone-ip12-64",
    name: "Apple iPhone 12 64GB (Cũ quốc tế)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 5600000,
    avgPrice: 6300000,
    changeAmount: -100000,
    changePercent: -1.6,
    trend: "down",
    recommendationLabel: "✨ Giá rẻ dễ tiếp cận",
    spec: "Hỗ trợ 5G, chip A14 Bionic, thiết kế viền vuông sang trọng",
    searchKeyword: "iPhone 12",
    suggestedMaxPrice: 6400000
  },
  {
    id: "phone-ss-s23-5g",
    name: "Samsung Galaxy S23 5G 128GB (Cũ chính hãng)",
    category: "phone",
    categoryName: "Điện thoại cũ",
    minPrice: 8300000,
    avgPrice: 9100000,
    changeAmount: -200000,
    changePercent: -2.2,
    trend: "down",
    recommendationLabel: "🔥 Flagship nhỏ gọn đáng mua",
    spec: "Snapdragon 8 Gen 2 for Galaxy mát mẻ, camera chụp đêm sắc nét",
    searchKeyword: "Samsung Galaxy S23",
    suggestedMaxPrice: 9200000
  },

  // Laptop cũ
  {
    id: "laptop-macbook-air-m1",
    name: "Apple MacBook Air M1 2020 (8GB / 256GB cũ đẹp)",
    category: "laptop",
    categoryName: "Laptop cũ",
    minPrice: 11500000,
    avgPrice: 12800000,
    changeAmount: -400000,
    changePercent: -3.0,
    trend: "down",
    recommendationLabel: "🔥 Vua văn phòng & sinh viên",
    spec: "Pin trâu 12-15 tiếng, màn Retina cực đẹp, loa hay, nhẹ 1.29kg",
    searchKeyword: "MacBook Air M1",
    suggestedMaxPrice: 13000000
  },
  {
    id: "laptop-thinkpad-t14-g2",
    name: "Lenovo ThinkPad T14 Gen 2 (Ryzen 5 Pro / Core i5 cũ)",
    category: "laptop",
    categoryName: "Laptop cũ",
    minPrice: 7500000,
    avgPrice: 8600000,
    changeAmount: -100000,
    changePercent: -1.1,
    trend: "down",
    recommendationLabel: "✨ Bàn phím số 1 cho coder",
    spec: "RAM 16GB, SSD 512GB, độ bền tiêu chuẩn quân đội, bàn phím gõ sướng",
    searchKeyword: "ThinkPad T14",
    suggestedMaxPrice: 8800000
  },
  {
    id: "laptop-gaming-legion5-3060",
    name: "Lenovo Legion 5 (Ryzen 7 5800H / RTX 3060 cũ)",
    category: "laptop",
    categoryName: "Laptop cũ",
    minPrice: 14500000,
    avgPrice: 16200000,
    changeAmount: -300000,
    changePercent: -1.8,
    trend: "down",
    recommendationLabel: "✨ Tản nhiệt ngon nhất phân khúc",
    spec: "Màn 15.6 inch 165Hz 100% sRGB, RTX 3060 130W bung hết công suất",
    searchKeyword: "Legion 5 RTX 3060",
    suggestedMaxPrice: 16500000
  },

  // Màn hình
  {
    id: "mon-24-144hz",
    name: "Màn hình 24 inch IPS 144Hz - 165Hz FHD (Cũ còn BH)",
    category: "monitor",
    categoryName: "Màn hình",
    minPrice: 1700000,
    avgPrice: 2150000,
    changeAmount: -50000,
    changePercent: -2.3,
    trend: "down",
    recommendationLabel: "🔥 Rất rẻ cho góc chơi game",
    spec: "AOC, ViewSonic, MSI, LG 24GN650 tấm nền IPS viền mỏng",
    searchKeyword: "Màn hình 144Hz",
    suggestedMaxPrice: 2200000
  },
  {
    id: "mon-27-2k-165hz",
    name: "Màn hình 27 inch 2K QHD 165Hz - 180Hz IPS (Cũ / lướt)",
    category: "monitor",
    categoryName: "Màn hình",
    minPrice: 3200000,
    avgPrice: 3850000,
    changeAmount: -50000,
    changePercent: -1.3,
    trend: "down",
    recommendationLabel: "✨ Nâng cấp trải nghiệm sắc nét",
    spec: "Độ phân giải 2560x1440, màu sắc chuẩn, chân đế nâng hạ xoay dọc",
    searchKeyword: "Màn hình 27 2K",
    suggestedMaxPrice: 3900000
  }
];

function getFallbackDailyPrices(category = "all", query = "") {
  const q = (query || "").toLowerCase().trim();
  const cat = (category || "all").toLowerCase().trim();

  const filtered = FALLBACK_DAILY_PRICES.filter(item => {
    if (cat !== "all" && item.category !== cat) return false;
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchKeyword = item.searchKeyword.toLowerCase().includes(q);
      const matchSpec = (item.spec || "").toLowerCase().includes(q);
      if (!matchName && !matchKeyword && !matchSpec) return false;
    }
    return true;
  });

  return {
    date: new Date().toLocaleDateString("vi-VN"),
    items: filtered
  };
}

let currentDailyPrices = [];
let selectedDailyCategory = "all";
let dailyPriceSearchQuery = "";
let dailySearchDebounceTimer = null;

async function loadDailyPrices(category = selectedDailyCategory, query = dailyPriceSearchQuery) {
  const container = document.getElementById("daily-prices-grid");
  const dateBadge = document.getElementById("daily-price-date-badge");
  if (!container) return;

  let data = null;

  try {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (query) params.append("q", query);

    const res = await fetch(`/api/daily-prices?${params.toString()}`);
    if (res.ok) {
      const text = await res.text();
      if (text && !text.trim().startsWith("<")) {
        data = JSON.parse(text);
      }
    }
  } catch (err) {
    console.warn("Dùng fallback dữ liệu bảng giá linh kiện:", err);
  }

  if (!data || !Array.isArray(data.items)) {
    data = getFallbackDailyPrices(category, query);
  }

  if (dateBadge && data.date) {
    dateBadge.textContent = `Cập nhật ngày ${data.date}`;
  }

  currentDailyPrices = data.items || [];
  renderDailyPrices(currentDailyPrices);
}

// Cập nhật các chỉ số trong Bento Spotlight Box
function updateDailySpotlight(items) {
  if (!items || items.length === 0) return;

  // 1. Món giảm giá nhiều nhất
  let maxDropItem = items[0];
  items.forEach(it => {
    if (it.changeAmount < maxDropItem.changeAmount) {
      maxDropItem = it;
    }
  });

  const hotNameEl = document.getElementById("spotlight-hot-name");
  const hotDescEl = document.getElementById("spotlight-hot-desc");
  if (hotNameEl && maxDropItem) {
    hotNameEl.textContent = maxDropItem.name.split("(")[0].trim();
  }
  if (hotDescEl && maxDropItem) {
    hotDescEl.textContent = `Giảm ${formatVND(maxDropItem.changeAmount)} (${maxDropItem.changePercent}%)`;
  }

  // 2. Tổng số thiết bị theo dõi
  const totalEl = document.getElementById("spotlight-total-tracked");
  if (totalEl) {
    animateNumericValue(totalEl, items.length, 300, "raw");
  }

  // 3. Số lượng linh kiện < 5 triệu
  const budgetCount = items.filter(it => it.minPrice <= 5000000).length;
  const budgetEl = document.getElementById("spotlight-budget-count");
  if (budgetEl) {
    animateNumericValue(budgetEl, budgetCount, 320, "raw");
  }
}

function renderDailyPrices(items) {
  const container = document.getElementById("daily-prices-grid");
  if (!container) return;

  // Cập nhật Spotlight Row
  updateDailySpotlight(items);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-3 bento-box p-8">
        <div class="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <i data-lucide="info" class="w-6 h-6"></i>
        </div>
        <h4 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">Không tìm thấy linh kiện phù hợp</h4>
        <p class="text-xs text-neutral-500">Thử tìm với từ khóa khác hoặc chọn "Tất cả" danh mục.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = "";

  items.forEach(item => {
    let trendBadge = "";
    if (item.trend === "down") {
      trendBadge = `
        <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i>
          <span>${formatVND(Math.abs(item.changeAmount))} (${item.changePercent}%)</span>
        </span>
      `;
    } else if (item.trend === "up") {
      trendBadge = `
        <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
          <span>+${formatVND(item.changeAmount)} (+${item.changePercent}%)</span>
        </span>
      `;
    } else {
      trendBadge = `
        <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
          <span>▬ Ổn định</span>
        </span>
      `;
    }

    const card = document.createElement("div");
    card.className = "bento-box tactile-card p-5 transition flex flex-col justify-between space-y-4";
    card.innerHTML = `
      <div class="space-y-3">
        <!-- Header card: Category & Trend -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            ${escapeHtml(item.categoryName)}
          </span>
          ${trendBadge}
        </div>

        <!-- Tên linh kiện -->
        <div>
          <h3 class="font-extrabold text-base text-neutral-900 dark:text-neutral-100 leading-snug">
            ${escapeHtml(item.name)}
          </h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            ${escapeHtml(item.spec)}
          </p>
        </div>

        <!-- Khung giá: Giá sàn vs Giá trung bình -->
        <div class="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200/60 dark:border-white/5">
          <div>
            <span class="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Giá sàn săn được</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ${formatVND(item.minPrice)}
            </span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Giá TB thị trường</span>
            <span class="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
              ${formatVND(item.avgPrice)}
            </span>
          </div>
        </div>

        <!-- Nhãn khuyến nghị -->
        <div class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
          <span>${item.recommendationLabel || "✨ Giá tốt"}</span>
        </div>
      </div>

      <!-- Nút hành động 1-Click săn bài đăng -->
      <button 
        type="button" 
        onclick="huntDailyItem('${escapeHtml(item.searchKeyword)}', ${item.suggestedMaxPrice})" 
        class="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs shadow-blue-500/20"
      >
        <i data-lucide="search" class="w-3.5 h-3.5"></i>
        <span>Săn bài đăng "${escapeHtml(item.searchKeyword)}" ngay</span>
      </button>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();

  // Hiệu ứng xuất hiện phân tầng Anime.js
  animateStaggerElements("#daily-prices-grid", ".tactile-card");
}

function selectDailyPriceCategory(cat) {
  selectedDailyCategory = cat;
  const pills = document.querySelectorAll(".daily-price-pill");
  pills.forEach(p => {
    const pCat = p.getAttribute("data-cat");
    if (pCat === cat) {
      p.className = "daily-price-pill active px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold shrink-0 transition shadow-xs";
    } else {
      p.className = "daily-price-pill px-3.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 shrink-0 transition";
    }
  });

  loadDailyPrices(cat, dailyPriceSearchQuery);
}

function handleDailyPriceInput(input) {
  toggleClearBtn(input, "daily-price-clear-btn");
  handleDailyPriceSearch(input.value);
}

function clearDailyPriceSearch() {
  const input = document.getElementById("daily-price-search");
  if (input) {
    input.value = "";
    toggleClearBtn(input, "daily-price-clear-btn");
  }
  handleDailyPriceSearch("");
}

function handleDailyPriceSearch(val) {
  dailyPriceSearchQuery = (val || "").trim();
  clearTimeout(dailySearchDebounceTimer);
  dailySearchDebounceTimer = setTimeout(() => {
    loadDailyPrices(selectedDailyCategory, dailyPriceSearchQuery);
  }, 250);
}

function huntDailyItem(keyword, maxPrice) {
  switchTab("search");
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = keyword;
    toggleClearBtn(searchInput, "search-clear-btn");
  }

  // Đảm bảo không bị kẹt lọc danh mục hoặc nguồn bán lẻ cũ
  selectCategory("all");
  selectSource("all");

  // Đồng bộ khoảng giá:
  // - Nếu sản phẩm có giá trần <= 5tr (như CPU Ryzen 5 5600, i5 12400f, RAM, SSD),
  //   giữ bộ lọc mặc định < 5tr (5.000.000 đ) để người dùng xem trọn vẹn cả CPU lẻ và combo hời
  // - Nếu sản phẩm cao hơn 5tr, nâng trần tương ứng (12tr, 20tr hoặc Tất cả) để không bị ẩn kết quả
  let targetPreset = 5000000;
  const num = Number(maxPrice) || 0;
  if (num > 20000000) {
    targetPreset = 0; // Tất cả giá
  } else if (num > 12000000) {
    targetPreset = 20000000; // < 20tr
  } else if (num > 5000000) {
    targetPreset = 12000000; // < 12tr
  } else {
    targetPreset = 5000000; // < 5tr (mặc định)
  }

  setPricePreset(targetPreset, true);

  clearTimeout(searchDebounceTimer);
  performSearch(keyword);
}
