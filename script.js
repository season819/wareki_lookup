// ===== 日本年號設定 =====
var JAPANESE_ERAS = [
  { key: "meiji",  name: "明治", start: 1868, end: 1912 }, // 1868–1911
  { key: "taisho", name: "大正", start: 1912, end: 1926 }, // 1912–1925
  { key: "showa",  name: "昭和", start: 1926, end: 1989 }, // 1926–1988
  { key: "heisei", name: "平成", start: 1989, end: 2019 }, // 1989–2018
  { key: "reiwa",  name: "令和", start: 2019, end: null }  // 2019–
];

// ===== 年齡計算 =====
function getAgeByYear(year) {
  var now = new Date();
  var age = now.getFullYear() - year;
  if (age < 0) return "—"; // 未來年份不顯示年齡
  return age;
}

// ===== 轉換函式 =====
function eraKeyOfYear(year) {
  for (var i = 0; i < JAPANESE_ERAS.length; i++) {
    var era = JAPANESE_ERAS[i];
    if (year < era.start) continue;
    if (era.end !== null && year >= era.end) continue;
    return era.key;
  }
  return null;
}

function seirekiToJapanese(year) {
  for (var i = 0; i < JAPANESE_ERAS.length; i++) {
    var era = JAPANESE_ERAS[i];
    if (year < era.start) continue;
    if (era.end !== null && year >= era.end) continue;
    var n = year - era.start + 1;
    var yearLabel = n === 1 ? "元" : String(n);
    return era.name + yearLabel + "年";
  }
  return null;
}

function japaneseToSeireki(eraKey, eraYear) {
  var era = JAPANESE_ERAS.find(function (e) {
    return e.key === eraKey;
  });
  if (!era) return null;
  if (eraYear <= 0) return null;
  var year = era.start + eraYear - 1;
  if (era.end !== null && year >= era.end) return null;
  return year;
}

function seirekiToMinguo(year) {
  var n = year - 1911;
  if (n <= 0) return null;
  return n === 1 ? "民國元年" : "民國" + n + "年";
}

function minguoToSeireki(minguoYear) {
  if (minguoYear <= 0) return null;
  return 1911 + minguoYear;
}

// ===== 表格產生與高亮 =====
function appendSeparatorRow(tbody, eraKey, label) {
  var trSep = document.createElement("tr");
  trSep.className = "separator-row";
  if (eraKey) {
    trSep.setAttribute("data-era", eraKey);
  }
  var td = document.createElement("td");
  td.colSpan = 3;
  td.textContent = label || "";
  trSep.appendChild(td);
  tbody.appendChild(trSep);
}

function renderJapaneseTable() {
  var tbody = document.getElementById("tbody-japanese");
  if (!tbody) return;
  tbody.innerHTML = "";

  var endLimit = 2100;

  JAPANESE_ERAS.forEach(function (era) {
    var eraEnd = era.end ? era.end : endLimit + 1;
    var count = 0;

    for (var y = era.start; y <= endLimit && y < eraEnd; y++) {
      if (count > 0 && count % 10 === 0) {
        appendSeparatorRow(tbody, era.key, "");
      }

      var tr = document.createElement("tr");
      tr.setAttribute("data-year", String(y));
      tr.setAttribute("data-era", era.key);

      var tdYear = document.createElement("td");
      tdYear.textContent = y;

      var tdJp = document.createElement("td");
      var jp = seirekiToJapanese(y);
      tdJp.textContent = jp ? jp : "—";

      var tdAge = document.createElement("td");
      tdAge.textContent = getAgeByYear(y);

      tr.appendChild(tdYear);
      tr.appendChild(tdJp);
      tr.appendChild(tdAge);
      tbody.appendChild(tr);

      count++;
    }
  });
}

function renderMinguoTable() {
  var tbody = document.getElementById("tbody-minguo");
  if (!tbody) return;
  tbody.innerHTML = "";

  var startYear = 1912;
  var endYear = 2100;
  var count = 0;

  for (var y = startYear; y <= endYear; y++) {
    if (count > 0 && count % 10 === 0) {
      appendSeparatorRow(tbody, null, "");
    }

    var tr = document.createElement("tr");
    tr.setAttribute("data-year", String(y));

    var tdYear = document.createElement("td");
    tdYear.textContent = y;

    var tdTw = document.createElement("td");
    var tw = seirekiToMinguo(y);
    tdTw.textContent = tw ? tw.replace("民國", "").replace("年", "") : "—";

    var tdAge = document.createElement("td");
    tdAge.textContent = getAgeByYear(y);

    tr.appendChild(tdYear);
    tr.appendChild(tdTw);
    tr.appendChild(tdAge);
    tbody.appendChild(tr);

    count++;
  }
}

function clearHighlight(tbody) {
  var rows = tbody.querySelectorAll("tr.highlight");
  rows.forEach(function (row) {
    row.classList.remove("highlight");
  });
}

