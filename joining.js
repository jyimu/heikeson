(function() {
  const ACCOUNT_KEY = 'heikeson_accounts';
  const SESSION_KEY = 'heikeson_currentUser';

  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('auth-open-btn');
  const closeBtn = document.getElementById('auth-close-btn');
  const logoutBtn = document.getElementById('auth-logout-btn');
  const statusText = document.getElementById('auth-status');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const messageEl = document.getElementById('auth-message');

  if (!modal || !openBtn || !closeBtn || !logoutBtn || !statusText) {
    return;
  }

  function init() {
    openBtn.addEventListener('click', () => openAuthModal('login'));
    closeBtn.addEventListener('click', closeAuthModal);
    logoutBtn.addEventListener('click', handleLogout);
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeAuthModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('active')) {
        closeAuthModal();
      }
    });

    refreshAuthState();
  }

  function switchTab(tab) {
    loginTab.classList.toggle('active', tab === 'login');
    registerTab.classList.toggle('active', tab === 'register');
    loginForm.classList.toggle('active', tab === 'login');
    registerForm.classList.toggle('active', tab === 'register');
    clearMessage();
  }

  function openAuthModal(tab = 'login') {
    switchTab(tab);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAuthModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    loginForm.reset();
    registerForm.reset();
    clearMessage();
  }

  function getAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
  }

  function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function refreshAuthState() {
    const user = getSession();
    if (user && user.username) {
      statusText.textContent = `欢迎，${user.username}`;
      logoutBtn.style.display = 'inline-flex';
      openBtn.style.display = 'none';
    } else {
      statusText.textContent = '未登录';
      logoutBtn.style.display = 'none';
      openBtn.style.display = 'inline-flex';
    }
  }

  function showMessage(text, type = 'error') {
    messageEl.textContent = text;
    messageEl.style.color = type === 'success' ? '#047857' : '#dc2626';
  }

  function clearMessage() {
    messageEl.textContent = '';
  }

  function hashPassword(password) {
    return btoa(password);
  }

  function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const height = document.getElementById('register-height').value.trim();
    const weight = document.getElementById('register-weight').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !height || !weight || !password) {
      showMessage('请完整填写注册信息。');
      return;
    }

    const accounts = getAccounts();
    if (accounts.some((item) => item.username === username)) {
      showMessage('该用户名已被注册，请选择其他用户名。');
      return;
    }

    const newAccount = {
      username,
      height,
      weight,
      password: hashPassword(password)
    };

    accounts.push(newAccount);
    saveAccounts(accounts);
    saveSession({ username, height, weight });
    showMessage('注册成功，已自动登录！', 'success');
    refreshAuthState();
    setTimeout(closeAuthModal, 900);
  }

  function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      showMessage('请填写用户名和密码。');
      return;
    }

    const accounts = getAccounts();
    const account = accounts.find((item) => item.username === username);
    if (!account) {
      showMessage('该账户不存在，请先注册。');
      return;
    }

    if (account.password !== hashPassword(password)) {
      showMessage('密码错误，请重新输入。');
      return;
    }

    saveSession({ username: account.username, height: account.height, weight: account.weight });
    showMessage('登录成功！', 'success');
    refreshAuthState();
    setTimeout(closeAuthModal, 700);
  }

  function handleLogout() {
    clearSession();
    refreshAuthState();
    showMessage('已退出登录。', 'success');
    setTimeout(clearMessage, 1200);
  }

  init();
})();