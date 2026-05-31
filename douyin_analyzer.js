(function () {
  const SESSION_KEY = "heikeson_currentUser";
  const HISTORY_KEY = "heikeson_douyin_history";
  const API_ENDPOINT = window.DOUYIN_ANALYZER_API || null;

  // ==================== AI 大模型接口配置 ====================
  const AI_API_KEY = window.DOUYIN_AI_API_KEY || '<YOUR_ZHIPU_API_KEY>';
  const AI_API_URL = window.DOUYIN_AI_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const AI_MODEL = window.DOUYIN_AI_API_MODEL || 'glm-5.1';
  const AI_STREAM = window.DOUYIN_AI_API_STREAM || false;
  // ==========================================================

  const DOUYIN_PATTERNS = [
    /douyin\.com\/video\/(\d+)/i,
    /douyin\.com\/share\/video\/(\d+)/i,
    /iesdouyin\.com\/share\/video\/(\d+)/i,
    /v\.douyin\.com\/([A-Za-z0-9]+)/i,
  ];

  const DOUYIN_URL_REGEX =
    /https?:\/\/(?:www\.)?(?:v\.douyin\.com\/[^\s\u4e00-\u9fff，。！？]+|(?:www\.)?douyin\.com\/[^\s\u4e00-\u9fff，。！？]+|(?:www\.)?iesdouyin\.com\/[^\s\u4e00-\u9fff，。！？]+)/i;

  // ==================== 预置 B站 BV 号映射表（仅链接） ====================
  const bilibiliVideoMap = {
    squat: [
      { bvid: 'BV1jN411d7jF', title: '深蹲教学：标准动作与常见错误' },
      { bvid: 'BV1T4411H7sE', title: '深蹲要点精讲' },
      { bvid: 'BV1GJ411x7h7', title: '下肢力量训练基础' },
    ],
    pushup: [
      { bvid: 'BV1bM411a7P3', title: '俯卧撑标准动作教学' },
      { bvid: 'BV1G6nBzAEtE', title: '俯卧撑训练计划与进阶' },
      { bvid: 'BV1YW411N7sM', title: '街健俯卧撑变式大全' },
    ],
    plank: [
      { bvid: 'BV1dLWqzgE1m', title: '平板支撑标准动作教学' },
      { bvid: 'BV1LW411u7BB', title: '核心训练：平板支撑进阶' },
      { bvid: 'BV1sQ4y1y7Gt', title: '核心稳定性训练指南' },
    ],
    lunge: [
      { bvid: 'BV1eZ4y187Nz', title: '弓步蹲动作教学' },
      { bvid: 'BV1sQ4y1y7Gt', title: '分腿蹲与平衡训练' },
    ],
    jumping: [
      { bvid: 'BV1GJ411x7h7', title: 'HIIT 跳跃训练入门' },
      { bvid: 'BV1T4411H7sE', title: '有氧爆发力训练' },
    ],
    stretch: [
      { bvid: 'BV1GJ411x7h7', title: '训练后拉伸完全指南' },
      { bvid: 'BV1T4411H7sE', title: '动态热身与静态拉伸' },
    ],
    biceps: [
      { bvid: 'BV1GJ411x7h7', title: '哑铃弯举标准动作' },
      { bvid: 'BV1T4411H7sE', title: '手臂训练：二头肌孤立训练' },
      { bvid: 'BV1eZ4y187Nz', title: '锤式弯举与集中弯举' },
    ],
    general: [
      { bvid: 'BV1GJ411x7h7', title: '综合健身入门指南' },
      { bvid: 'BV1T4411H7sE', title: '家庭健身训练计划' },
      { bvid: 'BV1bM411a7P3', title: '新手健身常见错误纠正' },
    ],
  };
  // ==============================================================

  const exerciseLibrary = {
    squat: {
      name: "深蹲类动作",
      summary: "视频内容偏向下肢力量训练，以髋膝联动为主。",
      points: [
        "脚距与肩同宽或略宽，脚尖微外展 15–30°",
        "下蹲时先动髋再动膝，想象坐向身后椅子",
        "蹲至大腿与地面平行或略低，保持脊柱中立",
        "起身时脚跟发力，膝盖始终与脚尖同向",
      ],
      mistakes: [
        "膝盖内扣（最常见，易伤膝）",
        "脚跟离地、重心前倾",
        "塌腰或过度弓背",
        "下蹲深度不足却增加负重",
      ],
      plan: "建议 3 组 × 12 次，组间休息 60 秒；新手可先练自重，再考虑负重。",
    },
    pushup: {
      name: "俯卧撑类动作",
      summary: "视频内容偏向上肢推力与核心稳定训练。",
      points: [
        "手掌位于肩正下方，身体从头到脚成一条直线",
        "下降时肘部约 45° 夹角，不要完全贴地弹起",
        "收紧核心与臀部，避免塌腰",
        "推起时呼气，全程控制速度",
      ],
      mistakes: [
        "塌腰或撅臀，失去核心稳定",
        "只动胳膊、不动肩胛骨",
        "动作幅度过小，训练效果打折",
        "颈过度前伸，造成颈椎压力",
      ],
      plan: "建议 3 组 × 8–12 次；做不了标准版可改为跪姿或斜板俯卧撑。",
    },
    plank: {
      name: "平板支撑 / 核心类",
      summary: "视频内容偏向静态核心稳定与腹压训练。",
      points: [
        "前臂撑地，肘位于肩正下方",
        "收紧腹臀，骨盆中立，不塌腰不撅臀",
        "呼吸均匀，不要憋气",
        "可从 20 秒起步，逐步延长至 45–60 秒",
      ],
      mistakes: [
        "塌腰（最常见）",
        "耸肩、把压力放在脖子上",
        "憋气导致血压波动",
        "时间盲目加长而姿态变形",
      ],
      plan: "建议 3 组 × 30–45 秒，组间休息 45 秒。",
    },
    lunge: {
      name: "弓步 / 分腿类",
      summary: "视频内容偏向单腿力量与平衡协调训练。",
      points: [
        "前脚踏实，后脚脚尖点地",
        "下蹲时前膝约 90°，方向与脚尖一致",
        "躯干微前倾，核心收紧保持平衡",
        "推起时前脚全掌发力回到起始位",
      ],
      mistakes: [
        "前膝过度超过脚尖且重心不稳",
        "步幅过小，训练幅度不足",
        "上身左右摇晃",
        "后膝重重砸地",
      ],
      plan: "建议每侧 3 组 × 10 次，弱侧可多练 1 组。",
    },
    jumping: {
      name: "跳跃 / 有氧类",
      summary: "视频内容偏向提升心率的有氧或爆发力训练。",
      points: [
        "落地时屈膝缓冲，前脚掌先着地",
        "保持核心稳定，避免硬着陆",
        "节奏由慢到快，先熟悉动作再提速",
        "训练前充分热身，保护膝踝",
      ],
      mistakes: [
        "直腿落地，冲击过大",
        "在硬地面长时间高频率跳跃",
        "疲劳后动作变形仍强行继续",
        "未热身直接高强度",
      ],
      plan: "建议 3 组 × 20 次或 30 秒间歇，组间休息 45–60 秒。",
    },
    stretch: {
      name: "拉伸 / 热身类",
      summary: "视频内容偏向关节活动与肌肉放松恢复。",
      points: [
        "动态拉伸用于训练前，静态拉伸用于训练后",
        "拉伸到有轻微张力即可，不要弹震式猛拉",
        "配合呼吸，呼气时加深幅度",
        "左右两侧保持对称时长",
      ],
      mistakes: [
        "训练前长时间静态拉伸降低力量表现",
        "弹震式拉伸导致肌肉拉伤",
        "只拉一侧，造成不平衡",
        "疼痛时仍强行加深幅度",
      ],
      plan: "训练前动态 5 分钟，训练后静态 5–10 分钟。",
    },
    biceps: {
      name: "肱二头肌锻炼",
      summary: "视频内容偏向肱二头肌孤立训练，以肘关节屈曲为主，常见动作为各类弯举。",
      points: [
        "大臂贴紧身体两侧，仅前臂带动哑铃/杠铃向上弯举",
        "弯举至顶峰时短暂停顿 1 秒，感受肱二头肌收缩",
        "下放时控制速度（约 2–3 秒），不要靠重力自由落体",
        "手腕保持中立，不要过度内旋或外翻",
        "呼气上举、吸气下放，避免憋气",
      ],
      mistakes: [
        "甩动身体借力（最常见，训练效果大打折扣）",
        "肘部前后摆动，未固定大臂",
        "重量过大导致只能做半程动作",
        "手腕过度弯曲，增加腕关节压力",
        "只练单一弯举角度，刺激不全面",
      ],
      plan: "建议选 2–3 种弯举（如哑铃弯举 + 锤式弯举 + 集中弯举），各 3 组 × 10–12 次，组间休息 60 秒。",
    },
    general: {
      name: "综合健身动作",
      summary: "视频为综合健身内容，建议先确认具体动作类型再跟练。",
      points: [
        "跟练前先完整看一遍，确认动作与器械",
        "从低强度版本开始，不盲目追求速度",
        "关注教练提示的呼吸与发力节奏",
        "不确定的动作先降幅度、降次数",
      ],
      mistakes: [
        "未看清动作就盲目跟练",
        "忽视热身直接上强度",
        "把娱乐向视频当专业教学",
        "身体不适时仍坚持完成",
      ],
      plan: "建议将视频拆成 2–3 个小节，每节 5–8 分钟循环练习。",
    },
  };

  const keywordMap = [
    { key: "biceps", words: ["肱二头肌", "二头肌", "二头", "弯举", "curl", "bicep", "biceps", "哑铃弯举", "杠铃弯举", "锤式弯举", "集中弯举", "手臂训练", "练臂", "麒麟臂"] },
    { key: "squat", words: ["深蹲", "squat", "起蹲", "杠铃蹲"] },
    { key: "pushup", words: ["俯卧撑", "pushup", "push-up", "撑体"] },
    { key: "plank", words: ["平板", "plank", "核心", "腹"] },
    { key: "lunge", words: ["弓步", "lunge", "分腿"] },
    { key: "jumping", words: ["开合跳", "波比", "burpee", "跳跃", "有氧", "hiit"] },
    { key: "stretch", words: ["拉伸", "stretch", "热身", "放松", "瑜伽"] },
  ];

  const form = document.getElementById("douyin-form");
  const urlInput = document.getElementById("douyin-url");
  const hintInput = document.getElementById("douyin-hint");
  const resultPanel = document.getElementById("douyin-result");
  const statusEl = document.getElementById("douyin-status");
  const analyzeBtn = document.getElementById("douyin-analyze-btn");

  if (!form || !urlInput) return;

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getUserBMIInfo(user) {
    if (!user || !user.height || !user.weight) return null;
    const h = parseFloat(user.height) / 100;
    const w = parseFloat(user.weight);
    if (h <= 0 || w <= 0) return null;
    const bmi = w / (h * h);
    let level = "中等";
    if (bmi < 18.5) level = "偏瘦";
    else if (bmi < 24) level = "正常";
    else if (bmi < 28) level = "偏重";
    else level = "较高";
    return { bmi: bmi, level: level, height: user.height, weight: user.weight };
  }

  function extractVideoId(url) {
    for (let i = 0; i < DOUYIN_PATTERNS.length; i++) {
      const match = url.match(DOUYIN_PATTERNS[i]);
      if (match) return match[1];
    }
    return null;
  }

  function extractChineseText(text) {
    if (!text) return "";
    const segments = text.match(/[\u4e00-\u9fff_a-zA-Z0-9]+/g);
    return segments ? segments.join(" ") : "";
  }

  function extractChineseTags(text) {
    const tags = [];
    const seen = {};

    const hashRe = /#([^\s#]{1,40})/g;
    let match;
    while ((match = hashRe.exec(text)) !== null) {
      const tag = match[1].replace(/[，。！？,.!?]+$/g, "");
      if (tag && !seen[tag]) {
        seen[tag] = true;
        tags.push(tag);
      }
    }

    const bracketRe = /【([^】]{1,50})】/g;
    while ((match = bracketRe.exec(text)) !== null) {
      const tag = match[1].trim();
      if (tag && !seen[tag]) {
        seen[tag] = true;
        tags.push(tag);
      }
    }

    return tags;
  }

  function extractChineseFromUrl(url) {
    const chunks = [];
    try {
      const parsed = new URL(url);
      chunks.push(decodeURIComponent(parsed.pathname));
      parsed.searchParams.forEach(function (value) {
        try {
          chunks.push(decodeURIComponent(value));
        } catch (_) {
          chunks.push(value);
        }
      });
      if (parsed.hash) {
        chunks.push(decodeURIComponent(parsed.hash.replace(/^#/, "")));
      }
    } catch (_) {
      chunks.push(url);
    }

    try {
      chunks.push(decodeURIComponent(url));
    } catch (_) {}

    return extractChineseText(chunks.join(" "));
  }

  function parseDouyinInput(rawInput) {
    const trimmed = rawInput.trim();
    const urlMatch = trimmed.match(DOUYIN_URL_REGEX);
    let url = trimmed;

    if (urlMatch) {
      url = urlMatch[0].replace(/[，。！？,.!?]+$/g, "");
    }

    const tags = extractChineseTags(trimmed);
    const shareText = urlMatch
      ? trimmed.replace(urlMatch[0], " ")
      : trimmed;
    const textFromShare = extractChineseText(shareText);
    const textFromUrl = extractChineseFromUrl(url);

    const labelText = [tags.join(" "), textFromShare, textFromUrl]
      .filter(Boolean)
      .join(" ");

    return {
      url: url,
      tags: tags,
      labelText: labelText,
    };
  }

  function isDouyinUrl(url) {
    return /douyin\.com|iesdouyin\.com/i.test(url);
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function matchExerciseKeywords(text) {
    const lower = text.toLowerCase();
    for (let i = 0; i < keywordMap.length; i++) {
      const item = keywordMap[i];
      for (let j = 0; j < item.words.length; j++) {
        if (lower.indexOf(item.words[j].toLowerCase()) !== -1) {
          return item.key;
        }
      }
    }
    return null;
  }

  function detectExerciseType(url, hint, labelText) {
    const sources = [
      labelText,
      hint,
      extractChineseFromUrl(url),
      url,
    ];

    for (let i = 0; i < sources.length; i++) {
      const text = (sources[i] || "").trim();
      if (!text) continue;
      const matched = matchExerciseKeywords(text);
      if (matched) return { key: matched, source: text };
    }

    const keys = Object.keys(exerciseLibrary).filter(function (k) {
      return k !== "general";
    });
    const index = hashCode(url) % keys.length;
    return { key: keys[index], source: "" };
  }

  function buildPersonalAdvice(user, exerciseKey) {
    const info = getUserBMIInfo(user);
    if (!info) {
      return "登录并填写身高体重后，系统可结合 BMI 给出更贴合的训练建议。";
    }

    const bmi = info.bmi;
    const level = info.level;
    let advice = "";

    if (bmi < 18.5) {
      advice = "跟练时注意控制有氧时长，可适当增加组间休息，训练后补充蛋白质。";
    } else if (bmi < 24) {
      advice = "当前体型适合按视频标准节奏跟练，建议循序渐进加重或加次。";
    } else if (bmi < 28) {
      advice = "建议优先选择低冲击版本（如跪姿俯卧撑、减小跳跃幅度），保护膝踝。";
    } else {
      advice = "建议以低冲击动作为主，缩短单次时长，分多组完成，并关注心率与关节感受。";
    }

    if (exerciseKey === "jumping" && bmi >= 24) {
      advice += " 跳跃类动作可替换为原地踏步或快走，同样能提升心率。";
    }

    if (exerciseKey === "biceps") {
      advice += " 肱二头肌训练宜选用能完成 10–12 次的重量，优先保证动作标准，再逐步加重。";
    }

    return (
      "根据你的数据（" +
      info.height +
      "cm / " +
      info.weight +
      "kg，BMI " +
      bmi.toFixed(1) +
      "，" +
      level +
      "），" +
      advice
    );
  }

  function saveHistory(entry) {
    try {
      const list = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
      list.unshift(entry);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 10)));
    } catch (_) {}
  }

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = "douyin-status" + (type ? " douyin-status--" + type : "");
    statusEl.hidden = !text;
  }

  function setLoading(loading) {
    if (analyzeBtn) {
      analyzeBtn.disabled = loading;
      analyzeBtn.textContent = loading ? "分析中…" : "开始分析";
    }
    if (resultPanel) {
      resultPanel.classList.toggle("douyin-result--loading", loading);
    }
  }

  function renderResult(data) {
    resultPanel.hidden = false;
    document.getElementById("result-action").textContent = data.actionName;
    document.getElementById("result-summary").textContent = data.summary;
    document.getElementById("result-video-id").textContent =
      data.videoId || "短链接（需后端解析）";

    const tagsEl = document.getElementById("result-tags");
    if (tagsEl) {
      if (data.tags && data.tags.length) {
        tagsEl.hidden = false;
        tagsEl.innerHTML =
          "识别标签：" +
          data.tags
            .map(function (tag) {
              return '<span class="douyin-tag-chip">#' + escapeHtml(tag) + "</span>";
            })
            .join("");
      } else {
        tagsEl.hidden = true;
        tagsEl.textContent = "";
      }
    }

    const pointsEl = document.getElementById("result-points");
    const mistakesEl = document.getElementById("result-mistakes");
    pointsEl.innerHTML = data.points
      .map(function (p) {
        return "<li>" + p + "</li>";
      })
      .join("");
    mistakesEl.innerHTML = data.mistakes
      .map(function (m) {
        return "<li>" + m + "</li>";
      })
      .join("");

    document.getElementById("result-plan").textContent = data.plan;
    document.getElementById("result-personal").textContent = data.personalAdvice;

    const linkEl = document.getElementById("result-source-link");
    linkEl.href = data.url;
    linkEl.textContent = "查看原视频链接";

    // 仅渲染 BV 号链接列表
    renderBilibiliLinks(data.exerciseKey || 'general');
  }

  // ==================== B站链接列表（纯文本，无预览） ====================
  function renderBilibiliLinks(exerciseKey) {
    let container = document.getElementById("result-bilibili-links");
    if (!container) {
      container = document.createElement("div");
      container.id = "result-bilibili-links";
      container.className = "bilibili-links-section";
      resultPanel.appendChild(container);
    }

    const videos = bilibiliVideoMap[exerciseKey] || bilibiliVideoMap.general;
    if (!videos || videos.length === 0) {
      container.hidden = true;
      return;
    }

    container.hidden = false;

    const listHtml = videos.map(function (v, idx) {
      const pageUrl = 'https://www.bilibili.com/video/' + v.bvid;
      return (
        '<div class="bili-link-item">' +
          '<span class="bili-link-num">' + (idx + 1) + '</span>' +
          '<a href="' + pageUrl + '" target="_blank" class="bili-link-title" title="在B站打开">' + escapeHtml(v.title) + '</a>' +
          '<span class="bili-link-bvid">' + v.bvid + '</span>' +
          '<button class="bili-link-copy" data-bvid="' + v.bvid + '" onclick="window.copyBV(this)">复制</button>' +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<h3 class="bilibili-links-title">📎 相关教学视频（B站）</h3>' +
      '<div class="bilibili-links-list">' + listHtml + '</div>';
  }
  // =======================================================================

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function buildSummary(lib, tags, labelText, matchedSource) {
    if (tags.length) {
      return (
        "根据分享标签「" +
        tags.slice(0, 4).join("」「") +
        "」分析：" +
        lib.summary
      );
    }
    if (matchedSource) {
      return "根据链接内文字「" + matchedSource + "」分析：" + lib.summary;
    }
    if (labelText) {
      return "根据分享文案分析：" + lib.summary;
    }
    return lib.summary;
  }

  function analyzeLocally(parsed, hint) {
    const url = parsed.url;
    const videoId = extractVideoId(url);
    const labelText = [parsed.labelText, hint].filter(Boolean).join(" ");
    const detected = detectExerciseType(url, hint, parsed.labelText);
    const exerciseKey = detected.key;
    const lib = exerciseLibrary[exerciseKey] || exerciseLibrary.general;
    const user = getSession();

    return {
      url: url,
      videoId: videoId,
      tags: parsed.tags,
      labelText: labelText,
      actionName: lib.name,
      summary: buildSummary(lib, parsed.tags, parsed.labelText, detected.source),
      points: lib.points,
      mistakes: lib.mistakes,
      plan: lib.plan,
      personalAdvice: buildPersonalAdvice(user, exerciseKey),
      exerciseKey: exerciseKey,
    };
  }

  function analyzeViaApi(url, hint, parsed) {
    const user = getSession();
    return fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url,
        hint: hint,
        tags: parsed.tags,
        labelText: parsed.labelText,
        user: user,
      }),
    }).then(function (res) {
      if (!res.ok) throw new Error("分析服务暂时不可用");
      return res.json();
    });
  }

  function normalizeApiResult(raw, url) {
    return {
      url: url,
      videoId: raw.videoId || extractVideoId(url),
      actionName: raw.actionName || raw.action || "识别动作",
      summary: raw.summary || "",
      points: raw.points || raw.technicalPoints || [],
      mistakes: raw.mistakes || raw.commonMistakes || [],
      plan: raw.plan || raw.trainingPlan || "",
      personalAdvice: raw.personalAdvice || raw.advice || "",
      exerciseKey: raw.exerciseKey || 'general',
    };
  }

  function buildAnalysisPrompt(parsed, hint, user) {
    const info = getUserBMIInfo(user);
    const bmiText = info
      ? `身高 ${info.height}cm，体重 ${info.weight}kg，BMI ${info.bmi.toFixed(1)}（${info.level}）`
      : '未提供身高体重数据';

    const userContent = `请分析以下抖音健身视频，并返回JSON格式的专业报告：

【视频信息】
- 链接：${parsed.url}
- 识别标签：${parsed.tags.join('、') || '无'}
- 分享文案：${parsed.labelText || '无'}
- 用户补充：${hint || '无'}

【用户身体数据】
${bmiText}

【输出要求】
严格按以下JSON格式返回，不要包含 markdown 代码块标记或其他说明文字：
{
  "actionName": "动作类别名称，如深蹲类动作",
  "summary": "视频内容分析摘要（1-2句话）",
  "points": ["技术要点1", "技术要点2", "技术要点3", "技术要点4"],
  "mistakes": ["常见错误1", "常见错误2", "常见错误3", "常见错误4"],
  "plan": "具体训练计划（组数×次数、休息、进阶建议）",
  "personalAdvice": "基于用户数据的个性化建议",
  "exerciseKey": "动作类型关键词，必须是以下之一：squat、pushup、plank、lunge、jumping、stretch、biceps、general"
}

分析要求：
1. 根据标签、文案和链接内容判断动作类型，exerciseKey 必须严格使用上述枚举值之一
2. 技术要点要具体、可操作，每条控制在30字以内
3. 常见错误要说明后果或风险
4. 训练计划要量化（如 3组×12次，组间休息60秒）
5. 个性化建议考虑BMI、动作冲击性、关节压力等因素
6. 使用中文，专业但易懂`;

    return {
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位拥有10年经验的专业健身教练和运动科学分析师。你擅长根据视频文本信息生成精准、实用、安全的训练分析报告。你的输出必须严格符合用户要求的JSON格式，exerciseKey必须是枚举值之一。'
        },
        {
          role: 'user',
          content: userContent
        }
      ],
      stream: AI_STREAM,
      temperature: 0.7
    };
  }

  function analyzeWithAI(parsed, hint) {
    const user = getSession();
    const body = buildAnalysisPrompt(parsed, hint, user);

    return fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + AI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) throw new Error('AI服务请求失败: ' + res.status);
      return res.json();
    }).then(function (data) {
      const content = data.choices?.[0]?.message?.content || '';
      if (!content) throw new Error('AI返回内容为空');

      let jsonStr = content;
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }

      const result = JSON.parse(jsonStr);

      if (!result.actionName || !Array.isArray(result.points) || !Array.isArray(result.mistakes)) {
        throw new Error('AI返回数据格式不完整');
      }

      const validKeys = Object.keys(exerciseLibrary);
      const exerciseKey = validKeys.indexOf(result.exerciseKey) !== -1 ? result.exerciseKey : 'general';

      return {
        url: parsed.url,
        videoId: extractVideoId(parsed.url),
        tags: parsed.tags,
        actionName: result.actionName,
        summary: result.summary || '',
        points: result.points,
        mistakes: result.mistakes,
        plan: result.plan || '',
        personalAdvice: result.personalAdvice || '',
        exerciseKey: exerciseKey,
      };
    });
  }

  window.copyBV = function (btn) {
    const bvid = btn.getAttribute('data-bvid');
    if (!bvid) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bvid).then(function () {
        const orig = btn.textContent;
        btn.textContent = '已复制';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = orig;
          btn.disabled = false;
        }, 1500);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = bvid;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const orig = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(function () { btn.textContent = orig; }, 1500);
    }
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const rawInput = urlInput.value.trim();
    const hint = hintInput ? hintInput.value.trim() : "";

    if (!rawInput) {
      setStatus("请粘贴抖音完整分享内容或链接", "error");
      return;
    }

    const parsed = parseDouyinInput(rawInput);

    if (!isDouyinUrl(parsed.url)) {
      setStatus("未检测到有效抖音链接，请确认分享内容中包含 douyin.com 链接", "error");
      return;
    }

    setStatus("");
    setLoading(true);

    const finish = function (data) {
      setLoading(false);
      renderResult(data);
      saveHistory({
        url: parsed.url,
        action: data.actionName,
        tags: data.tags,
        time: Date.now(),
      });
      setStatus("分析完成", "success");
    };

    if (AI_API_KEY && AI_API_KEY !== '<YOUR_ZHIPU_API_KEY>') {
      analyzeWithAI(parsed, hint)
        .then(function (data) {
          finish(data);
        })
        .catch(function (err) {
          console.error('AI分析失败:', err);
          const localData = analyzeLocally(parsed, hint);
          finish(localData);
          setStatus("AI服务暂不可用，已切换至本地智能分析", "info");
        });
    } else if (API_ENDPOINT) {
      analyzeViaApi(parsed.url, hint, parsed)
        .then(function (raw) {
          finish(normalizeApiResult(raw, parsed.url));
        })
        .catch(function () {
          finish(analyzeLocally(parsed, hint));
          setStatus("已使用本地智能分析（API 不可用）", "info");
        });
    } else {
      setTimeout(function () {
        finish(analyzeLocally(parsed, hint));
      }, 1200);
    }
  });
})();