function highlightYearRow(tbodyId, year) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  clearHighlight(tbody);
  var row = tbody.querySelector('tr[data-year="' + year + '"]');
  if (!row) return;

  row.classList.add("highlight");

  var container = tbody.parentElement; // .table-wrapper
  if (!container || !container.classList.contains("table-wrapper")) return;

  var rowTop = row.offsetTop;
  var containerHeight = container.clientHeight;

  // ★ 高光行不置中，往上 25%
  container.scrollTo({
    top: rowTop - containerHeight * 0.25,
    behavior: "smooth"
  });
}


// ===== 主分頁切換 =====
function setupMainTabs() {
  var buttons = document.querySelectorAll(".main-tabs .tab-button");
  var panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-tab");

      buttons.forEach(function (b) {
        b.classList.remove("active");
      });
      panels.forEach(function (p) {
        p.classList.remove("active");
      });

      btn.classList.add("active");
      var targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

// ===== 日本時代標籤 =====
function applyEraFilter(eraKey) {
  var tbody = document.getElementById("tbody-japanese");
  if (!tbody) return;

  var rows = tbody.querySelectorAll("tr");

  rows.forEach(function (row) {
    var rowEra = row.getAttribute("data-era") || "";
    if (row.classList.contains("separator-row")) {
      row.style.display = rowEra === eraKey ? "" : "none";
    } else {
      row.style.display = rowEra === eraKey ? "" : "none";
    }
  });
}

function setActiveEraTab(eraKey) {
  var buttons = document.querySelectorAll(".era-tabs .tab-button");
  buttons.forEach(function (btn) {
    var key = btn.getAttribute("data-era");
    if (key === eraKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  applyEraFilter(eraKey);
}

function setupEraTabs() {
  var buttons = document.querySelectorAll(".era-tabs .tab-button");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var eraKey = btn.getAttribute("data-era");
      if (!eraKey) return;
      setActiveEraTab(eraKey);
    });
  });

  // 預設顯示令和
  setActiveEraTab("reiwa");
}

