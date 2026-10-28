// Tech Deal Hunter - Frontend Script (Hiện Đại, Hỗ Trợ Slider, Dấu X Xóa Nhanh & Đổi Theme)

let currentResults = [];
let currentStats = null;
let currentViewMode = "grid"; // "grid" hoặc "list"
let searchDebounceTimer = null;

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  lucide.createIcons();
  
  // Tải danh sách sản phẩm ban đầu mà không điền sẵn chữ vào ô input
  performSearch("");
  loadWatchdogs();
});

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

  // Nếu là ô tìm kiếm chính thì tự động quét lại
  if (inputId === "search-input") {
    performSearch("");
  }
}

// === THANH TRƯỢT KHOẢNG GIÁ (PRICE RANGE SLIDER) ===

function handleSliderChange(val) {
  const label = document.getElementById("slider-price-label");
  const hiddenInput = document.getElementById("filter-max-price");
  const num = Number(val);

  if (num >= 30000000) {
    label.textContent = "Tất cả giá";
    hiddenInput.value = "";
  } else {
    label.textContent = `≤ ${formatVND(num)}`;
    hiddenInput.value = num;
  }

  // Debounce tìm kiếm khi kéo slider
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    performSearch(document.getElementById("search-input").value);
  }, 250);
}

function setPricePreset(val) {
  const slider = document.getElementById("price-range-slider");
  if (val === 0) {
    slider.value = 30000000;
    handleSliderChange(30000000);
  } else {
    slider.value = val;
    handleSliderChange(val);
  }
}

// === CHỌN DANH MỤC THIẾT BỊ (PILLS) ===

function selectCategory(cat) {
  document.getElementById("filter-category").value = cat;

  // Cập nhật giao diện nút active
  const pills = document.querySelectorAll(".cat-pill");
  pills.forEach(p => {
    const pCat = p.getAttribute("data-cat");
    if (pCat === cat) {
      p.className = "cat-pill active p-3 rounded-xl border border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold transition text-left flex items-center gap-2 shadow-xs";
    } else {
      p.className = "cat-pill p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-left flex items-center gap-2 shadow-xs";
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
      p.className = "source-pill py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition text-left flex items-center gap-1.5";
    }
  });

  performSearch(document.getElementById("search-input").value);
}

// === ĐẶT LẠI TOÀN BỘ BỘ LỌC (RESET) ===

function resetFilters() {
  const searchInput = document.getElementById("search-input");
  searchInput.value = "";
  toggleClearBtn(searchInput, "search-clear-btn");

  selectCategory("all");
  selectSource("all");
  setPricePreset(0);

  document.getElementById("filter-region").value = "all";
  document.getElementById("filter-hide-scam").checked = true;
  document.getElementById("filter-user-only").checked = false;
  document.getElementById("filter-sort").value = "deal";

  performSearch("");
}

// === ĐIỀU HƯỚNG TAB ===

function switchTab(tab) {
  const viewSearch = document.getElementById("view-search");
  const viewWatchdog = document.getElementById("view-watchdog");
  const viewVerify = document.getElementById("view-verify");
  const tabSearchBtn = document.getElementById("tab-search-btn");
  const tabWatchdogBtn = document.getElementById("tab-watchdog-btn");
  const tabVerifyBtn = document.getElementById("tab-verify-btn");
  const mobileFab = document.getElementById("mobile-filter-fab");

  viewSearch.classList.add("hidden");
  viewWatchdog.classList.add("hidden");
  viewVerify.classList.add("hidden");
  closeMobileFilter();

  const normalClass = "px-3.5 py-2 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium";
  const activeClass = "px-3.5 py-2 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold";

  tabSearchBtn.className = normalClass;
  tabWatchdogBtn.className = normalClass;
  tabVerifyBtn.className = normalClass;

  if (tab === "search") {
    viewSearch.classList.remove("hidden");
    tabSearchBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.remove("hidden");
  } else if (tab === "verify") {
    viewVerify.classList.remove("hidden");
    tabVerifyBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.add("hidden");
  } else if (tab === "watchdog") {
    viewWatchdog.classList.remove("hidden");
    tabWatchdogBtn.className = activeClass;
    if (mobileFab) mobileFab.classList.add("hidden");
    loadWatchdogs();
  }
  lucide.createIcons();
}

