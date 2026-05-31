(function () {
  const SESSION_KEY = "heikeson_currentUser";
  const ACCOUNT_KEY = "heikeson_accounts";
  const LOG_KEY = "heikeson_workout_logs";

  const exercises = [
    { id: "warmup", name: "热身拉伸", desc: "激活关节，降低受伤风险", tags: ["新手", "5 分钟", "全身"], gifStyle: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)", emoji: "🧘" },
    { id: "squat", name: "深蹲", desc: "锻炼大腿与臀部，基础力量动作", tags: ["下肢", "3×12", "核心"], gifStyle: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)", emoji: "🏋️" },
    { id: "pushup", name: "俯卧撑", desc: "上肢推力训练，可跪姿降低难度", tags: ["上肢", "3×10", "胸肌"], gifStyle: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)", emoji: "💪" },
    { id: "plank", name: "平板支撑", desc: "静态核心稳定，保持身体一条线", tags: ["核心", "3×30秒", "静态"], gifStyle: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)", emoji: "🧱" },
    { id: "jumping", name: "开合跳", desc: "提升心率，有氧热身经典动作", tags: ["有氧", "3×20", "全身"], gifStyle: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)", emoji: "⭐" },
    { id: "lunge", name: "弓步蹲", desc: "单腿力量与平衡，注意膝盖方向", tags: ["下肢", "3×10", "平衡"], gifStyle: "linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)", emoji: "🦵" },
  ];

  const tips = [
    { tip: "训练前喝一小杯水，训练后 30 分钟内补充蛋白质更有助于恢复。", quote: "「今天练的不是肌肉，是习惯。」" },
    { tip: "新手建议先掌握动作标准，再逐步增加组数和重量。", quote: "「慢，就是快。」" },
    { tip: "每组之间休息 45–60 秒，感到头晕请立即停止。", quote: "「倾听身体，比征服重量更重要。」" },
    { tip: "深蹲时膝盖方向应与脚尖一致，避免内扣造成关节压力。", quote: "「细节到位，进步加倍。」" },
    { tip: "平板支撑时收紧核心，别让腰塌下去，脖子保持自然中立。", quote: "「稳定，是一切力量的起点。」" },
    { tip: "俯卧撑做不了标准版？先从跪姿或斜板俯卧撑开始。", quote: "「降低难度不是退缩，是聪明的进阶。」" },
    { tip: "训练日之外保证 7–8 小时睡眠，肌肉在休息时生长。", quote: "「睡够，才能练够。」" },
    { tip: "同一部位肌肉训练后至少休息 48 小时再练第二次。", quote: "「恢复，也是训练的一部分。」" },
    { tip: "热身不只是跑两步，动态拉伸 5 分钟能显著降低受伤风险。", quote: "「准备充分，才能全力以赴。」" },
    { tip: "训练结束后做 5–10 分钟静态拉伸，缓解延迟性肌肉酸痛。", quote: "「拉伸是给明天的自己留余地。」" },
    { tip: "感到某侧明显更弱？可以多做 1–2 组弱侧，逐步平衡左右。", quote: "「对称的身体，更自由的运动。」" },
    { tip: "呼吸节奏：用力时呼气，还原时吸气，不要憋气。", quote: "「会呼吸，才会发力。」" },
    { tip: "居家训练同样有效，关键是规律执行，而不是器械多少。", quote: "「最好的健身房，是你坚持的那一间。」" },
    { tip: "记录训练日志，能帮你看见微小进步，避免盲目加量。", quote: "「看得见的数据，撑得住的动力。」" },
    { tip: "蛋白摄入分散到三餐，比一次性猛吃更利于吸收利用。", quote: "「细水长流，肌肉亦如此。」" },
    { tip: "碳水不是敌人，训练前后适量摄入能提升表现与恢复。", quote: "「吃对饭，才能练到位。」" },
    { tip: "弓步蹲时前膝不要超过脚尖太多，躯干保持微微前倾。", quote: "「姿态正确，比次数更重要。」" },
    { tip: "开合跳适合作为热身收尾，心率上来后再进入力量训练。", quote: "「先唤醒身体，再挑战极限。」" },
    { tip: "如果关节弹响伴随疼痛，请暂停并咨询专业人士。", quote: "「健康训练，永远排第一。」" },
    { tip: "设定每周可完成的小目标，比一次练到虚脱更可持续。", quote: "「Consistency beats intensity. 坚持胜过强度。」" },
    { tip: "训练时穿支撑性好的鞋，光脚或拖鞋容易滑倒或扭伤。", quote: "「装备简单，安全不能省。」" },
    { tip: "感到平台期？尝试变换动作顺序、节奏或组间休息时间。", quote: "「换一条路，也能到达山顶。」" },
    { tip: "训练前 1–2 小时避免大量高脂食物，以免消化负担影响状态。", quote: "「轻装上阵，身体更听使唤。」" },
    { tip: "新手每周 3 次训练足够，不必天天练到力竭。", quote: "「少而精，远胜多而乱。」" },
    { tip: "练完记得放松肩颈，长时间伏案+训练容易导致上背紧张。", quote: "「松下来的地方，力量才进得去。」" },
    { tip: "体重波动 1–2 kg 很正常，别用单日数字否定长期努力。", quote: "「趋势比刻度更值得相信。」" },
    { tip: "把「去训练」变成固定日程，像刷牙一样不需要额外意志力。", quote: "「习惯一旦养成，自律就不再痛苦。」" },
    { tip: "组间可以走动、补水，但别刷手机坐到完全冷下来。", quote: "「休息是为了下一组，不是逃离训练。」" },
    { tip: "核心不只是腹肌，深蹲、硬拉、推举都在考验你的核心稳定。", quote: "「核心强，动作才稳。」" },
    { tip: "今天状态不好？把计划减量 30% 完成，也比完全放弃强。", quote: "「出现，就已经赢了一半。」" },
  ];

  const LAST_TIP_KEY = "heikeson_last_tip_index";

  const gear = [
    { name: "瑜伽垫", desc: "防滑加厚，居家必备", icon: "🧶" },
    { name: "弹力带", desc: "辅助拉伸与阻力训练", icon: "🎗️" },
    { name: "运动水壶", desc: "及时补水，500ml 起步", icon: "🥤" },
    { name: "跑步鞋", desc: "缓震支撑，保护膝踝", icon: "👟" },
    { name: "泡沫轴", desc: "放松筋膜，缓解酸痛", icon: "🛞" },
    { name: "跳绳", desc: "有氧热身，占地小", icon: "➰" },
    { name: "哑铃", desc: "居家力量，从轻开始", icon: "🏋️" },
    { name: "护腕", desc: "推举支撑，保护关节", icon: "🩹" },
    { name: "运动毛巾", desc: "擦汗防滑，保持干爽", icon: "🧻" },
    { name: "健身手套", desc: "握力更稳，减少茧子", icon: "🧤" },
    { name: "运动耳机", desc: "节奏跟练，提升专注", icon: "🎧" },
    { name: "护膝", desc: "深蹲弓步，减轻压力", icon: "🦵" },
  ];

  const GEAR_DISPLAY_COUNT = 4;

  function shuffleArray(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  const navItems = document.querySelectorAll(".gh-nav-item");
  const panelViews = document.querySelectorAll(".gh-panel-view");
  const exerciseGrid = document.getElementById("exercise-grid");
  const modal = document.getElementById("video-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalTags = document.getElementById("modal-tags");
  const modalVideo = document.getElementById("modal-video");
  const pageTitle = document.getElementById("page-title");
  const logForm = document.getElementById("log-form");
  const logList = document.getElementById("log-list");

  const viewTitles = {
    exercises: "新手动作库",
    plan: "运动建议 & 计划",
    log: "运动日志",
    diet: "膳食建议",
    rewards: "成就奖励",
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

  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
  }

  function calcBmi(height, weight) {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h <= 0 || w <= 0) return null;
    return (w / (h * h)).toFixed(1);
  }

  function updateProfile(height, weight) {
    const user = getSession();
    if (!user || !user.username) {
      throw new Error("请先在首页登录");
    }

    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || h < 50 || h > 250) {
      throw new Error("请输入有效的身高（50–250 cm）");
    }
    if (!w || w < 20 || w > 300) {
      throw new Error("请输入有效的体重（20–300 kg）");
    }

    const heightStr = String(h);
    const weightStr = String(w);
    const accounts = getAccounts();
    const account = accounts.find(function (item) {
      return item.username === user.username;
    });
    if (account) {
      account.height = heightStr;
      account.weight = weightStr;
      saveAccounts(accounts);
    }

    const updated = {
      username: user.username,
      height: heightStr,
      weight: weightStr,
    };
    saveSession(updated);
    return updated;
  }

  function showProfileMessage(text, type) {
    const messageEl = document.getElementById("profile-message");
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.hidden = !text;
    messageEl.className =
      "gh-profile-message" + (type ? " gh-profile-message--" + type : "");
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
    const profileHeightInput = document.getElementById("profile-height-input");
    const profileWeightInput = document.getElementById("profile-weight-input");
    const profileSaveBtn = document.getElementById("profile-save-btn");
    const profileHint = document.getElementById("profile-hint");
    const bmiEl = document.getElementById("profile-bmi");

    if (!user) {
      nameEl.textContent = "未登录";
      metaEl.textContent = "请先登录";
      avatarEl.textContent = "?";
      if (profileName) profileName.textContent = "—";
      if (profileHeightInput) {
        profileHeightInput.value = "";
        profileHeightInput.disabled = true;
      }
      if (profileWeightInput) {
        profileWeightInput.value = "";
        profileWeightInput.disabled = true;
      }
      if (profileSaveBtn) profileSaveBtn.disabled = true;
      if (profileHint) profileHint.hidden = false;
      if (bmiEl) bmiEl.textContent = "—";
      return;
    }

    const initial = user.username.charAt(0).toUpperCase();
    nameEl.textContent = user.username;
    metaEl.textContent = user.height + "cm · " + user.weight + "kg";
    avatarEl.textContent = initial;

    if (profileName) profileName.textContent = user.username;
    if (profileHeightInput) {
      profileHeightInput.value = user.height;
      profileHeightInput.disabled = false;
    }
    if (profileWeightInput) {
      profileWeightInput.value = user.weight;
      profileWeightInput.disabled = false;
    }
    if (profileSaveBtn) profileSaveBtn.disabled = false;
    if (profileHint) profileHint.hidden = true;

    const bmi = calcBmi(user.height, user.weight);
    if (bmiEl) bmiEl.textContent = bmi || "—";
  }

  function renderExercises() {
    if (!exerciseGrid) return;
    exerciseGrid.innerHTML = exercises
      .map(function (ex, idx) {
        // 使用数字命名视频 files: videos/1.mp4 ... videos/6.mp4
        const fileIndex = idx + 1;
        return (
          '<article class="gh-exercise-card" data-id="' +
          ex.id +
          '" tabindex="0" role="button" aria-label="查看' +
          ex.name +
          '推荐视频">' +
          '<div class="gh-exercise-media" style="background:' +
          ex.gifStyle +
          '">' +
          '<span class="gh-gif-badge">VID</span>' +
          '<video class="gh-exercise-gif" src="videos/' + fileIndex + '.mp4" loop muted playsinline preload="metadata" style="display:none"></video>' +
          '<div class="gh-ex-emoji" style="width:100%;height:100%;display:grid;place-items:center;font-size:3rem">' +
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

    // 事件绑定
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

    // 本地视频就绪与错误处理：可播放时显示视频，加载失败显示 emoji 回退
    exerciseGrid.querySelectorAll(".gh-exercise-media").forEach(function (media) {
      var video = media.querySelector("video");
      var emoji = media.querySelector(".gh-ex-emoji");
      if (!video) return;
      video.addEventListener("canplay", function () {
        video.style.display = "block";
        if (emoji) emoji.style.display = "none";
        try { video.play(); } catch (_) {}
      });
      video.addEventListener("error", function () {
        video.style.display = "none";
        if (emoji) emoji.style.display = "grid";
      });
      if (video.readyState >= 3) {
        video.style.display = "block";
        if (emoji) emoji.style.display = "none";
      }
    });
  }

  function openVideoModal(id) {
    const idx = exercises.findIndex(function (item) {
      return item.id === id;
    });
    if (idx === -1 || !modal) return;

    const ex = exercises[idx];
    const fileIndex = idx + 1; // 视频文件按 1..6 命名

    modalTitle.textContent = ex.name + " · 推荐视频";
    modalDesc.textContent = ex.desc;
    modalTags.innerHTML = ex.tags
      .map(function (t) {
        return '<span class="gh-tag">' + t + "</span>";
      })
      .join("");

    if (window.HeikesonRewards) {
      var result = HeikesonRewards.trackExerciseView(ex.id);
      HeikesonRewards.notifyNewBadges(result);
      renderRailStreak();
    }

    if (modalVideo) {
      modalVideo.src = "videos/" + fileIndex + ".mp4";
      modalVideo.loop = true;
      modalVideo.muted = true; // 为了保证浏览器允许 autoplay
      // 显示 modal 再播放
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      // 尝试播放（部分浏览器需要用户交互才能有声播放）
      modalVideo.play().catch(function (_) {});
    } else {
      // 保持回退行为，如果 modalVideo 不存在，可扩展
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    }

    if (window.HeikesonPoseTracker) {
      HeikesonPoseTracker.mount(document.getElementById("modal-pose-root"));
    }
  }

  function closeVideoModal() {
    if (!modal) return;
    if (window.HeikesonPoseTracker) {
      HeikesonPoseTracker.unmount();
    }
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (modalVideo) {
      try {
        modalVideo.pause();
      } catch (_) {}
      modalVideo.removeAttribute('src');
      modalVideo.load();
    }
  }

  function switchView(view) {
    navItems.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    panelViews.forEach(function (panel) {
      panel.classList.toggle("active", panel.dataset.view === view);
    });
    if (pageTitle) pageTitle.textContent = viewTitles[view] || "新手锻体区";
    if (view === "rewards" && typeof renderRewards === "function") renderRewards();
    if (view === "diet" && typeof updateDietCheckinStatus === "function") updateDietCheckinStatus();
    if (view === "plan" && typeof updatePlanButtons === "function") updatePlanButtons();
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
      html += '<span class="gh-cal-day other-month">' + (prevDays - i) + "</span>";
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

    let lastIndex = -1;
    try {
      const stored = sessionStorage.getItem(LAST_TIP_KEY);
      if (stored !== null) lastIndex = parseInt(stored, 10);
    } catch (_) {}

    let index = 0;
    if (tips.length === 1) {
      index = 0;
    } else {
      do {
        index = Math.floor(Math.random() * tips.length);
      } while (index === lastIndex);
    }

    try {
      sessionStorage.setItem(LAST_TIP_KEY, String(index));
    } catch (_) {}

    tipEl.textContent = tips[index].tip;
    quoteEl.textContent = tips[index].quote;
  }

  function renderGear() {
    const list = document.getElementById("gear-list");
    if (!list) return;
    const count = Math.min(GEAR_DISPLAY_COUNT, gear.length);
    const picked = shuffleArray(gear).slice(0, count);
    list.innerHTML = picked
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

  function renderRailStreak() {
    if (!window.HeikesonRewards) return;
    var summary = HeikesonRewards.getSummary();
    var streakEl = document.getElementById("rail-streak");
    var metaEl = document.getElementById("rail-streak-meta");
    if (streakEl) streakEl.textContent = String(summary.streak);
    if (metaEl) {
      metaEl.textContent =
        summary.longestStreak > 0
          ? "最长连续 " + summary.longestStreak + " 天 · 徽章 " + summary.badgeCount + " 枚"
          : "签到与训练均可累计";
    }
  }

  function renderRewards() {
    if (!window.HeikesonRewards) return;
    var R = HeikesonRewards;
    var summary = R.getSummary();
    var summaryEl = document.getElementById("reward-summary");
    var fragmentEl = document.getElementById("fragment-grid");
    var badgeEl = document.getElementById("badge-grid");
    var synthEl = document.getElementById("synth-list");
    var checkinStatus = document.getElementById("daily-checkin-status");

    if (summaryEl) {
      summaryEl.innerHTML =
        '<div class="gh-reward-stat"><span>连续打卡</span><strong>' +
        summary.streak +
        "</strong></div>" +
        '<div class="gh-reward-stat"><span>最长记录</span><strong>' +
        summary.longestStreak +
        "</strong></div>" +
        '<div class="gh-reward-stat"><span>解锁徽章</span><strong>' +
        summary.badgeCount +
        "</strong></div>" +
        '<div class="gh-reward-stat"><span>合成徽章</span><strong>' +
        summary.synthCount +
        "</strong></div>";
    }

    if (fragmentEl) {
      var fKeys = Object.keys(R.FRAGMENTS);
      fragmentEl.innerHTML = fKeys
        .map(function (key) {
          var f = R.FRAGMENTS[key];
          var count = summary.fragments[key] || 0;
          return (
            '<div class="gh-fragment-item' +
            (count ? "" : " empty") +
            '">' +
            '<span class="gh-fragment-icon">' +
            f.icon +
            "</span>" +
            '<span class="gh-fragment-name">' +
            f.name +
            "</span>" +
            '<span class="gh-fragment-count">×' +
            count +
            "</span></div>"
          );
        })
        .join("");
    }

    if (badgeEl) {
      var bKeys = Object.keys(R.BADGES);
      badgeEl.innerHTML = bKeys
        .map(function (id) {
          var b = R.BADGES[id];
          var unlocked = summary.badges.indexOf(id) !== -1;
          return (
            '<div class="gh-badge-item' +
            (unlocked ? "" : " locked") +
            '">' +
            '<span class="gh-badge-icon">' +
            b.icon +
            "</span>" +
            '<span class="gh-badge-name">' +
            b.name +
            "</span>" +
            '<span class="gh-badge-desc">' +
            b.desc +
            "</span>" +
            '<span class="gh-badge-cat">' +
            b.category +
            "</span></div>"
          );
        })
        .join("");

      summary.synthesized.forEach(function (sid) {
        var s = R.SYNTHESIS[sid];
        if (!s) return;
        badgeEl.innerHTML +=
          '<div class="gh-badge-item">' +
          '<span class="gh-badge-icon">' +
          s.icon +
          "</span>" +
          '<span class="gh-badge-name">' +
          s.name +
          "</span>" +
          '<span class="gh-badge-desc">' +
          s.desc +
          '</span><span class="gh-badge-cat">合成</span></div>';
      });
    }

    if (synthEl) {
      var data = R.getUserData();
      synthEl.innerHTML = Object.keys(R.SYNTHESIS)
        .map(function (id) {
          var recipe = R.SYNTHESIS[id];
          var done = summary.synthesized.indexOf(id) !== -1;
          var check = R.canSynthesize(data, id);
          var costHtml = Object.keys(recipe.cost)
            .map(function (k) {
              var need = recipe.cost[k];
              var have = summary.fragments[k] || 0;
              return (
                '<span class="' +
                (have >= need ? "" : "lack") +
                '">' +
                R.FRAGMENTS[k].icon +
                " " +
                have +
                "/" +
                need +
                "</span>"
              );
            })
            .join("");
          if (recipe.requires) {
            recipe.requires.forEach(function (req) {
              var reqDone = summary.synthesized.indexOf(req) !== -1;
              costHtml +=
                '<span class="' +
                (reqDone ? "" : "lack") +
                '">需「' +
                R.SYNTHESIS[req].name +
                "」</span>";
            });
          }
          return (
            '<div class="gh-synth-card' +
            (done ? " done" : "") +
            '">' +
            '<span class="gh-synth-icon">' +
            recipe.icon +
            "</span>" +
            '<div class="gh-synth-body"><strong>' +
            recipe.name +
            "</strong><p>" +
            recipe.desc +
            '</p><div class="gh-synth-cost">' +
            costHtml +
            "</div></div>" +
            (done
              ? '<span class="gh-plan-done-btn done">已合成</span>'
              : '<button type="button" class="gh-btn gh-synth-btn" data-synth="' +
                id +
                '" ' +
                (check.ok ? "" : "disabled") +
                ">合成</button>") +
            "</div>"
          );
        })
        .join("");

      synthEl.querySelectorAll(".gh-synth-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var result = R.synthesize(btn.dataset.synth);
          if (result.ok) {
            R.showToast("✨ 合成成功：「" + result.recipe.name + "」", "success");
            renderRewards();
            renderRailStreak();
          } else {
            R.showToast(result.reason || "合成失败", "error");
          }
        });
      });
    }

    if (checkinStatus) {
      var today = new Date();
      var todayStr =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
      var data2 = R.getUserData();
      var checked = data2.checkInDates.indexOf(todayStr) !== -1;
      checkinStatus.textContent = checked
        ? "今日已签到，当前连续 " + summary.streak + " 天"
        : "点击上方按钮完成今日签到，连续打卡可解锁坚持类徽章";
    }

    renderRailStreak();
  }

  function updateDietCheckinStatus() {
    if (!window.HeikesonRewards) return;
    var el = document.getElementById("diet-checkin-status");
    var btn = document.getElementById("diet-checkin-btn");
    if (!el) return;
    var today = new Date();
    var todayStr =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    var data = HeikesonRewards.getUserData();
    var done = data.stats.dietCheckins.indexOf(todayStr) !== -1;
    el.textContent = done
      ? "今日已打卡 · 累计 " + data.stats.dietCheckins.length + " 天"
      : "今日尚未打卡";
    if (btn) {
      btn.disabled = done;
      btn.textContent = done ? "今日已打卡" : "今日饮食打卡";
    }
  }

  function updatePlanButtons() {
    if (!window.HeikesonRewards) return;
    var data = HeikesonRewards.getUserData();
    document.querySelectorAll(".gh-plan-done-btn").forEach(function (btn) {
      var day = btn.dataset.planDay;
      var done = data.stats.planDaysCompleted.indexOf(day) !== -1;
      btn.classList.toggle("done", done);
      btn.textContent = done ? "已完成 ✓" : "完成今日";
      btn.disabled = done;
    });
  }

  function initRewards() {
    if (!window.HeikesonRewards) return;
    var R = HeikesonRewards;

    var checkinBtn = document.getElementById("daily-checkin-btn");
    if (checkinBtn) {
      checkinBtn.addEventListener("click", function () {
        var result = R.dailyCheckIn();
        R.notifyNewBadges(result);
        if (result.newFragments && result.newFragments.length) {
          R.showToast("📅 签到成功，获得坚持碎片", "success");
        } else {
          R.showToast("今日已签到过啦", "success");
        }
        renderRewards();
      });
    }

    var dietBtn = document.getElementById("diet-checkin-btn");
    if (dietBtn) {
      dietBtn.addEventListener("click", function () {
        var result = R.trackDietCheckin();
        R.notifyNewBadges(result);
        R.showToast("🥗 饮食打卡成功", "success");
        updateDietCheckinStatus();
        renderRailStreak();
      });
    }

    document.querySelectorAll(".gh-plan-done-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        var result = R.trackPlanDay(btn.dataset.planDay);
        R.notifyNewBadges(result);
        R.showToast("✅ 计划日完成，获得力量碎片", "success");
        updatePlanButtons();
        renderRailStreak();
      });
    });

    renderRailStreak();
    updateDietCheckinStatus();
    updatePlanButtons();
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
    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeVideoModal);
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeVideoModal();
      });
    }
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
      if (window.HeikesonRewards) {
        var result = HeikesonRewards.trackWorkoutLog(type);
        HeikesonRewards.notifyNewBadges(result);
        HeikesonRewards.showToast("训练日志已保存，获得对应碎片", "success");
        renderRailStreak();
      }
    });
  }

  function initProfileForm() {
    const profileForm = document.getElementById("profile-form");
    if (!profileForm) return;

    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showProfileMessage("");
      const height = document.getElementById("profile-height-input").value;
      const weight = document.getElementById("profile-weight-input").value;
      try {
        updateProfile(height, weight);
        showProfileMessage("身体数据已保存", "success");
        renderUser();
      } catch (err) {
        showProfileMessage(err.message, "error");
      }
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
    initProfileForm();
    initRewards();
    switchView("exercises");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
