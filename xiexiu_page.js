(function () {
  const SESSION_KEY = "heikeson_currentUser";
  const VIDEO_COUNT = 6;

  const parts = [
    {
      id: "biceps",
      name: "肱二头肌",
      bilibiliUrl: "https://www.bilibili.com/video/BV1Ly4y1e7vU",
      summary: "以肘屈为主的高频刺激，侧重峰值收缩与离心控制，适合短期提升手臂围度。",
      plan: "4 组 × 8–10 次 · 组间休息 60 秒 · 最后 1 组递减至力竭（降 20% 重量再做 6–8 次）",
      moves: ["杠铃弯举", "哑铃锤式弯举", "集中弯举"],
      points: [
        "大臂贴紧躯干，禁止甩动借力",
        "顶峰收缩停顿 1 秒，下放 2–3 秒",
        "选用能标准完成 8–10 次的重量",
      ],
      science:
        "肱二头肌为单关节肌，高张力下的 time under tension 与接近力竭的代谢压力，可促进肌蛋白合成；研究支持 6–12 次重复范围对 hypertrophy 有效。",
    },
    {
      id: "triceps",
      name: "肱三头肌",
      bilibiliUrl: "https://www.bilibili.com/video/BV1bo9XBYEkt",
      summary: "三头占上臂体积约 2/3，推举与臂屈伸组合可快速拉高手臂视觉维度。",
      plan: "4 组 × 10–12 次 · 组间休息 45–60 秒 · 超级组：窄距俯卧撑 + 凳上臂屈伸各 1 组",
      moves: ["窄距俯卧撑", "哑铃过头臂屈伸", "绳索下压"],
      points: [
        "肘部固定，仅前臂带动",
        "下压/推起时呼气，避免肘外展",
        "手腕保持中立，减轻关节压力",
      ],
      science:
        "肱三头肌长头在过头位拉伸更长，结合多关节推类动作可同步提升推力；EMG 研究显示窄握推举与臂屈伸对三头激活均较高。",
    },
    {
      id: "chest",
      name: "胸肌",
      bilibiliUrl: "https://www.bilibili.com/video/BV1JEkQBnEyR",
      summary: "水平推与上斜推结合，强调全幅度与肩胛稳定，提升胸大肌厚度与分离度。",
      plan: "5 组 × 6–10 次 · 组间休息 90 秒 · 上斜 + 水平各 2 个主项，收尾 1 组飞鸟",
      moves: ["上斜哑铃卧推", "标准俯卧撑/杠铃卧推", "哑铃飞鸟"],
      points: [
        "肩胛后缩下沉，全程贴凳/地面",
        "杠铃/哑铃轨迹略呈弧线，触胸/触地后推起",
        "感受胸肌发力，减少三角肌前束代偿",
      ],
      science:
        "胸大肌 clavicular 与 sternal 头在不同角度负荷不同；系统综述表明每周 10–20 组、6–12 RM 对胸肌 hypertrophy 有明确剂量反应。",
    },
    {
      id: "back",
      name: "背部",
      bilibiliUrl: "https://www.bilibili.com/video/BV1cpiDBTEUo",
      summary: "垂直拉 + 水平拉双模式，优先背阔肌宽度与厚度，兼顾后束与中下斜方肌。",
      plan: "4 组 × 8–12 次 · 组间休息 75 秒 · 先拉后划，各 2 个动作 · 最后 1 组暂停拉",
      moves: ["引体向上/高位下拉", "单臂哑铃划船", "直臂下压"],
      points: [
        "拉向胸口/髋部时先动肩胛，再动肘",
        "顶峰挤压背肌 1 秒，避免纯胳膊拉",
        "核心收紧，防止腰椎过度反弓",
      ],
      science:
        "背阔肌在肩内收、伸、水平外展时均参与；训练量与 progressive overload 是背肌增厚的核心变量，引体与划船 EMG 激活均处于高位。",
    },
    {
      id: "shoulders",
      name: "肩部",
      bilibiliUrl: "https://www.bilibili.com/video/BV1GPYXzTEvm",
      summary: "三角肌前/中/后束分项刺激，侧平举与推举配合，打造立体肩型。",
      plan: "各束 3 组 × 12–15 次 · 组间休息 45 秒 · 推举 1 项 + 侧平举 + 反向飞鸟",
      moves: ["哑铃推举", "侧平举", "俯身反向飞鸟"],
      points: [
        "侧平举时小指略高，至肩高即可",
        "推举时核心稳定，不过度拱背",
        "后束训练平衡前束，降低圆肩风险",
      ],
      science:
        "三角肌三束功能不同，分角度训练可均衡发育；中等重量高次数对中束代谢压力较好，推举类动作对整体肩量贡献最大。",
    },
    {
      id: "abs",
      name: "腹肌",
      bilibiliUrl: "https://www.bilibili.com/video/BV12QQsBLExF",
      summary: "抗伸展 + 卷腹类组合，强调腹直肌与腹斜肌协调，配合呼吸与核心张力。",
      plan: "3 轮循环 · 每动作 30–45 秒 · 轮间休息 30 秒 · 平板支撑 + 卷腹 + 死虫",
      moves: ["平板支撑", "卷腹/反向卷腹", "死虫式"],
      points: [
        "卷腹时肋骨下沉，避免拉脖子",
        "平板支撑：腹臀收紧，不塌腰不撅臀",
        "配合腹式呼吸，发力时呼气",
      ],
      science:
        "腹直肌在脊柱屈曲时激活最高；核心稳定性训练（如平板、死虫）可提升腹压与腰椎保护，与孤立卷腹互补。",
    },
    {
      id: "thighs",
      name: "大腿",
      bilibiliUrl: "https://www.bilibili.com/video/BV1N4qhBdEXY",
      summary: "股四头肌 + 腘绳肌双模式，深蹲与硬拉变式为主，下肢力量与围度同步提升。",
      plan: "4 组 × 8–12 次 · 组间休息 90–120 秒 · 深蹲/弓步 + 罗马尼亚硬拉 · 末组慢速离心",
      moves: ["杠铃/哑铃深蹲", "保加利亚分腿蹲", "罗马尼亚硬拉"],
      points: [
        "深蹲时膝与脚尖同向，蹲至平行或略低",
        "硬拉时杠铃贴腿，髋主导后坐",
        "落地/还原时控制速度，保护膝踝",
      ],
      science:
        "股四头肌在 knee extension、腘绳肌在 hip extension 中为主动肌；复合下肢动作 hormonal 与 mechanical tension 响应强，是增肌效率最高的部位训练之一。",
    },
  ];

  const grid = document.getElementById("xx-part-grid");
  const detail = document.getElementById("xx-detail");
  const titleEl = document.getElementById("xx-detail-title");
  const summaryEl = document.getElementById("xx-detail-summary");
  const planEl = document.getElementById("xx-detail-plan");
  const movesEl = document.getElementById("xx-detail-moves");
  const pointsEl = document.getElementById("xx-detail-points");
  const scienceEl = document.getElementById("xx-detail-science");
  const videoEl = document.getElementById("xx-detail-video");
  const placeholderEl = document.getElementById("xx-video-placeholder");
  const linkEl = document.getElementById("xx-detail-link");
  const userEl = document.getElementById("xx-user");
  const completeBtn = document.getElementById("xx-complete-btn");
  const completeDone = document.getElementById("xx-complete-done");

  var currentPartId = null;

  if (!grid) return;

  function getVideoSrc(partIndex) {
    const fileIndex = (partIndex % VIDEO_COUNT) + 1;
    return "videos/" + fileIndex + ".mp4";
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function renderUser() {
    if (!userEl) return;
    const user = getSession();
    userEl.textContent = user && user.username ? "欢迎，" + user.username : "未登录";
  }

  function renderList(listEl, items) {
    listEl.innerHTML = items
      .map(function (item) {
        return "<li>" + item + "</li>";
      })
      .join("");
  }

  function extractBvid(url) {
    const match = (url || "").match(/BV[\w]+/i);
    return match ? match[0] : "B 站视频";
  }

  function showVideoPlaceholder() {
    if (!videoEl || !placeholderEl) return;
    videoEl.hidden = true;
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
    placeholderEl.hidden = false;
  }

  function showVideo(src) {
    if (!videoEl || !placeholderEl) return;
    placeholderEl.hidden = true;
    videoEl.hidden = false;
    videoEl.onerror = showVideoPlaceholder;
    videoEl.onloadeddata = function () {
      placeholderEl.hidden = true;
      videoEl.hidden = false;
    };
    videoEl.src = src;
    videoEl.load();
  }

  function renderMedia(part, partIndex) {
    if (linkEl) {
      linkEl.href = part.bilibiliUrl;
      linkEl.textContent = "B 站教学 · " + extractBvid(part.bilibiliUrl);
    }
    showVideo(getVideoSrc(partIndex));
  }

  function updateCompleteButton(partId) {
    if (!completeBtn || !completeDone) return;
    if (!partId) {
      completeBtn.hidden = true;
      completeDone.hidden = true;
      return;
    }
    var done = false;
    if (window.HeikesonRewards) {
      var data = HeikesonRewards.getUserData();
      done = data.stats.xiexiuParts.indexOf(partId) !== -1;
    }
    completeBtn.hidden = done;
    completeDone.hidden = !done;
    if (!done) {
      completeBtn.disabled = false;
      completeBtn.textContent = "完成本部位邪修";
    }
  }

  function selectPart(partId) {
    const partIndex = parts.findIndex(function (p) {
      return p.id === partId;
    });
    if (partIndex === -1) return;

    currentPartId = partId;
    const part = parts[partIndex];

    grid.querySelectorAll(".xx-part-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.part === partId);
    });

    titleEl.textContent = part.name + " · 邪修方案";
    summaryEl.textContent = part.summary;
    planEl.textContent = part.plan;
    renderList(movesEl, part.moves);
    renderList(pointsEl, part.points);
    scienceEl.textContent = part.science;
    renderMedia(part, partIndex);

    detail.hidden = false;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    updateCompleteButton(partId);
  }

  grid.innerHTML = parts
    .map(function (part) {
      return (
        '<button type="button" class="xx-part-btn" data-part="' +
        part.id +
        '">' +
        part.name +
        "</button>"
      );
    })
    .join("");

  grid.querySelectorAll(".xx-part-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectPart(btn.dataset.part);
    });
  });

  if (completeBtn) {
    completeBtn.addEventListener("click", function () {
      if (!currentPartId || !window.HeikesonRewards) return;
      var result = HeikesonRewards.trackXiexiuPart(currentPartId);
      HeikesonRewards.notifyNewBadges(result);
      HeikesonRewards.showToast("⚡ 邪修完成，获得邪修碎片", "success");
      updateCompleteButton(currentPartId);
    });
  }

  renderUser();
})();
