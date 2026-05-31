(function (global) {
  "use strict";

  var SESSION_KEY = "heikeson_currentUser";
  var REWARDS_KEY = "heikeson_rewards";

  var FRAGMENTS = {
    power: { name: "力量碎片", icon: "💪", desc: "完成力量训练日志" },
    cardio: { name: "有氧碎片", icon: "🔥", desc: "完成有氧训练日志" },
    stretch: { name: "恢复碎片", icon: "🧘", desc: "完成拉伸恢复日志" },
    diet: { name: "膳食碎片", icon: "🥗", desc: "饮食健康打卡" },
    streak: { name: "坚持碎片", icon: "📅", desc: "连续打卡奖励" },
    xiexiu: { name: "邪修碎片", icon: "⚡", desc: "完成邪修部位训练" },
  };

  var BADGES = {
    first_log: { name: "初出茅庐", icon: "📝", desc: "首次记录训练日志", category: "训练" },
    log_10: { name: "勤练不辍", icon: "📒", desc: "累计记录 10 条训练日志", category: "训练" },
    log_30: { name: "日志达人", icon: "📚", desc: "累计记录 30 条训练日志", category: "训练" },
    power_5: { name: "力拔山河", icon: "🏋️", desc: "完成 5 次力量训练", category: "训练" },
    cardio_5: { name: "燃脂先锋", icon: "🏃", desc: "完成 5 次有氧训练", category: "训练" },
    exercise_all: { name: "动作通览", icon: "👀", desc: "查看全部 6 个新手动作", category: "训练" },
    streak_3: { name: "三日之约", icon: "🌱", desc: "连续打卡 3 天", category: "坚持" },
    streak_7: { name: "一周恒心", icon: "🌿", desc: "连续打卡 7 天", category: "坚持" },
    streak_14: { name: "双周修行", icon: "🌳", desc: "连续打卡 14 天", category: "坚持" },
    streak_30: { name: "月度黑鸭", icon: "🦆", desc: "连续打卡 30 天", category: "坚持" },
    diet_first: { name: "均衡起步", icon: "🍳", desc: "首次饮食健康打卡", category: "饮食" },
    diet_7: { name: "七日食养", icon: "🥑", desc: "累计 7 天饮食打卡", category: "饮食" },
    plan_week: { name: "计划执行者", icon: "✅", desc: "完成新手周计划 3 天", category: "项目" },
    xiexiu_3: { name: "邪修入门", icon: "🌑", desc: "完成 3 个邪修部位", category: "邪修" },
    xiexiu_all: { name: "全部位邪修", icon: "☯️", desc: "完成全部 7 个邪修部位", category: "邪修" },
  };

  var SYNTHESIS = {
    duck_bronze: {
      name: "黑鸭铜章",
      icon: "🥉",
      desc: "力量与有氧的初步融合",
      cost: { power: 3, cardio: 2 },
    },
    duck_silver: {
      name: "黑鸭银章",
      icon: "🥈",
      desc: "恢复、膳食与坚持的平衡之道",
      cost: { stretch: 3, diet: 3, streak: 2 },
    },
    duck_gold: {
      name: "黑鸭金章",
      icon: "🥇",
      desc: "铜章银章合一，黑鸭巅峰象征",
      requires: ["duck_bronze", "duck_silver"],
      cost: { power: 5, xiexiu: 3 },
    },
    xiexiu_master: {
      name: "邪修宗师",
      icon: "🔮",
      desc: "七部位邪修与恒心的极致",
      cost: { xiexiu: 7, streak: 3 },
    },
  };

  function formatDate(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function todayKey() {
    return formatDate(new Date());
  }

  function calcStreak(dates) {
    if (!dates.length) return 0;
    var set = {};
    dates.forEach(function (d) {
      set[d] = true;
    });
    var streak = 0;
    var cursor = new Date();
    if (!set[todayKey()]) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (set[formatDate(cursor)]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function getUserKey() {
    var user = getSession();
    return user && user.username ? user.username : "_guest";
  }

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(REWARDS_KEY)) || {};
    } catch (_) {
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(data));
  }

  function defaultUserData() {
    return {
      streak: 0,
      longestStreak: 0,
      lastCheckIn: "",
      checkInDates: [],
      stats: {
        totalLogs: 0,
        logTypes: { 力量: 0, 有氧: 0, 拉伸: 0 },
        exercisesViewed: [],
        dietCheckins: [],
        planDaysCompleted: [],
        xiexiuParts: [],
      },
      fragments: {},
      badges: [],
      synthesized: [],
    };
  }

  function getUserData() {
    var all = loadAll();
    var key = getUserKey();
    if (!all[key]) all[key] = defaultUserData();
    return all[key];
  }

  function persistUserData(data) {
    var all = loadAll();
    all[getUserKey()] = data;
    saveAll(all);
  }

  function addFragment(data, type, amount) {
    if (!FRAGMENTS[type]) return;
    data.fragments[type] = (data.fragments[type] || 0) + (amount || 1);
  }

  function hasBadge(data, id) {
    return data.badges.indexOf(id) !== -1;
  }

  function unlockBadge(data, id) {
    if (!BADGES[id] || hasBadge(data, id)) return null;
    data.badges.push(id);
    return BADGES[id];
  }

  function evaluateBadges(data) {
    var unlocked = [];
    var s = data.stats;

    if (s.totalLogs >= 1) {
      var b = unlockBadge(data, "first_log");
      if (b) unlocked.push({ id: "first_log", badge: b });
    }
    if (s.totalLogs >= 10) {
      var b10 = unlockBadge(data, "log_10");
      if (b10) unlocked.push({ id: "log_10", badge: b10 });
    }
    if (s.totalLogs >= 30) {
      var b30 = unlockBadge(data, "log_30");
      if (b30) unlocked.push({ id: "log_30", badge: b30 });
    }
    if (s.logTypes["力量"] >= 5) {
      var bp = unlockBadge(data, "power_5");
      if (bp) unlocked.push({ id: "power_5", badge: bp });
    }
    if (s.logTypes["有氧"] >= 5) {
      var bc = unlockBadge(data, "cardio_5");
      if (bc) unlocked.push({ id: "cardio_5", badge: bc });
    }
    if (s.exercisesViewed.length >= 6) {
      var be = unlockBadge(data, "exercise_all");
      if (be) unlocked.push({ id: "exercise_all", badge: be });
    }
    if (data.streak >= 3) {
      var bs3 = unlockBadge(data, "streak_3");
      if (bs3) unlocked.push({ id: "streak_3", badge: bs3 });
    }
    if (data.streak >= 7) {
      var bs7 = unlockBadge(data, "streak_7");
      if (bs7) unlocked.push({ id: "streak_7", badge: bs7 });
    }
    if (data.streak >= 14) {
      var bs14 = unlockBadge(data, "streak_14");
      if (bs14) unlocked.push({ id: "streak_14", badge: bs14 });
    }
    if (data.streak >= 30) {
      var bs30 = unlockBadge(data, "streak_30");
      if (bs30) unlocked.push({ id: "streak_30", badge: bs30 });
    }
    if (s.dietCheckins.length >= 1) {
      var bd1 = unlockBadge(data, "diet_first");
      if (bd1) unlocked.push({ id: "diet_first", badge: bd1 });
    }
    if (s.dietCheckins.length >= 7) {
      var bd7 = unlockBadge(data, "diet_7");
      if (bd7) unlocked.push({ id: "diet_7", badge: bd7 });
    }
    if (s.planDaysCompleted.length >= 3) {
      var bpl = unlockBadge(data, "plan_week");
      if (bpl) unlocked.push({ id: "plan_week", badge: bpl });
    }
    if (s.xiexiuParts.length >= 3) {
      var bx3 = unlockBadge(data, "xiexiu_3");
      if (bx3) unlocked.push({ id: "xiexiu_3", badge: bx3 });
    }
    if (s.xiexiuParts.length >= 7) {
      var bx7 = unlockBadge(data, "xiexiu_all");
      if (bx7) unlocked.push({ id: "xiexiu_all", badge: bx7 });
    }

    return unlocked;
  }

  function dailyCheckIn() {
    var data = getUserData();
    var today = todayKey();
    var newly = [];

    if (data.checkInDates.indexOf(today) === -1) {
      data.checkInDates.push(today);
      data.lastCheckIn = today;
      addFragment(data, "streak", 1);
      newly.push({ type: "fragment", id: "streak", amount: 1 });
    }

    data.streak = calcStreak(data.checkInDates);
    if (data.streak > data.longestStreak) data.longestStreak = data.streak;

    var badges = evaluateBadges(data);
    persistUserData(data);
    return { data: data, newBadges: badges, newFragments: newly, alreadyChecked: data.lastCheckIn === today && newly.length === 0 };
  }

  function trackWorkoutLog(type) {
    var data = getUserData();
    data.stats.totalLogs++;
    if (data.stats.logTypes[type] !== undefined) {
      data.stats.logTypes[type]++;
    }

    if (type === "力量") addFragment(data, "power", 1);
    else if (type === "有氧") addFragment(data, "cardio", 1);
    else if (type === "拉伸") addFragment(data, "stretch", 1);

    dailyCheckInInternal(data);
    var badges = evaluateBadges(data);
    persistUserData(data);
    return { data: data, newBadges: badges };
  }

  function dailyCheckInInternal(data) {
    var today = todayKey();
    if (data.checkInDates.indexOf(today) === -1) {
      data.checkInDates.push(today);
      data.lastCheckIn = today;
      addFragment(data, "streak", 1);
    }
    data.streak = calcStreak(data.checkInDates);
    if (data.streak > data.longestStreak) data.longestStreak = data.streak;
  }

  function trackExerciseView(exerciseId) {
    var data = getUserData();
    if (data.stats.exercisesViewed.indexOf(exerciseId) === -1) {
      data.stats.exercisesViewed.push(exerciseId);
    }
    var badges = evaluateBadges(data);
    persistUserData(data);
    return { data: data, newBadges: badges };
  }

  function trackDietCheckin() {
    var data = getUserData();
    var today = todayKey();
    if (data.stats.dietCheckins.indexOf(today) === -1) {
      data.stats.dietCheckins.push(today);
      addFragment(data, "diet", 1);
    }
    dailyCheckInInternal(data);
    var badges = evaluateBadges(data);
    persistUserData(data);
    return { data: data, newBadges: badges };
  }

  function trackPlanDay(dayId) {
    var data = getUserData();
    if (data.stats.planDaysCompleted.indexOf(dayId) === -1) {
      data.stats.planDaysCompleted.push(dayId);
      addFragment(data, "power", 1);
    }
    dailyCheckInInternal(data);
    var badges = evaluateBadges(data);
    persistUserData(data);
    return { data: data, newBadges: badges };
  }

  function trackXiexiuPart(partId) {
    var data = getUserData();
    if (data.stats.xiexiuParts.indexOf(partId) === -1) {
      data.stats.xiexiuParts.push(partId);
      addFragment(data, "xiexiu", 1);
    }
    dailyCheckInInternal(data);
    var badges = evaluateBadges(data);
    persistUserData(data);
    return { data: data, newBadges: badges };
  }

  function canSynthesize(data, recipeId) {
    var recipe = SYNTHESIS[recipeId];
    if (!recipe) return { ok: false, reason: "未知配方" };
    if (data.synthesized.indexOf(recipeId) !== -1) return { ok: false, reason: "已合成过该徽章" };

    if (recipe.requires) {
      for (var i = 0; i < recipe.requires.length; i++) {
        if (data.synthesized.indexOf(recipe.requires[i]) === -1) {
          return { ok: false, reason: "需先合成「" + SYNTHESIS[recipe.requires[i]].name + "」" };
        }
      }
    }

    var keys = Object.keys(recipe.cost);
    for (var j = 0; j < keys.length; j++) {
      var k = keys[j];
      if ((data.fragments[k] || 0) < recipe.cost[k]) {
        return { ok: false, reason: "「" + FRAGMENTS[k].name + "」不足" };
      }
    }
    return { ok: true };
  }

  function synthesize(recipeId) {
    var data = getUserData();
    var check = canSynthesize(data, recipeId);
    if (!check.ok) return { ok: false, reason: check.reason };

    var recipe = SYNTHESIS[recipeId];
    var keys = Object.keys(recipe.cost);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      data.fragments[k] -= recipe.cost[k];
      if (data.fragments[k] <= 0) delete data.fragments[k];
    }
    data.synthesized.push(recipeId);
    persistUserData(data);
    return { ok: true, recipe: recipe, data: data };
  }

  function getSummary() {
    var data = getUserData();
    return {
      streak: data.streak,
      longestStreak: data.longestStreak,
      badgeCount: data.badges.length,
      synthCount: data.synthesized.length,
      fragments: data.fragments,
      badges: data.badges,
      synthesized: data.synthesized,
      stats: data.stats,
    };
  }

  function showToast(message, type) {
    if (!document.getElementById("hks-reward-toast-style")) {
      var style = document.createElement("style");
      style.id = "hks-reward-toast-style";
      style.textContent =
        ".hks-reward-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(12px);z-index:9999;padding:12px 20px;border-radius:999px;background:#18181b;color:#fff;font-size:0.875rem;font-weight:500;box-shadow:0 12px 40px rgba(0,0,0,0.25);opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;max-width:min(90vw,420px);text-align:center;font-family:Inter,sans-serif}" +
        ".hks-reward-toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}" +
        ".hks-reward-toast--badge{background:linear-gradient(135deg,#1e1b4b,#312e81)}" +
        ".hks-reward-toast--success{background:linear-gradient(135deg,#14532d,#166534)}";
      document.head.appendChild(style);
    }

    var existing = document.getElementById("hks-reward-toast");
    if (existing) existing.remove();

    var el = document.createElement("div");
    el.id = "hks-reward-toast";
    el.className = "hks-reward-toast" + (type ? " hks-reward-toast--" + type : "");
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("visible");
    });
    setTimeout(function () {
      el.classList.remove("visible");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 3200);
  }

  function notifyNewBadges(result) {
    if (!result || !result.newBadges || !result.newBadges.length) return;
    result.newBadges.forEach(function (item) {
      showToast("🎉 解锁徽章：「" + item.badge.name + "」", "badge");
    });
  }

  global.HeikesonRewards = {
    FRAGMENTS: FRAGMENTS,
    BADGES: BADGES,
    SYNTHESIS: SYNTHESIS,
    getSession: getSession,
    getUserData: getUserData,
    getSummary: getSummary,
    dailyCheckIn: dailyCheckIn,
    trackWorkoutLog: trackWorkoutLog,
    trackExerciseView: trackExerciseView,
    trackDietCheckin: trackDietCheckin,
    trackPlanDay: trackPlanDay,
    trackXiexiuPart: trackXiexiuPart,
    canSynthesize: canSynthesize,
    synthesize: synthesize,
    showToast: showToast,
    notifyNewBadges: notifyNewBadges,
  };
})(window);
