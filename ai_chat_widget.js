/*
 * AI Chat Widget - 悬浮球 + 侧边栏对话 + 文本引用
 * 独立 JS 文件，引入后即可使用
 * 
 * 使用方式：
 * <script src="ai_chat_widget.js"></script>
 * <script>
 *   AIChatWidget.init({
 *     apiKey: 'your-api-key-here',        // 必填：智谱 API Key
 *     apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
 *     model: 'glm-5.1',                    // 可选，默认 glm-5.1
 *     temperature: 1,                      // 可选，默认 1
 *     welcomeMessage: '你好！选中页面文字后点击"引用"即可带入对话。'
 *   });
 * </script>
 */
(function(global) {
    'use strict';

    // ==================== 默认配置 ====================
    const defaultConfig = {
        position: { bottom: 40, right: 40 },
        apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        apiKey: null,                        // 必填
        model: 'glm-5.1',
        temperature: 1,
        stream: false,                       // 当前版本暂不支持流式，设为 false
        systemMessage: '你是一个 helpful 的 AI 助手。', // 可选系统提示
        welcomeMessage: '你好！我是你的 AI 助手。选中页面文字后点击"引用"即可带入对话。',
        maxQuoteLength: 300,
        theme: {
            primary: '#3b82f6',
            primaryHover: '#2563eb'
        }
    };

    let config = {};
    let state = {
        isOpen: false,
        isDragging: false,
        hasDragged: false,
        ballX: 0, ballY: 0,
        startX: 0, startY: 0,
        initialLeft: 0, initialTop: 0,
        quoteText: '',
        selectedText: '',
        quoteTooltipTimer: null,
        messages: []                         // 对话历史上下文
    };

    let els = {};

    // ==================== 样式注入 ====================
    function injectStyles() {
        if (document.getElementById('ai-chat-widget-styles')) return;
        
        const css = `
            .ai-chat-widget-overlay {
                position: fixed; top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.4);
                backdrop-filter: blur(4px);
                opacity: 0; visibility: hidden;
                transition: all 0.3s ease;
                z-index: 9998;
            }
            .ai-chat-widget-overlay.active { opacity: 1; visibility: visible; }

            .ai-chat-widget-sidebar {
                position: fixed; top: 0; right: 0;
                width: 420px; max-width: 100%; height: 100vh;
                background: #fff;
                box-shadow: -4px 0 24px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
                z-index: 9999;
                display: flex; flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            .ai-chat-widget-sidebar.active { transform: translateX(0); }
            @media (max-width: 480px) { .ai-chat-widget-sidebar { width: 100%; } }

            .ai-chat-widget-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e8e8e8;
                display: flex; align-items: center; justify-content: space-between;
                flex-shrink: 0;
            }
            .ai-chat-widget-header-title {
                display: flex; align-items: center; gap: 10px;
                font-size: 16px; font-weight: 600; color: #1a1a1a;
            }
            .ai-chat-widget-status {
                width: 8px; height: 8px;
                background: #10b981; border-radius: 50%;
                animation: aicw-pulse 2s infinite;
            }
            @keyframes aicw-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            .ai-chat-widget-close {
                width: 32px; height: 32px; border: none;
                background: #f3f4f6; border-radius: 8px;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: background 0.2s;
            }
            .ai-chat-widget-close:hover { background: #e5e7eb; }

            .ai-chat-widget-chat {
                flex: 1; overflow-y: auto; padding: 20px;
                display: flex; flex-direction: column; gap: 16px;
                background: #fafafa;
            }
            .ai-chat-widget-chat::-webkit-scrollbar { width: 6px; }
            .ai-chat-widget-chat::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

            .ai-chat-widget-msg {
                max-width: 85%; padding: 12px 16px;
                border-radius: 16px; font-size: 14px;
                line-height: 1.6; word-wrap: break-word;
                animation: aicw-msgSlide 0.3s ease;
            }
            @keyframes aicw-msgSlide {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .ai-chat-widget-msg.user {
                align-self: flex-end;
                background: #3b82f6; color: white;
                border-bottom-right-radius: 4px;
            }
            .ai-chat-widget-msg.ai {
                align-self: flex-start;
                background: white; color: #1f2937;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .ai-chat-widget-msg-time {
                font-size: 11px; opacity: 0.6; margin-top: 4px; text-align: right;
            }

            .ai-chat-widget-quote-area {
                padding: 10px 20px 0;
                background: white;
                border-top: 1px solid #e8e8e8;
                display: none;
                flex-shrink: 0;
            }
            .ai-chat-widget-quote-area.active { display: block; }
            .ai-chat-widget-quote-box {
                background: #f0f7ff;
                border-left: 3px solid #3b82f6;
                border-radius: 0 8px 8px 0;
                padding: 8px 12px;
                display: flex; align-items: center; justify-content: space-between;
                gap: 8px;
            }
            .ai-chat-widget-quote-text {
                font-size: 12px; color: #4b5563;
                line-height: 1.4;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                flex: 1;
            }
            .ai-chat-widget-quote-label {
                font-size: 11px; color: #3b82f6;
                font-weight: 600; margin-right: 4px; white-space: nowrap;
            }
            .ai-chat-widget-quote-remove {
                background: none; border: none;
                color: #9ca3af; cursor: pointer;
                font-size: 18px; line-height: 1;
                padding: 0 2px; flex-shrink: 0;
            }
            .ai-chat-widget-quote-remove:hover { color: #ef4444; }

            .ai-chat-widget-input-area {
                padding: 12px 20px 20px;
                border-top: 1px solid #e8e8e8;
                background: white;
                flex-shrink: 0;
            }
            .ai-chat-widget-input-wrap {
                display: flex; gap: 10px; align-items: flex-end;
                background: #f3f4f6; border-radius: 16px;
                padding: 8px 12px;
            }
            .ai-chat-widget-input {
                flex: 1; border: none; background: transparent;
                resize: none; max-height: 120px; font-size: 14px;
                line-height: 1.5; padding: 6px; outline: none;
                font-family: inherit;
            }
            .ai-chat-widget-send {
                width: 36px; height: 36px; border: none;
                background: #3b82f6; border-radius: 12px;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s; flex-shrink: 0;
            }
            .ai-chat-widget-send:hover { background: #2563eb; transform: scale(1.05); }
            .ai-chat-widget-send:active { transform: scale(0.95); }

            .ai-chat-widget-ball {
                position: fixed; width: 60px; height: 60px;
                background: #3b82f6; border-radius: 50%;
                cursor: grab; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 20px rgba(59,130,246,0.4), 0 0 0 4px rgba(59,130,246,0.1);
                z-index: 9997; transition: transform 0.2s, box-shadow 0.2s;
                user-select: none; touch-action: none;
            }
            .ai-chat-widget-ball:active {
                cursor: grabbing; transform: scale(0.95);
                box-shadow: 0 2px 10px rgba(59,130,246,0.3);
            }
            .ai-chat-widget-ball.dragging { transition: none; opacity: 0.9; }
            @media (max-width: 480px) {
                .ai-chat-widget-ball { width: 54px; height: 54px; }
            }

            .ai-chat-widget-quote-tooltip {
                position: fixed;
                background: #1f2937; color: white;
                padding: 6px 14px; border-radius: 8px;
                font-size: 13px; cursor: pointer;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                animation: aicw-tooltipPop 0.2s ease;
                white-space: nowrap;
                display: flex; align-items: center; gap: 6px;
            }
            .ai-chat-widget-quote-tooltip::after {
                content: ''; position: absolute;
                bottom: -5px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid #1f2937;
            }
            @keyframes aicw-tooltipPop {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }

            .ai-chat-widget-typing {
                display: flex; gap: 4px; padding: 4px 0;
            }
            .ai-chat-widget-typing span {
                width: 6px; height: 6px; background: #9ca3af;
                border-radius: 50%; animation: aicw-typingBounce 1.4s infinite ease-in-out both;
            }
            .ai-chat-widget-typing span:nth-child(1) { animation-delay: -0.32s; }
            .ai-chat-widget-typing span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes aicw-typingBounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'ai-chat-widget-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==================== DOM 创建 ====================
    function createDOM() {
        // 遮罩
        els.overlay = document.createElement('div');
        els.overlay.className = 'ai-chat-widget-overlay';
        document.body.appendChild(els.overlay);

        // 侧边栏
        els.sidebar = document.createElement('div');
        els.sidebar.className = 'ai-chat-widget-sidebar';
        els.sidebar.innerHTML = `
            <div class="ai-chat-widget-header">
                <div class="ai-chat-widget-header-title">
                    <div class="ai-chat-widget-status"></div>
                    <span>AI 助手</span>
                </div>
                <button class="ai-chat-widget-close" id="ai-chat-widget-close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="ai-chat-widget-chat" id="ai-chat-widget-chat"></div>
            <div class="ai-chat-widget-quote-area" id="ai-chat-widget-quote-area">
                <div class="ai-chat-widget-quote-box">
                    <div style="display:flex;align-items:center;flex:1;min-width:0">
                        <span class="ai-chat-widget-quote-label">引用</span>
                        <span class="ai-chat-widget-quote-text" id="ai-chat-widget-quote-text"></span>
                    </div>
                    <button class="ai-chat-widget-quote-remove" id="ai-chat-widget-quote-remove">&times;</button>
                </div>
            </div>
            <div class="ai-chat-widget-input-area">
                <div class="ai-chat-widget-input-wrap">
                    <textarea class="ai-chat-widget-input" id="ai-chat-widget-input" placeholder="输入消息..." rows="1"></textarea>
                    <button class="ai-chat-widget-send" id="ai-chat-widget-send">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(els.sidebar);

        // 引用提示按钮
        els.quoteTooltip = document.createElement('div');
        els.quoteTooltip.className = 'ai-chat-widget-quote-tooltip';
        els.quoteTooltip.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span>引用到对话</span>
        `;
        els.quoteTooltip.style.display = 'none';
        document.body.appendChild(els.quoteTooltip);

        // 悬浮球
        els.ball = document.createElement('div');
        els.ball.className = 'ai-chat-widget-ball';
        els.ball.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
        `;
        document.body.appendChild(els.ball);

        // 缓存子元素
        els.chat = document.getElementById('ai-chat-widget-chat');
        els.input = document.getElementById('ai-chat-widget-input');
        els.sendBtn = document.getElementById('ai-chat-widget-send');
        els.closeBtn = document.getElementById('ai-chat-widget-close');
        els.quoteArea = document.getElementById('ai-chat-widget-quote-area');
        els.quoteText = document.getElementById('ai-chat-widget-quote-text');
        els.quoteRemove = document.getElementById('ai-chat-widget-quote-remove');
    }

    // ==================== 位置初始化 ====================
    function initPosition() {
        const pos = config.position;
        state.ballX = window.innerWidth - pos.right - 60;
        state.ballY = window.innerHeight - pos.bottom - 60;
        els.ball.style.left = state.ballX + 'px';
        els.ball.style.top = state.ballY + 'px';
    }

    // ==================== 事件绑定 ====================
    function bindEvents() {
        // 悬浮球拖拽
        els.ball.addEventListener('mousedown', dragStart);
        els.ball.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);

        // 点击打开
        els.ball.addEventListener('click', () => {
            if (!state.hasDragged) openSidebar();
        });

        // 关闭
        els.closeBtn.addEventListener('click', closeSidebar);
        els.overlay.addEventListener('click', closeSidebar);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) closeSidebar();
        });

        // 发送
        els.sendBtn.addEventListener('click', sendMessage);
        els.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        els.input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // 引用移除
        els.quoteRemove.addEventListener('click', removeQuote);

        // 引用提示点击
        els.quoteTooltip.addEventListener('click', () => {
            addQuote(state.selectedText);
            hideQuoteTooltip();
            window.getSelection().removeAllRanges();
        });

        // 选中文字监听
        document.addEventListener('mouseup', handleTextSelection);
        document.addEventListener('touchend', handleTextSelection);
        
        // 点击其他地方隐藏引用提示
        document.addEventListener('mousedown', (e) => {
            if (!els.quoteTooltip.contains(e.target)) hideQuoteTooltip();
        });

        // 窗口调整
        window.addEventListener('resize', () => {
            const maxX = window.innerWidth - els.ball.offsetWidth;
            const maxY = window.innerHeight - els.ball.offsetHeight;
            state.ballX = Math.min(state.ballX, maxX);
            state.ballY = Math.min(state.ballY, maxY);
            els.ball.style.left = state.ballX + 'px';
            els.ball.style.top = state.ballY + 'px';
        });
    }

    // ==================== 拖拽逻辑 ====================
    function dragStart(e) {
        state.isDragging = true;
        state.hasDragged = false;
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        state.startX = clientX;
        state.startY = clientY;
        state.initialLeft = els.ball.offsetLeft;
        state.initialTop = els.ball.offsetTop;
        els.ball.classList.add('dragging');
    }

    function dragMove(e) {
        if (!state.isDragging) return;
        if (e.type.includes('touch')) e.preventDefault();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const dx = clientX - state.startX;
        const dy = clientY - state.startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.hasDragged = true;

        let newX = state.initialLeft + dx;
        let newY = state.initialTop + dy;
        const maxX = window.innerWidth - els.ball.offsetWidth;
        const maxY = window.innerHeight - els.ball.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        state.ballX = newX;
        state.ballY = newY;
        els.ball.style.left = newX + 'px';
        els.ball.style.top = newY + 'px';
        hideQuoteTooltip();
    }

    function dragEnd() {
        if (!state.isDragging) return;
        state.isDragging = false;
        els.ball.classList.remove('dragging');

        // 吸附到最近的左右边缘
        const centerX = state.ballX + els.ball.offsetWidth / 2;
        const targetX = centerX < window.innerWidth / 2 ? 10 : window.innerWidth - els.ball.offsetWidth - 10;
        els.ball.style.transition = 'left 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
        els.ball.style.left = targetX + 'px';
        state.ballX = targetX;

        setTimeout(() => {
            els.ball.style.transition = 'transform 0.2s, box-shadow 0.2s';
        }, 300);
    }

    // ==================== 选中文字处理 ====================
    function handleTextSelection(e) {
        // 忽略在侧边栏、悬浮球、引用提示内的选中
        if (els.sidebar.contains(e.target)) return;
        if (els.ball.contains(e.target)) return;
        if (els.quoteTooltip.contains(e.target)) return;

        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            
            if (text && text.length > 0 && text.length <= config.maxQuoteLength) {
                state.selectedText = text;
                showQuoteTooltip(selection);
            } else {
                hideQuoteTooltip();
            }
        }, 10);
    }

    function showQuoteTooltip(selection) {
        let x = 0, y = 0;
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            x = rect.right;
            y = rect.bottom + 8;
        } else {
            return;
        }

        // 边界检查
        const tooltipWidth = 130;
        if (x + tooltipWidth > window.innerWidth) {
            x = window.innerWidth - tooltipWidth - 10;
        }
        if (y + 40 > window.innerHeight) {
            y = window.innerHeight - 50;
        }

        els.quoteTooltip.style.left = x + 'px';
        els.quoteTooltip.style.top = y + 'px';
        els.quoteTooltip.style.display = 'flex';

        clearTimeout(state.quoteTooltipTimer);
        state.quoteTooltipTimer = setTimeout(hideQuoteTooltip, 4000);
    }

    function hideQuoteTooltip() {
        els.quoteTooltip.style.display = 'none';
        clearTimeout(state.quoteTooltipTimer);
    }

    function addQuote(text) {
        state.quoteText = text;
        els.quoteText.textContent = text;
        els.quoteArea.classList.add('active');
        openSidebar();
    }

    function removeQuote() {
        state.quoteText = '';
        els.quoteArea.classList.remove('active');
    }

    // ==================== 侧边栏 ====================
    function openSidebar() {
        if (state.isOpen) return;
        state.isOpen = true;
        els.sidebar.classList.add('active');
        els.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        hideQuoteTooltip();
        setTimeout(() => els.input.focus(), 350);
    }

    function closeSidebar() {
        if (!state.isOpen) return;
        state.isOpen = false;
        els.sidebar.classList.remove('active');
        els.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ==================== 聊天逻辑 ====================
    function getTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    }

    function createMsg(html, isUser) {
        const div = document.createElement('div');
        div.className = 'ai-chat-widget-msg ' + (isUser ? 'user' : 'ai');
        div.innerHTML = html + '<div class="ai-chat-widget-msg-time">' + getTime() + '</div>';
        return div;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'ai-chat-widget-msg ai';
        div.id = 'ai-chat-widget-typing';
        div.innerHTML = '<div class="ai-chat-widget-typing"><span></span><span></span><span></span></div>';
        els.chat.appendChild(div);
        scrollToBottom();
        return div;
    }

    function removeTyping() {
        const t = document.getElementById('ai-chat-widget-typing');
        if (t) t.remove();
    }

    function scrollToBottom() {
        els.chat.scrollTo({ top: els.chat.scrollHeight, behavior: 'smooth' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== 核心：API 调用（智谱 AI 格式） ====================
    function buildUserContent(text, quote) {
        if (quote) {
            return '引用内容：「' + quote + '」\n\n' + text;
        }
        return text;
    }

    function sendMessage() {
        const text = els.input.value.trim();
        if (!text) return;

        // 构建用户消息内容（含引用）
        const userContent = buildUserContent(text, state.quoteText);

        // UI 显示
        let displayHtml = escapeHtml(text);
        if (state.quoteText) {
            const quotePreview = state.quoteText.length > 50 ? state.quoteText.substring(0, 50) + '...' : state.quoteText;
            displayHtml = '<div style="font-size:12px;opacity:0.85;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.25)">📎 引用: ' + escapeHtml(quotePreview) + '</div>' + displayHtml;
        }

        els.chat.appendChild(createMsg(displayHtml, true));
        els.input.value = '';
        els.input.style.height = 'auto';
        scrollToBottom();

        // 将用户消息加入对话历史
        state.messages.push({ role: 'user', content: userContent });

        // 显示打字动画
        const typing = showTyping();

        // 调用真实 API
        if (config.apiKey) {
            callAPI();
        } else {
            // 无 API Key 时回退到模拟回复
            setTimeout(() => {
                removeTyping();
                const fallback = '请先配置 apiKey 以启用 AI 对话功能。';
                els.chat.appendChild(createMsg(escapeHtml(fallback), false));
                scrollToBottom();
            }, 500);
        }

        // 清空引用
        if (state.quoteText) {
            removeQuote();
        }
    }

    function callAPI() {
        const messages = [];
        
        // 添加系统消息（如果配置了）
        if (config.systemMessage) {
            messages.push({ role: 'system', content: config.systemMessage });
        }
        
        // 添加历史对话（保留最近 20 轮上下文，防止过长）
        const history = state.messages.slice(-20);
        messages.push(...history);

        fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + config.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                stream: config.stream,
                temperature: config.temperature
            })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.error?.message || 'HTTP ' + res.status);
                });
            }
            return res.json();
        })
        .then(data => {
            removeTyping();
            
            // 智谱 AI / OpenAI 兼容格式：choices[0].message.content
            const reply = data.choices?.[0]?.message?.content;
            
            if (reply) {
                // 将 AI 回复加入对话历史
                state.messages.push({ role: 'assistant', content: reply });
                els.chat.appendChild(createMsg(escapeHtml(reply), false));
            } else {
                const errMsg = 'AI 返回异常：' + JSON.stringify(data);
                els.chat.appendChild(createMsg(escapeHtml(errMsg), false));
            }
            scrollToBottom();
        })
        .catch(err => {
            removeTyping();
            const errMsg = '请求失败：' + err.message;
            els.chat.appendChild(createMsg(escapeHtml(errMsg), false));
            scrollToBottom();
            console.error('AI API Error:', err);
        });
    }

    // ==================== 初始化入口 ====================
    function init(userConfig) {
        config = Object.assign({}, defaultConfig, userConfig);
        injectStyles();
        createDOM();
        initPosition();
        bindEvents();

        // 欢迎消息
        setTimeout(() => {
            els.chat.appendChild(createMsg(escapeHtml(config.welcomeMessage), false));
        }, 100);
    }

    // 暴露 API
    global.AIChatWidget = {
        init: init,
        open: openSidebar,
        close: closeSidebar,
        setQuote: addQuote,
        clearQuote: removeQuote,
        clearHistory: function() { state.messages = []; }
    };

})(window);