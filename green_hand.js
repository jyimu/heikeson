(function () {
  const SESSION_KEY = "heikeson_currentUser";
  const LOG_KEY = "heikeson_workout_logs";

  const exercises = [
    {
      id: "warmup",
      name: "热身拉伸",
      desc: "激活关节，降低受伤风险",
      tags: ["新手", "5 分钟", "全身"],
      videoId: "g_tea8ZNk5A",
      gifStyle: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
      emoji: "🧘",
    },
    {
      id: "squat",
      name: "深蹲",
      desc: "锻炼大腿与臀部，基础力量动作",
      tags: ["下肢", "3×12", "核心"],
      videoId: "aclHkVaku9U",
      gifStyle: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)",
      emoji: "🏋️",
    },
    {
      id: "pushup",
      name: "俯卧撑",
      desc: "上肢推力训练，可跪姿降低难度",
      tags: ["上肢", "3×10", "胸肌"],
      videoId: "IODxDxX7oi4",
      gifStyle: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
      emoji: "💪",
    },
    {
      id: "plank",
      name: "平板支撑",
      desc: "静态核心稳定，保持身体一条线",
      tags: ["核心", "3×30秒", "静态"],
      videoId: "pSHjTRCQxIw",
      gifStyle: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
      emoji: "🧱",
    },
    {
      id: "jumping",
      name: "开合跳",
      desc: "提升心率，有氧热身经典动作",
      tags: ["有氧", "3×20", "全身"],
      videoId: "iSSAk4XCsRA",
      gifStyle: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
      emoji: "⭐",
    },
    {
      id: "lunge",
      name: "弓步蹲",
      desc: "单腿力量与平衡，注意膝盖方向",
      tags: ["下肢", "3×10", "平衡"],
      videoId: "QOVaHwm-Q6U",
      gifStyle: "linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)",
      emoji: "🦵",
    },
  ];

  const tips = [
    {
      tip: "训练前喝一小杯水，训练后 30 分钟内补充蛋白质更有助于恢复。",
      quote: "「今天练的不是肌肉，是习惯。」",
    },
    {
      tip: "新手建议先掌握动作标准，再逐步增加组数和重量。",
      quote: "「慢，就是快。」",
    },
    {
      tip: "每组之间休息 45–60 秒，感到头晕请立即停止。",
      quote: "「倾听身体，比征服重量更重要。」",
    },
  ];

  const gear = [
    { name: "瑜伽垫", desc: "防滑加厚，居家必备", icon: "🧶" },
    { name: "弹力带", desc: "辅助拉伸与阻力训练", icon: "🎗️" },
    { name: "运动水壶", desc: "及时补水，500ml 起步", icon: "🥤" },
    { name: "跑步鞋", desc: "缓震支撑，保护膝踝", icon: "👟" },
  ];

  const navItems = document.querySelectorAll(".gh-nav-item");
  const panelViews = document.querySelectorAll(".gh-panel-view");
  const exerciseGrid = document.getElementById("exercise-grid");
  const modal = document.getElementById("video-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalTags = document.getElementById("modal-tags");
  const modalIframe = document.getElementById("modal-iframe");
  const pageTitle = document.getElementById("page-title");
  const logForm = document.getElementById("log-form");
  const logList = document.getElementById("log-list");

  const viewTitles = {
    exercises: "新手动作库",
    plan: "运动建议 & 计划",
    log: "运动日志",
    diet: "膳食建议",
    profile: "个人中心",
  };

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getLogs() {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveLogs(logs) {
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  }

  function renderUser() {
    const user = getSession();
    const nameEl = document.getElementById("user-name");
    const metaEl = document.getElementById("user-meta");
    const avatarEl = document.getElementById("user-avatar");
    const profileName = document.getElementById("profile-name");
    const profileHeight = document.getElementById("profile-height");
    const profileWeight = document.getElementById("profile-weight");
    const bmiEl = document.getElementById("profile-bmi");

    if (!user) {
      nameEl.textContent = "未登录";
      metaEl.textContent = "请先登录";
      avatarEl.textContent = "?";
      if (profileName) profileName.textContent = "—";
      if (profileHeight) profileHeight.textContent = "—";
      if (profileWeight) profileWeight.textContent = "—";
      if (bmiEl) bmiEl.textContent = "—";
      return;
    }

    const initial = user.username.charAt(0).toUpperCase();
    nameEl.textContent = user.username;
    metaEl.textContent = user.height + "cm · " + user.weight + "kg";
    avatarEl.textContent = initial;

    if (profileName) profileName.textContent = user.username;
    if (profileHeight) profileHeight.textContent = user.height + " cm";
    if (profileWeight) profileWeight.textContent = user.weight + " kg";

    const h = parseFloat(user.height) / 100;
    const w = parseFloat(user.weight);
    if (h > 0 && w > 0 && bmiEl) {
      bmiEl.textContent = (w / (h * h)).toFixed(1);
    }
  }

  function renderExercises() {
    if (!exerciseGrid) return;
    exerciseGrid.innerHTML = exercises
      .map(function (ex) {
        return (
          '<article class="gh-exercise-card" data-id="' +
          ex.id +
          '" tabindex="0" role="button" aria-label="查看' +
          ex.name +
          '推荐视频">' +
          '<div class="gh-exercise-media" style="background:' +
          ex.gifStyle +
          '">' +
          '<span class="gh-gif-badge">GIF</span>' +
          '<div style="width:100%;height:100%;display:grid;place-items:center;font-size:3rem">' +
          ex.emoji +
          "</div>" +
          "</div>" +
          '<div class="gh-exercise-info"><h3>' +
          ex.name +
          "</h3><p>" +
          ex.desc +
          "</p></div></article>"
        );
      })
      .join("");

    exerciseGrid.querySelectorAll(".gh-exercise-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openVideoModal(card.dataset.id);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openVideoModal(card.dataset.id);
        }
      });
    });
  }

  function openVideoModal(id) {
    const ex = exercises.find(function (item) {
      return item.id === id;
    });
    if (!ex || !modal) return;

    modalTitle.textContent = ex.name + " · 推荐视频";
    modalDesc.textContent = ex.desc;
    modalTags.innerHTML = ex.tags
      .map(function (t) {
        return '<span class="gh-tag">' + t + "</span>";
      })
      .join("");
    modalIframe.src = "https://www.youtube.com/embed/" + ex.videoId + "?rel=0";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeVideoModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalIframe.src = "";
  }

  function switchView(view) {
    navItems.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    panelViews.forEach(function (panel) {
      panel.classList.toggle("active", panel.dataset.view === view);
    });
    if (pageTitle) pageTitle.textContent = viewTitles[view] || "新手锻体区";
  }

  function renderCalendar() {
    const grid = document.getElementById("calendar-grid");
    const monthLabel = document.getElementById("calendar-month");
    if (!grid || !monthLabel) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    monthLabel.textContent = year + "年" + (month + 1) + "月";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    let html = weekdays
      .map(function (d) {
        return '<span class="gh-cal-label">' + d + "</span>";
      })
      .join("");

    for (let i = firstDay - 1; i >= 0; i--) {
      html +=
        '<span class="gh-cal-day other-month">' + (prevDays - i) + "</span>";
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cls = d === today ? "gh-cal-day today" : "gh-cal-day";
      html += '<span class="' + cls + '">' + d + "</span>";
    }
    const totalCells = firstDay + daysInMonth;
    const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainder; i++) {
      html += '<span class="gh-cal-day other-month">' + i + "</span>";
    }

    grid.innerHTML = html;
  }

  function renderWeather() {
    const tempEl = document.getElementById("weather-temp");
    const descEl = document.getElementById("weather-desc");
    const iconEl = document.getElementById("weather-icon");
    if (!tempEl) return;

    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      tempEl.textContent = "24°C";
      descEl.textContent = "晴 · 适合户外运动";
      iconEl.textContent = "☀️";
    } else {
      tempEl.textContent = "18°C";
      descEl.textContent = "多云 · 注意保暖";
      iconEl.textContent = "🌤️";
    }
  }

  function renderTip() {
    const tipEl = document.getElementById("daily-tip");
    const quoteEl = document.getElementById("daily-quote");
    if (!tipEl) return;
    const dayIndex = new Date().getDate() % tips.length;
    tipEl.textContent = tips[dayIndex].tip;
    quoteEl.textContent = tips[dayIndex].quote;
  }

  function renderGear() {
    const list = document.getElementById("gear-list");
    if (!list) return;
    list.innerHTML = gear
      .map(function (item) {
        return (
          '<a href="#" class="gh-gear-item" onclick="return false">' +
          '<div class="gh-gear-thumb">' +
          item.icon +
          "</div>" +
          "<div><strong>" +
          item.name +
          "</strong><span>" +
          item.desc +
          "</span></div></a>"
        );
      })
      .join("");
  }

  function renderLogs() {
    if (!logList) return;
    const logs = getLogs();
    if (!logs.length) {
      logList.innerHTML =
        '<p style="font-size:0.85rem;color:#71717a">暂无记录，完成训练后写一条吧。</p>';
      return;
    }
    logList.innerHTML = logs
      .slice()
      .reverse()
      .map(function (log) {
        return (
          '<div class="gh-log-item"><time>' +
          log.date +
          "</time>" +
          log.content +
          "</div>"
        );
      })
      .join("");
  }

  function initNav() {
    navItems.forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchView(btn.dataset.view);
      });
    });
  }

  function initModal() {
    document
      .getElementById("modal-close")
      .addEventListener("click", closeVideoModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeVideoModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeVideoModal();
    });
  }

  function initLogForm() {
    if (!logForm) return;
    logForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const type = document.getElementById("log-type").value;
      const note = document.getElementById("log-note").value.trim();
      if (!note) return;

      const logs = getLogs();
      logs.push({
        date: new Date().toLocaleString("zh-CN"),
        content: "【" + type + "】" + note,
      });
      saveLogs(logs);
      logForm.reset();
      renderLogs();
    });
  }

  function init() {
    renderUser();
    renderExercises();
    renderCalendar();
    renderWeather();
    renderTip();
    renderGear();
    renderLogs();
    initNav();
    initModal();
    initLogForm();
    switchView("exercises");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
