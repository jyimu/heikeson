(function (global) {
  "use strict";

  var SCRIPT_URLS = [
    "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter",
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl",
    "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection",
  ];

  var POSE_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
    [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23],
    [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29],
    [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
  ];

  var MIN_SCORE = 0.3;
  var activeInstance = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error("无法加载脚本: " + src));
      };
      document.head.appendChild(script);
    });
  }

  function loadDependencies() {
    if (global._heikesonPoseDepsReady) return global._heikesonPoseDepsReady;
    global._heikesonPoseDepsReady = SCRIPT_URLS.reduce(function (chain, url) {
      return chain.then(function () {
        return loadScript(url);
      });
    }, Promise.resolve());
    return global._heikesonPoseDepsReady;
  }

  function PoseTracker(root) {
    this.root = root;
    this.detector = null;
    this.running = false;
    this.loopId = 0;
    this.stream = null;
    this.detecting = false;
    this.buildUI();
  }

  PoseTracker.prototype.buildUI = function () {
    this.root.innerHTML =
      '<div class="hks-pose-panel">' +
      '<div class="hks-pose-head">' +
      "<h3>姿态跟练 · MediaPipe Pose</h3>" +
      '<span class="hks-pose-status" data-role="status">点击开启摄像头进行姿态检测</span>' +
      '<button type="button" class="hks-pose-toggle" data-role="toggle">开启姿态检测</button>' +
      "</div>" +
      '<div class="hks-pose-viewport">' +
      '<div class="hks-pose-placeholder" data-role="placeholder">摄像头画面将显示在这里，并在人体上绘制关节与骨架</div>' +
      '<video class="hks-pose-video" data-role="video" playsinline muted hidden></video>' +
      '<canvas class="hks-pose-canvas" data-role="canvas" hidden></canvas>' +
      "</div>" +
      "<p class=\"hks-pose-hint\">使用 TensorFlow.js + MediaPipe BlazePose 实时检测人体 33 个关键点</p>" +
      "</div>";

    this.statusEl = this.root.querySelector('[data-role="status"]');
    this.toggleBtn = this.root.querySelector('[data-role="toggle"]');
    this.placeholderEl = this.root.querySelector('[data-role="placeholder"]');
    this.videoEl = this.root.querySelector('[data-role="video"]');
    this.canvasEl = this.root.querySelector('[data-role="canvas"]');

    var self = this;
    this.toggleBtn.addEventListener("click", function () {
      if (self.running) {
        self.stop();
      } else {
        self.start();
      }
    });
  };

  PoseTracker.prototype.setStatus = function (text) {
    if (this.statusEl) this.statusEl.textContent = text;
  };

  PoseTracker.prototype.setToggleState = function (active, disabled) {
    if (!this.toggleBtn) return;
    this.toggleBtn.disabled = !!disabled;
    this.toggleBtn.classList.toggle("is-active", !!active);
    this.toggleBtn.textContent = active ? "关闭姿态检测" : "开启姿态检测";
  };

  PoseTracker.prototype.createDetector = function () {
    if (!global.poseDetection) {
      throw new Error("pose-detection 库未加载");
    }
    return global.poseDetection.createDetector(
      global.poseDetection.SupportedModels.BlazePose,
      {
        runtime: "mediapipe",
        modelType: "full",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
      }
    );
  };

  PoseTracker.prototype.start = function () {
    var self = this;
    if (self.running || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      self.setStatus("当前浏览器不支持摄像头或未授权 HTTPS/localhost 访问");
      return;
    }

    self.setToggleState(false, true);
    self.setStatus("正在加载 MediaPipe Pose 模型…");

    loadDependencies()
      .then(function () {
        if (!self.detector) {
          return self.createDetector().then(function (detector) {
            self.detector = detector;
          });
        }
      })
      .then(function () {
        self.setStatus("正在打开摄像头…");
        return navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      })
      .then(function (stream) {
        self.stream = stream;
        self.videoEl.srcObject = stream;
        self.videoEl.hidden = false;
        self.canvasEl.hidden = false;
        if (self.placeholderEl) self.placeholderEl.hidden = true;
        return self.videoEl.play();
      })
      .then(function () {
        self.running = true;
        self.setToggleState(true, false);
        self.setStatus("姿态检测中");
        self.loopId += 1;
        self.detectLoop(self.loopId);
      })
      .catch(function (err) {
        self.setToggleState(false, false);
        self.setStatus(err.message || "启动失败，请检查摄像头权限");
      });
  };

  PoseTracker.prototype.detectLoop = function (token) {
    var self = this;
    if (!self.running || token !== self.loopId) return;

    if (self.videoEl.readyState >= 2 && !self.detecting) {
      self.detecting = true;
      self.detector
        .estimatePoses(self.videoEl, {
          flipHorizontal: true,
          maxPoses: 1,
        })
        .then(function (poses) {
          self.drawPoses(poses);
        })
        .catch(function () {})
        .finally(function () {
          self.detecting = false;
        });
    }

    global.requestAnimationFrame(function () {
      self.detectLoop(token);
    });
  };

  PoseTracker.prototype.drawPoses = function (poses) {
    var video = this.videoEl;
    var canvas = this.canvasEl;
    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!poses || !poses.length) return;

    var keypoints = poses[0].keypoints || [];
    this.drawSkeleton(ctx, keypoints);
    this.drawKeypoints(ctx, keypoints);
  };

  PoseTracker.prototype.drawKeypoints = function (ctx, keypoints) {
    keypoints.forEach(function (kp) {
      if ((kp.score || 0) < MIN_SCORE) return;
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
      ctx.strokeStyle = "#052e16";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  PoseTracker.prototype.drawSkeleton = function (ctx, keypoints) {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    POSE_CONNECTIONS.forEach(function (pair) {
      var a = keypoints[pair[0]];
      var b = keypoints[pair[1]];
      if (!a || !b) return;
      if ((a.score || 0) < MIN_SCORE || (b.score || 0) < MIN_SCORE) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
  };

  PoseTracker.prototype.stop = function () {
    this.running = false;
    this.loopId += 1;
    this.detecting = false;

    if (this.stream) {
      this.stream.getTracks().forEach(function (track) {
        track.stop();
      });
      this.stream = null;
    }

    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.srcObject = null;
      this.videoEl.hidden = true;
    }

    if (this.canvasEl) {
      var ctx = this.canvasEl.getContext("2d");
      ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      this.canvasEl.hidden = true;
    }

    if (this.placeholderEl) this.placeholderEl.hidden = false;
    this.setToggleState(false, false);
    this.setStatus("姿态检测已关闭");
  };

  PoseTracker.prototype.destroy = function () {
    this.stop();
    if (this.detector && this.detector.dispose) {
      this.detector.dispose();
      this.detector = null;
    }
    if (this.root) this.root.innerHTML = "";
  };

  function mount(container, options) {
    options = options || {};
    unmount();
    if (!container) return null;
    activeInstance = new PoseTracker(container);
    if (options.autoStart) {
      activeInstance.start();
    }
    return activeInstance;
  }

  function unmount() {
    if (activeInstance) {
      activeInstance.destroy();
      activeInstance = null;
    }
  }

  function getActive() {
    return activeInstance;
  }

  global.HeikesonPoseTracker = {
    mount: mount,
    unmount: unmount,
    getActive: getActive,
  };
})(window);
