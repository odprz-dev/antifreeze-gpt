(function() {
    const MIN_KEEP_LAST = 5;
    const MAX_KEEP_LAST = 100;
    const DEFAULT_KEEP_LAST = 10;

    let state = {
        view: 'MAIN',
        keepLast: DEFAULT_KEEP_LAST,
        isPanic: false,
        totalMsgs: 0,
        startTime: Date.now(),
        lastUrl: location.href,
        isVisible: true
    };

    const ICONS = {
        snow: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 21v-4.175l-3.2 1.85-1-1.725 3.2-1.85-3.2-1.85 1-1.725 3.2 1.85V9l-3.2-1.85 1-1.725 3.2 1.85V3h2v4.275l3.2-1.85 1 1.725L13.2 9v4.1l3.2-1.85 1 1.725-3.2 1.85 3.2 1.85-1 1.725-3.2-1.85V21h-2z"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
        back: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`
    };

    chrome.storage.local.get(['keepLast'], (res) => {
        state.keepLast = normalizeKeepLast(res.keepLast);
        init();
    });

    const optStyle = document.createElement('style');
    optStyle.innerHTML = `
        article { content-visibility: auto; contain-intrinsic-size: 1px 100px; }
        .hidden-by-optimizer { display: none !important; }
    `;
    document.documentElement.appendChild(optStyle);

    const container = document.createElement('div');
    container.id = 'antifreeze-root';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2147483647; display: block;';
    const shadow = container.attachShadow({ mode: 'open' });

    function normalizeKeepLast(value) {
        const parsedValue = Number.parseInt(value, 10);

        if (!Number.isFinite(parsedValue)) {
            return DEFAULT_KEEP_LAST;
        }

        return Math.min(MAX_KEEP_LAST, Math.max(MIN_KEEP_LAST, parsedValue));
    }

    function getStyles() {
        return `
        <style>
            :host { font-family: sans-serif; }
            * { box-sizing: border-box; }
            @keyframes drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-10px, 20px); } }
            @keyframes pulse-fast { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }

            .panel {
                width: 300px; height: 450px; border-radius: 24px; position: relative;
                background: #0F172A; overflow: hidden; color: white;
                display: flex; flex-direction: column; transition: background 0.5s ease;
                border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            }
            .bg-blob { position: absolute; border-radius: 50%; filter: blur(60px); z-index: 0; animation: drift 8s ease-in-out infinite; }
            .blob-1 { top: -50px; left: -50px; width: 250px; height: 250px; background: rgba(34, 211, 238, 0.2); }
            .blob-2 { bottom: -20px; right: -20px; width: 200px; height: 200px; background: rgba(37, 99, 235, 0.2); animation-delay: 2s; }
            .state-melt .blob-1 { background: rgba(244, 63, 94, 0.4); animation: pulse-fast 1.5s infinite; }
            .content { position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%; padding: 20px; backdrop-filter: blur(16px); }

            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; cursor: move; padding-bottom: 10px; }

            .logo-area { display: flex; align-items: center; gap: 8px; pointer-events: none; }
            .logo-text { font-weight: 600; font-size: 18px; }
            .timer { font-family: monospace; font-size: 12px; color: #22D3EE; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 8px; }
            .main-display { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .circle {
                width: 140px; height: 140px; border-radius: 50%;
                background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.2);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                box-shadow: inset 0 0 20px rgba(255,255,255,0.05), 0 0 20px rgba(34,211,238,0.2);
                transition: all 0.5s ease;
            }
            .state-melt .circle { border-color: #F43F5E; box-shadow: 0 0 30px rgba(244, 63, 94, 0.4); }
            .count-val { font-size: 56px; font-weight: 700; line-height: 1; }
            .state-melt .count-val { color: #F43F5E; font-size: 42px; }
            .count-label { font-size: 10px; color: #94A3B8; letter-spacing: 2px; }
            .slider-container { width: 100%; margin-bottom: 20px; }
            .slider-labels { display: flex; justify-content: space-between; font-size: 10px; color: #94A3B8; margin-bottom: 8px; }
            .track-wrapper { position: relative; height: 6px; display: flex; align-items: center; }
            .track-bg { position: absolute; width: 100%; height: 6px; border-radius: 10px; background: linear-gradient(90deg, #22D3EE, #F59E0B, #F43F5E); opacity: 0.4; }
            input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; position: relative; z-index: 20; }
            input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: white; border: 1px solid rgba(255,255,255,0.8); cursor: pointer; margin-top: -9px; }
            .btn {
                width: 100%; height: 48px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.03); color: white; font-weight: 600; cursor: pointer;
                display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s;
            }
            .btn-panic { border-color: rgba(255,255,255,0.2); }
            .btn-panic:hover { border-color: #F43F5E; color: #F43F5E; background: rgba(244, 63, 94, 0.1); }
            .btn-cooldown { border-color: #22D3EE; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }
            .settings-btn { background: none; border: none; color: #94A3B8; cursor: pointer; }
            input[type=number] { width: 100%; background: rgba(15, 23, 42, 0.5); border: 1px solid #334155; color: white; padding: 12px; border-radius: 12px; }
        </style>`;
    }

    function render() {
        const isChat = location.href.includes('/c/');
        const timerText = formatTime(Date.now() - state.startTime);
        let contentHTML = '';

        const footerHTML = `
            <div style="margin-top: auto; padding-top: 15px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size: 9px; color: #64748B; letter-spacing: 1px; font-weight: 500;">
                    by <a href="https://odprz.dev" target="_blank" rel="noopener noreferrer" style="color: #22D3EE; text-decoration: none;">odprz.dev</a> - Ucody
                </span>
            </div>
        `;

        if (!isChat && state.view !== 'SETTINGS') {
            contentHTML = `
                <div class="header">
                    <div class="logo-area">${ICONS.snow} <span class="logo-text">Antifreeze</span></div>
                    <button class="settings-btn" id="close-ui" style="font-weight:bold; color:white;">X</button>
                </div>
                <div class="main-display">
                    <div style="opacity:0.2">${ICONS.snow}</div>
                    <h2 style="font-size: 16px; margin-top: 15px;">Sin senal termica</h2>
                    <p style="font-size: 11px; color: #94A3B8; margin-top: 5px;">Entra a un chat para comenzar</p>
                </div>
                ${footerHTML}`;
        } else if (state.view === 'SETTINGS') {
            contentHTML = `
                <div class="header">
                    <button class="settings-btn" id="back-btn">${ICONS.back}</button>
                    <span class="logo-text">Configuracion</span>
                    <button class="settings-btn" id="close-ui" style="font-weight:bold; color:white;">X</button>
                </div>
                <div style="margin-top:20px">
                    <label style="font-size:11px; color:#22D3EE; font-weight:bold; margin-bottom:8px; display:block;">MENSAJES VISIBLES POR DEFECTO</label>
                    <input type="number" id="def-count" min="${MIN_KEEP_LAST}" max="${MAX_KEEP_LAST}" step="1" value="${state.keepLast}">
                    <button class="btn btn-cooldown" id="save-settings" style="margin-top: 15px;">GUARDAR</button>
                    <button class="btn" id="help-btn" style="margin-top: 20px; border-color: rgba(34, 211, 238, 0.3); color: #22D3EE;">
                        <span> AYUDA </span>
                    </button>
                </div>
                ${footerHTML}`;
        } else {
            contentHTML = `
                <div class="header">
                    <div class="logo-area">
                        <span style="color: ${state.isPanic ? '#F43F5E' : '#22D3EE'}">${state.isPanic ? ICONS.warning : ICONS.snow}</span>
                        <span class="logo-text">Antifreeze</span>
                    </div>
                    <span class="timer" id="ui-timer">${timerText}</span>
                    <button class="settings-btn" id="set-btn">${ICONS.settings}</button>
                    <button class="settings-btn" id="close-ui" style="font-weight:bold; color:white; margin-left:10px;">X</button>
                </div>
                <div class="main-display">
                    <div class="circle">
                        <span class="count-val">${state.isPanic ? 'MAX' : state.keepLast}</span>
                        <span class="count-label">MSGS</span>
                    </div>
                    <p style="font-size: 10px; color: #22D3EE; margin-top: 15px; letter-spacing: 2px; opacity: 0.8;">
                        ${state.isPanic ? 'LIMITE TERMICO ALCANZADO' : 'MENSAJES VISIBLES'}
                    </p>
                </div>
                <div class="slider-container">
                    <div class="slider-labels"><span>FROZEN</span><span>MELTDOWN</span></div>
                    <div class="track-wrapper">
                        <div class="track-bg"></div>
                        <input type="range" id="ui-slider" min="${MIN_KEEP_LAST}" max="${MAX_KEEP_LAST}" value="${state.keepLast}" ${state.isPanic ? 'disabled' : ''}>
                    </div>
                    <div style="text-align: center; font-size: 10px; color: #94A3B8; margin-top: 12px;">
                        Total historial: <b id="ui-total">${state.totalMsgs}</b>
                    </div>
                </div>
                <button class="btn ${state.isPanic ? 'btn-cooldown' : 'btn-panic'}" id="ui-panic">
                    <span>${state.isPanic ? ICONS.snow : ICONS.warning}</span>
                    <span style="margin-left:8px">${state.isPanic ? 'REESTABLECER OPTIMIZACION' : 'VER TODOS LOS MENSAJES'}</span>
                </button>
                ${footerHTML}`;
        }

        shadow.innerHTML = `
            ${getStyles()}
            <div class="panel ${state.isPanic ? 'state-melt' : 'state-cold'}">
                <div class="bg-blob blob-1"></div>
                <div class="bg-blob blob-2"></div>
                <div class="content">${contentHTML}</div>
            </div>`;
        attachEvents();
    }

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function dragStart(e) {
        const target = e.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (target.closest('button, input, a, label')) {
            return;
        }

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    }

    function attachEvents() {
        const qs = (id) => shadow.getElementById(id);
        const header = shadow.querySelector('.header');

        if (header) {
            header.onmousedown = dragStart;
        }

        if (qs('close-ui')) {
            qs('close-ui').onclick = () => {
                container.style.display = 'none';
                state.isVisible = false;
            };
        }

        if (qs('ui-slider')) {
            qs('ui-slider').oninput = (e) => {
                state.keepLast = normalizeKeepLast(e.target.value);
                shadow.querySelector('.count-val').innerText = state.keepLast;
                runOptimization();
            };
            qs('ui-slider').onchange = () => chrome.storage.local.set({ keepLast: state.keepLast });
        }

        if (qs('ui-panic')) {
            qs('ui-panic').onclick = () => {
                state.isPanic = !state.isPanic;
                runOptimization();
                render();
            };
        }

        if (qs('set-btn')) {
            qs('set-btn').onclick = () => {
                state.view = 'SETTINGS';
                render();
            };
        }

        if (qs('back-btn')) {
            qs('back-btn').onclick = () => {
                state.view = 'MAIN';
                render();
            };
        }

        if (qs('save-settings')) {
            qs('save-settings').onclick = () => {
                state.keepLast = normalizeKeepLast(qs('def-count').value);
                chrome.storage.local.set({ keepLast: state.keepLast });
                state.view = 'MAIN';
                runOptimization();
                render();
            };
        }

        if (qs('help-btn')) {
            qs('help-btn').onclick = () => {
                const url = chrome.runtime.getURL('public/help.html');
                window.open(url, '_blank');
            };
        }
    }

    function formatTime(ms) {
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }

    function runOptimization() {
        const messages = document.querySelectorAll('article');
        state.totalMsgs = messages.length;

        messages.forEach((msg, index) => {
            if (state.isPanic) {
                msg.classList.remove('hidden-by-optimizer');
            } else if (index < messages.length - state.keepLast) {
                msg.classList.add('hidden-by-optimizer');
            } else {
                msg.classList.remove('hidden-by-optimizer');
            }
        });

        const totalLabel = shadow.getElementById('ui-total');
        if (totalLabel) {
            totalLabel.innerText = state.totalMsgs;
        }
    }

    function init() {
        function ensureInjected() {
            if (!document.getElementById('antifreeze-root')) {
                document.body.appendChild(container);
                render();
            }

            container.style.display = state.isVisible ? 'block' : 'none';
        }

        ensureInjected();

        document.addEventListener('mouseup', dragEnd, false);
        document.addEventListener('mousemove', drag, false);

        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === 'toggle-ui') {
                state.isVisible = !state.isVisible;
                container.style.display = state.isVisible ? 'block' : 'none';
            }
        });

        const observer = new MutationObserver(() => {
            ensureInjected();

            if (location.href !== state.lastUrl) {
                state.lastUrl = location.href;
                state.startTime = Date.now();
                state.isPanic = false;
                render();
            }

            runOptimization();
        });

        observer.observe(document.body, { childList: true, subtree: false }); // subtree: false para no saturar

        setInterval(() => {
            const timer = shadow.getElementById('ui-timer');
            if (timer) {
                timer.innerText = formatTime(Date.now() - state.startTime);
            }
        }, 1000);
    }
})();