// ===== 查找功能 =====
function setupSearch() {
  // 西元 → 日本曆
  var jpYearInput = document.getElementById("jp-year-input");
  var jpYearBtn = document.getElementById("jp-year-search");
  var jpYearResult = document.getElementById("jp-year-result");

  function searchJapaneseByYear() {
    var year = parseInt(jpYearInput.value, 10);
    if (isNaN(year)) {
      jpYearResult.textContent = "請輸入有效的西元年。";
      return;
    }
    var jp = seirekiToJapanese(year);
    if (!jp) {
      jpYearResult.textContent = "目前表格未涵蓋此年份或無對應日本曆。";
      return;
    }

    var eraKey = eraKeyOfYear(year);
    if (eraKey) {
      setActiveEraTab(eraKey);
    }

    var ageTxt = getAgeByYear(year);
    jpYearResult.textContent =
      "西元 " + year + " 年 = " + jp + "；年齡：" + ageTxt;

    highlightYearRow("tbody-japanese", year);
  }

  if (jpYearBtn) {
    jpYearBtn.addEventListener("click", searchJapaneseByYear);
  }
  if (jpYearInput) {
    jpYearInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchJapaneseByYear();
      }
    });
  }

  // 「今年」：西元 → 日本曆
  var jpYearThisBtn = document.getElementById("jp-year-this");
  if (jpYearThisBtn && jpYearInput) {
    jpYearThisBtn.addEventListener("click", function () {
      var now = new Date();
      jpYearInput.value = now.getFullYear();
      searchJapaneseByYear();
    });
  }

  // 日本曆 → 西元
  var jpEraSelect = document.getElementById("jp-era-select");
  var jpEraYearInput = document.getElementById("jp-era-year");
  var jpEraBtn = document.getElementById("jp-era-search");
  var jpEraResult = document.getElementById("jp-era-result");

  function searchSeirekiByJapanese() {
    var eraKey = jpEraSelect.value;
    var eraYear = parseInt(jpEraYearInput.value, 10);
    if (isNaN(eraYear)) {
      jpEraResult.textContent = "有効な年数を入力するしてください。";
      return;
    }
    var year = japaneseToSeireki(eraKey, eraYear);
    var era = JAPANESE_ERAS.find(function (e) {
      return e.key === eraKey;
    });
    var eraName = era ? era.name : "";

    if (!year) {
      jpEraResult.textContent = "この元号と年数の組み合わせは対応範囲外です。";
      return;
    }

    setActiveEraTab(eraKey);

    var ageTxt = getAgeByYear(year);
    jpEraResult.textContent =
      eraName + (eraYear === 1 ? "元" : eraYear) +
      "年 = 西元 " + year + " 年；年齡：" + ageTxt;

    highlightYearRow("tbody-japanese", year);
  }

  if (jpEraBtn) {
    jpEraBtn.addEventListener("click", searchSeirekiByJapanese);
  }
  if (jpEraYearInput) {
    jpEraYearInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchSeirekiByJapanese();
      }
    });
  }

  // 「今年」：和暦 → 西元年（今日所在的元號＋年數）
  var jpEraThisBtn = document.getElementById("jp-era-this");
  if (jpEraThisBtn && jpEraSelect && jpEraYearInput) {
    jpEraThisBtn.addEventListener("click", function () {
      var now = new Date();
      var year = now.getFullYear();
      var eraKey = eraKeyOfYear(year);
      if (!eraKey) return;
      var era = JAPANESE_ERAS.find(function (e) { return e.key === eraKey; });
      if (!era) return;
      var eraYear = year - era.start + 1;

      jpEraSelect.value = eraKey;
      jpEraYearInput.value = eraYear;
      searchSeirekiByJapanese();
    });
  }


  // 西元 → 民國
  var twYearInput = document.getElementById("tw-year-input");
  var twYearBtn = document.getElementById("tw-year-search");
  var twYearResult = document.getElementById("tw-year-result");

  function searchMinguoByYear() {
    var year = parseInt(twYearInput.value, 10);
    if (isNaN(year)) {
      twYearResult.textContent = "請輸入有效的西元年。";
      return;
    }
    var m = seirekiToMinguo(year);
    if (!m) {
      twYearResult.textContent = "此年份早於民國元年或不在表格範圍。";
      return;
    }
    var num = year - 1911;
    var ageTxt = getAgeByYear(year);
    twYearResult.textContent =
      "西元 " + year + " 年 = 民國 " + num + " 年；年齡：" + ageTxt;

    highlightYearRow("tbody-minguo", year);
  }

  if (twYearBtn) {
    twYearBtn.addEventListener("click", searchMinguoByYear);
  }
  if (twYearInput) {
    twYearInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchMinguoByYear();
      }
    });
  }

  // 「今年」：西元 → 民國
  var twYearThisBtn = document.getElementById("tw-year-this");
  if (twYearThisBtn && twYearInput) {
    twYearThisBtn.addEventListener("click", function () {
      var now = new Date();
      twYearInput.value = now.getFullYear();
      searchMinguoByYear();
    });
  }

  // 民國 → 西元
  var twMinguoInput = document.getElementById("tw-minguo-year");
  var twMinguoBtn = document.getElementById("tw-minguo-search");
  var twMinguoResult = document.getElementById("tw-minguo-result");

  function searchSeirekiByMinguo() {
    var mYear = parseInt(twMinguoInput.value, 10);
    if (isNaN(mYear)) {
      twMinguoResult.textContent = "請輸入有效的民國年。";
      return;
    }
    var year = minguoToSeireki(mYear);
    if (!year || year > 2100) {
      twMinguoResult.textContent = "此民國年不在表格範圍。";
      return;
    }
    var ageTxt = getAgeByYear(year);
    twMinguoResult.textContent =
      "民國 " + mYear + " 年 = 西元 " + year + " 年；年齡：" + ageTxt;

    highlightYearRow("tbody-minguo", year);
  }

  if (twMinguoBtn) {
    twMinguoBtn.addEventListener("click", searchSeirekiByMinguo);
  }
  if (twMinguoInput) {
    twMinguoInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchSeirekiByMinguo();
      }
    });
  }
  //「今年」：民國年 → 西元年
  var twMinguoThisBtn = document.getElementById("tw-minguo-this");
  if (twMinguoThisBtn && twMinguoInput) {
    twMinguoThisBtn.addEventListener("click", function () {
      var now = new Date();
      var mYear = now.getFullYear() - 1911;

      if (mYear <= 0) return;  // 防呆

      twMinguoInput.value = mYear;
      searchSeirekiByMinguo();
    });
  }
}

// 頁尾年份
function setFooterYear() {
  var span = document.getElementById("current-year");
  if (!span) return;
  span.textContent = new Date().getFullYear();
}

// 右側「次の祝日」卡片
function initSidebarNextHolidayCard() {
  if (typeof getNextJapaneseHoliday !== "function") return;

  var titleEl = document.getElementById("side-holiday-title");
  var detailEl = document.getElementById("side-holiday-detail");
  if (!titleEl || !detailEl) return;

  var info = getNextJapaneseHoliday(new Date());
  if (!info || !info.date) return;

  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var diffDays = Math.ceil((info.date.getTime() - now.getTime()) / 86400000);
  var m = info.date.getMonth() + 1;
  var d = info.date.getDate();

  titleEl.textContent = "次の祝日：" + info.name;
  detailEl.textContent = m + "月" + d + "日（あと " + diffDays + " 日）";
}

// 初始化
document.addEventListener("DOMContentLoaded", function () {
  renderJapaneseTable();
  renderMinguoTable();
  setupMainTabs();
  setupEraTabs();
  setupSearch();
  setFooterYear();
  initSidebarNextHolidayCard();
});




