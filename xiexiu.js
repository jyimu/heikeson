(function () {
  const overlay = document.getElementById("xiexiu-overlay");
  const openBtn = document.getElementById("xiexiu-open-btn");
  const quoteImg = document.getElementById("xiexiu-quote-img");
  const actions = document.getElementById("xiexiu-actions");
  const backBtn = document.getElementById("xiexiu-back-btn");
  const continueBtn = document.getElementById("xiexiu-continue-btn");
  const riskPanel = document.getElementById("xiexiu-risk");
  const riskBackBtn = document.getElementById("xiexiu-risk-back-btn");
  const riskConfirmBtn = document.getElementById("xiexiu-risk-confirm-btn");

  if (
    !overlay ||
    !openBtn ||
    !quoteImg ||
    !actions ||
    !backBtn ||
    !continueBtn ||
    !riskPanel ||
    !riskBackBtn ||
    !riskConfirmBtn
  ) {
    return;
  }

  let revealTimer = null;

  function showQuoteStep() {
    quoteImg.hidden = false;
    actions.hidden = false;
    riskPanel.hidden = true;
    riskPanel.classList.remove("visible");
  }

  function showRiskStep() {
    quoteImg.hidden = true;
    actions.hidden = true;
    riskPanel.hidden = false;
    requestAnimationFrame(function () {
      riskPanel.classList.add("visible");
    });
  }

  function openXiexiu() {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    actions.hidden = true;
    actions.classList.remove("visible");
    riskPanel.hidden = true;
    riskPanel.classList.remove("visible");
    quoteImg.hidden = false;
    document.body.classList.add("xiexiu-open");

    clearTimeout(revealTimer);
    revealTimer = setTimeout(function () {
      actions.hidden = false;
      requestAnimationFrame(function () {
        actions.classList.add("visible");
      });
    }, 3000);
  }

  function closeXiexiu() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    actions.hidden = true;
    actions.classList.remove("visible");
    riskPanel.hidden = true;
    riskPanel.classList.remove("visible");
    quoteImg.hidden = false;
    document.body.classList.remove("xiexiu-open");
    clearTimeout(revealTimer);
  }

  openBtn.addEventListener("click", openXiexiu);
  backBtn.addEventListener("click", closeXiexiu);
  continueBtn.addEventListener("click", showRiskStep);
  riskBackBtn.addEventListener("click", showQuoteStep);
  riskConfirmBtn.addEventListener("click", function () {
    window.location.href = "xiexiu.html";
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !overlay.classList.contains("active")) {
      return;
    }
    if (!riskPanel.hidden) {
      showQuoteStep();
      return;
    }
    if (actions.classList.contains("visible")) {
      closeXiexiu();
    }
  });
})();