// Bấm nhanh gợi ý
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

    // Hiển thị banner thống kê giá thị trường
    renderStats(query, data.stats);

    // Tải và hiển thị danh sách tìm kiếm nhóm Facebook
    loadFacebookGroups(query, category);

    // Cập nhật thông số toolbar
    document.getElementById("results-count").textContent = currentResults.length;
    document.getElementById("results-time").textContent = data.durationMs || 100;

    // Render danh sách sản phẩm
    renderResults(currentResults);

  } catch (err) {
    loading.classList.add("hidden");
    console.error("Lỗi tìm kiếm:", err);
  }
}

// Tải danh sách nhóm Facebook có sẵn bộ lọc bài đăng mới nhất
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
      a.className = "inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 font-semibold transition shadow-2xs group text-xs";
      
      a.innerHTML = `
        <span class="text-blue-600 dark:text-blue-400 font-bold">#</span>
        <span class="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">${escapeHtml(g.name)}</span>
        <span class="text-[10px] text-slate-400 font-normal">(${escapeHtml(g.members.split(' ')[0])})</span>
        <i data-lucide="external-link" class="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition"></i>
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

  const activeBtnClass = "p-1.5 rounded-md text-blue-600 bg-white dark:bg-slate-900 shadow-xs";
  const inactiveBtnClass = "p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200";

  if (mode === "grid") {
    gridBtn.className = activeBtnClass;
    listBtn.className = inactiveBtnClass;
  } else {
    listBtn.className = activeBtnClass;
    gridBtn.className = inactiveBtnClass;
  }

  renderResults(currentResults);
}

// Sắp xếp lại
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

// Render banner thống kê khoảng giá
function renderStats(query, stats) {
  const banner = document.getElementById("stats-banner");
  if (!stats || stats.total === 0) {
    banner.classList.add("hidden");
    return;
  }

  banner.classList.remove("hidden");
  document.getElementById("stat-query-name").textContent = query ? `cho "${query}"` : "";
  document.getElementById("stat-min-price").textContent = formatVND(stats.minPrice);
  document.getElementById("stat-median-price").textContent = formatVND(stats.medianPrice);
  document.getElementById("stat-max-price").textContent = formatVND(stats.maxPrice);
  document.getElementById("stat-deal-count").textContent = `${stats.superDealCount} món`;
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
    // Nhãn nguồn - Màu tương phản rõ ràng, sắc nét không bị mờ
    let sourceBadgeClass = "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-700";
    if (item.sourceBadge === "voz") sourceBadgeClass = "bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200 border-blue-300 dark:border-blue-700";
    if (item.sourceBadge === "nhattao") sourceBadgeClass = "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700";
    if (item.sourceBadge === "cellphones") sourceBadgeClass = "bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 border-rose-300 dark:border-rose-700";
    if (item.sourceBadge === "tgdd") sourceBadgeClass = "bg-yellow-100 text-yellow-900 dark:bg-yellow-950/70 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700";
    if (item.sourceBadge === "hoangha") sourceBadgeClass = "bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border-purple-300 dark:border-purple-700";
    if (item.sourceBadge === "fpt") sourceBadgeClass = "bg-orange-100 text-orange-900 dark:bg-orange-950/70 dark:text-orange-200 border-orange-300 dark:border-orange-700";
    if (item.sourceBadge === "laptop88") sourceBadgeClass = "bg-teal-100 text-teal-900 dark:bg-teal-950/70 dark:text-teal-200 border-teal-300 dark:border-teal-700";
    if (item.sourceBadge === "pcpart") sourceBadgeClass = "bg-cyan-100 text-cyan-900 dark:bg-cyan-950/70 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700";
    if (item.sourceBadge === "retail") sourceBadgeClass = "bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 border-rose-300 dark:border-rose-700";

    // Nhãn đánh giá giá hời
    let ratingBadge = '';
    if (item.dealRating && item.dealRating.level === "super_deal") {
      ratingBadge = `<span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shrink-0">🔥 Kèo rất hời</span>`;
    } else if (item.dealRating && item.dealRating.level === "good_deal") {
      ratingBadge = `<span class="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shrink-0">✨ Giá tốt</span>`;
    }

    // Huy hiệu IMEI / Serial
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
      // DẠNG DANH SÁCH (LIST VIEW)
      card.className = "deal-card bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0";
      card.innerHTML = `
        <div class="flex items-center space-x-3.5 min-w-0 flex-1">
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="shrink-0 block">
            <img 
              src="${item.image}" 
              alt="${escapeHtml(item.title)}" 
              referrerpolicy="no-referrer"
              class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:opacity-90 transition"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'"
            >
          </a>
          <div class="space-y-1.5 min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${sourceBadgeClass}">${item.source}</span>
              ${ratingBadge}
              <span class="text-[11px] text-slate-400 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${escapeHtml(item.location || 'Toàn quốc')}</span>
              <span class="text-[11px] text-slate-400">• ${timeAgo(item.postedTime)}</span>
            </div>
            <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 break-anywhere leading-snug">
              <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition inline-flex items-center gap-1.5 group" title="${escapeHtml(item.title)}">
                <span>${escapeHtml(item.title)}</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-blue-500 shrink-0 inline"></i>
              </a>
            </h4>
            ${hardwareBadge}
          </div>
        </div>

        <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div class="text-left sm:text-right">
            <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">${formatVND(item.price)}</div>
            <span class="text-[11px] text-slate-400">${item.isShop ? '🏪 Cửa hàng' : '👤 Người dùng'}</span>
          </div>
        </div>
      `;
    } else {
      // DẠNG LƯỚI (GRID VIEW)
      card.className = "deal-card bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between min-w-0 shadow-xs hover:shadow-md transition";
      card.innerHTML = `
        <div class="min-w-0 flex flex-col h-full">
          <!-- Ảnh đại diện - Sạch sẽ không còn badge bị mờ che trên ảnh -->
          <div class="relative h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden group shrink-0">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="block w-full h-full">
              <img 
                src="${item.image}" 
                alt="${escapeHtml(item.title)}" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover group-hover:scale-104 transition-transform duration-200"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'"
              >
            </a>
            
            <!-- Vị trí & Thời gian tinh gọn ở chân ảnh -->
            <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1 rounded-lg gap-2 shadow-xs border border-slate-200/60 dark:border-slate-800/60 pointer-events-none">
              <span class="truncate min-w-0 flex items-center gap-1 font-medium">
                <i data-lucide="map-pin" class="w-3 h-3 text-slate-400 shrink-0"></i>
                <span class="truncate">${escapeHtml(item.location || 'Toàn quốc')}</span>
              </span>
              <span class="shrink-0 flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                <i data-lucide="clock" class="w-3 h-3 shrink-0"></i>
                <span>${timeAgo(item.postedTime)}</span>
              </span>
            </div>
          </div>

          <!-- Nội dung chi tiết nằm ở phần dưới, rõ ràng, độ tương phản cao -->
          <div class="p-4 space-y-3 min-w-0 flex-1 flex flex-col justify-between">
            <div class="space-y-2.5 min-w-0">
              
              <!-- Badges nguồn & Deal - Đưa xuống đây để nét căng và không bị mờ -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold border ${sourceBadgeClass}">
                  ${item.source}
                </span>
                ${ratingBadge}
              </div>

              <!-- Tiêu đề sản phẩm gắn link trực tiếp -->
              <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 break-anywhere leading-snug">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 transition inline group" title="${escapeHtml(item.title)}">
                  <span>${escapeHtml(item.title)}</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-blue-500 inline ml-1 align-baseline shrink-0"></i>
                </a>
              </h4>

              <!-- Giá & Loại người bán -->
              <div class="flex items-baseline justify-between gap-1 min-w-0 pt-0.5">
                <div class="min-w-0">
                  <div class="text-xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight truncate">
                    ${formatVND(item.price)}
                  </div>
                  <div class="text-xs text-slate-400 truncate">
                    ${item.dealRating?.desc || "Mức giá hợp lý"}
                  </div>
                </div>
                
                <div class="shrink-0">
                  <span class="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    ${item.isShop ? '🏪 Cửa hàng' : '👤 Người dùng'}
                  </span>
                </div>
              </div>

              <!-- Mô tả ngắn gọn -->
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-anywhere bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                ${escapeHtml(item.description || item.condition || "Đã qua sử dụng, bấm vào tiêu đề để xem chi tiết bài đăng.")}
              </p>

              <!-- Huy hiệu IMEI / Serial nếu có -->
              ${hardwareBadge}

            </div>
          </div>
        </div>
      `;
    }

    container.appendChild(card);
  });

  lucide.createIcons();
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
    <div class="py-8 text-center text-slate-500 flex items-center justify-center space-x-2">
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
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Các trang tra cứu chính thức (Mở 1-Click):</span>
        <div class="flex flex-wrap gap-2 text-xs">
          ${report.lookupLinks.appleCoverage ? `
            <a href="${report.lookupLinks.appleCoverage}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700">
              <span>Apple Check Coverage</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.sickw ? `
            <a href="${report.lookupLinks.sickw}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700">
              <span>Kiểm tra iCloud Ẩn (Sickw)</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.imeiInfo ? `
            <a href="${report.lookupLinks.imeiInfo}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700">
              <span>Tra cứu GSMA (IMEI.info)</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.dellSupport ? `
            <a href="${report.lookupLinks.dellSupport}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700">
              <span>Dell Support</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400"></i>
            </a>
          ` : ''}
          ${report.lookupLinks.lenovoSupport ? `
            <a href="${report.lookupLinks.lenovoSupport}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700">
              <span>Lenovo Warranty</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400"></i>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-4">
      ${statusBadge}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div class="min-w-0">
          <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Mã đã nhập:</span>
          <span class="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm break-anywhere">${escapeHtml(report.raw)}</span>
        </div>
        ${report.formatted ? `
          <div class="min-w-0">
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Định dạng tiêu chuẩn:</span>
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm break-anywhere">${escapeHtml(report.formatted)}</span>
          </div>
        ` : ''}
        ${report.tac ? `
          <div class="min-w-0">
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Mã dải TAC (8 số đầu):</span>
            <span class="font-mono font-medium text-slate-700 dark:text-slate-300">${escapeHtml(report.tac)}</span>
          </div>
        ` : ''}
        ${report.brandHint ? `
          <div class="min-w-0">
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Nhận diện thương hiệu & Xuất xứ:</span>
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

async function loadWatchdogs() {
  try {
    const res = await fetch("/api/watchdogs");
    const list = await res.json();
    renderWatchdogs(list);
  } catch (err) {
    console.error("Lỗi tải watchdog:", err);
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
      <div class="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-xs">
        Chưa có mục theo dõi nào. Điền thông tin ở khung bên trái để kích hoạt quét tự động.
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  list.forEach(w => {
    const item = document.createElement("div");
    item.className = `p-4 rounded-xl border ${w.enabled ? 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 opacity-60'} flex items-center justify-between gap-3 transition min-w-0 shadow-xs`;

    item.innerHTML = `
      <div class="space-y-1 min-w-0 flex-1">
        <div class="flex items-center space-x-2 min-w-0 flex-wrap">
          <span class="font-bold text-slate-900 dark:text-white text-sm truncate">${escapeHtml(w.keyword)}</span>
          <span class="text-xs px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-bold shrink-0">
            &le; ${formatVND(w.maxPrice)}
          </span>
          ${w.telegramBotToken ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">Telegram</span>' : ''}
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 truncate">
          <span>Phát hiện: <b class="text-rose-600 dark:text-rose-400 font-bold">${w.alertCount || 0}</b> deal</span>
          <span>•</span>
          <span class="truncate">${w.lastChecked ? timeAgo(w.lastChecked) : 'Chờ quét'}</span>
        </div>
      </div>

      <div class="flex items-center space-x-2 shrink-0">
        <button 
          onclick="toggleWatchdog('${w.id}')" 
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border ${w.enabled ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'}"
        >
          ${w.enabled ? 'Đang Bật' : 'Tạm Dừng'}
        </button>
        <button 
          onclick="deleteWatchdog('${w.id}')" 
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
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

  try {
    const res = await fetch("/api/watchdogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, maxPrice, category, telegramBotToken, telegramChatId })
    });

    if (res.ok) {
      document.getElementById("wd-keyword").value = "";
      document.getElementById("wd-max-price").value = "";
      alert("Đã thêm theo dõi: " + keyword);
      loadWatchdogs();
    }
  } catch (err) {
    alert("Lỗi khi thêm theo dõi");
  }
}

async function toggleWatchdog(id) {
  try {
    await fetch(`/api/watchdogs/${id}/toggle`, { method: "PATCH" });
    loadWatchdogs();
  } catch (err) {
    console.error(err);
  }
}

async function deleteWatchdog(id) {
  if (!confirm("Xác nhận xóa mục theo dõi này?")) return;
  try {
    await fetch(`/api/watchdogs/${id}`, { method: "DELETE" });
    loadWatchdogs();
  } catch (err) {
    console.error(err);
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
    const data = await res.json();
    if (data.success) {
      alert("Gửi thành công! Kiểm tra tin nhắn trong Telegram của bạn.");
    } else {
      alert("Thất bại: " + (data.error || "Không thể gửi tin"));
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
