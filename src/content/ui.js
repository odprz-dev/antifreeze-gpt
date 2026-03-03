(function() {
    const app = globalThis.AntifreezeContent;

    const optStyle = document.createElement('style');
    optStyle.innerHTML = `
        article { content-visibility: auto; contain-intrinsic-size: 1px 100px; }
        .hidden-by-optimizer { display: none !important; }
    `;
    document.documentElement.appendChild(optStyle);

    app.container = document.createElement('div');
    app.container.id = 'antifreeze-root';
    app.container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2147483647; display: block;';
    app.shadow = app.container.attachShadow({ mode: 'open' });

    app.updateTotalLabel = () => {
        const totalLabel = app.shadow.getElementById('ui-total');
        if (totalLabel) {
            totalLabel.innerText = app.state.totalMsgs;
        }
    };

    app.getStyles = () => `
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

    app.dragStart = (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (target.closest('button, input, a, label')) {
            return;
        }

        app.runtime.initialX = e.clientX - app.runtime.xOffset;
        app.runtime.initialY = e.clientY - app.runtime.yOffset;
        app.runtime.isDragging = true;
    };

    app.dragEnd = () => {
        app.runtime.initialX = app.runtime.currentX;
        app.runtime.initialY = app.runtime.currentY;
        app.runtime.isDragging = false;
    };

    app.drag = (e) => {
        if (!app.runtime.isDragging) {
            return;
        }

        e.preventDefault();
        app.runtime.currentX = e.clientX - app.runtime.initialX;
        app.runtime.currentY = e.clientY - app.runtime.initialY;
        app.runtime.xOffset = app.runtime.currentX;
        app.runtime.yOffset = app.runtime.currentY;
        app.container.style.transform = `translate3d(${app.runtime.currentX}px, ${app.runtime.currentY}px, 0)`;
    };

    app.attachEvents = () => {
        const qs = (id) => app.shadow.getElementById(id);
        const header = app.shadow.querySelector('.header');

        if (header) {
            header.onmousedown = app.dragStart;
        }

        if (qs('close-ui')) {
            qs('close-ui').onclick = () => {
                app.container.style.display = 'none';
                app.state.isVisible = false;
            };
        }

        if (qs('ui-slider')) {
            qs('ui-slider').oninput = (e) => {
                app.state.keepLast = app.normalizeKeepLast(e.target.value);
                app.shadow.querySelector('.count-val').innerText = app.state.keepLast;
                app.runOptimization();
            };
            qs('ui-slider').onchange = app.saveKeepLast;
        }

        if (qs('ui-panic')) {
            qs('ui-panic').onclick = () => {
                app.state.isPanic = !app.state.isPanic;
                app.runOptimization();
                app.render();
            };
        }

        if (qs('set-btn')) {
            qs('set-btn').onclick = () => {
                app.state.view = 'SETTINGS';
                app.render();
            };
        }

        if (qs('back-btn')) {
            qs('back-btn').onclick = () => {
                app.state.view = 'MAIN';
                app.render();
            };
        }

        if (qs('save-settings')) {
            qs('save-settings').onclick = () => {
                app.state.keepLast = app.normalizeKeepLast(qs('def-count').value);
                app.saveKeepLast();
                app.state.view = 'MAIN';
                app.runOptimization();
                app.render();
            };
        }

        if (qs('help-btn')) {
            qs('help-btn').onclick = () => {
                const url = chrome.runtime.getURL('public/help.html');
                window.open(url, '_blank');
            };
        }
    };

    app.formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    };

    app.render = () => {
        const isChat = app.isChatConversation();
        const timerText = app.formatTime(Date.now() - app.state.startTime);
        let contentHTML = '';

        const footerHTML = `
            <div style="margin-top: auto; padding-top: 15px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size: 9px; color: #64748B; letter-spacing: 1px; font-weight: 500;">
                    by <a href="https://odprz.dev" target="_blank" rel="noopener noreferrer" style="color: #22D3EE; text-decoration: none;">odprz.dev</a> - Ucody
                </span>
            </div>
        `;

        if (!isChat && app.state.view !== 'SETTINGS') {
            contentHTML = `
                <div class="header">
                    <div class="logo-area">${app.ICONS.snow} <span class="logo-text">Antifreeze</span></div>
                    <button class="settings-btn" id="close-ui" style="font-weight:bold; color:white;">X</button>
                </div>
                <div class="main-display">
                    <div style="opacity:0.2">${app.ICONS.snow}</div>
                    <h2 style="font-size: 16px; margin-top: 15px;">Sin senal termica</h2>
                    <p style="font-size: 11px; color: #94A3B8; margin-top: 5px;">Entra a un chat para comenzar</p>
                </div>
                ${footerHTML}`;
        } else if (app.state.view === 'SETTINGS') {
            contentHTML = `
                <div class="header">
                    <button class="settings-btn" id="back-btn">${app.ICONS.back}</button>
                    <span class="logo-text">Configuracion</span>
                    <button class="settings-btn" id="close-ui" style="font-weight:bold; color:white;">X</button>
                </div>
                <div style="margin-top:20px">
                    <label style="font-size:11px; color:#22D3EE; font-weight:bold; margin-bottom:8px; display:block;">MENSAJES VISIBLES POR DEFECTO</label>
                    <input type="number" id="def-count" min="${app.MIN_KEEP_LAST}" max="${app.MAX_KEEP_LAST}" step="1" value="${app.state.keepLast}">
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
                        <span style="color: ${app.state.isPanic ? '#F43F5E' : '#22D3EE'}">${app.state.isPanic ? app.ICONS.warning : app.ICONS.snow}</span>
                        <span class="logo-text">Antifreeze</span>
                    </div>
                    <span class="timer" id="ui-timer">${timerText}</span>
                    <button class="settings-btn" id="set-btn">${app.ICONS.settings}</button>
                    <button class="settings-btn" id="close-ui" style="font-weight:bold; color:white; margin-left:10px;">X</button>
                </div>
                <div class="main-display">
                    <div class="circle">
                        <span class="count-val">${app.state.isPanic ? 'MAX' : app.state.keepLast}</span>
                        <span class="count-label">MSGS</span>
                    </div>
                    <p style="font-size: 10px; color: #22D3EE; margin-top: 15px; letter-spacing: 2px; opacity: 0.8;">
                        ${app.state.isPanic ? 'LIMITE TERMICO ALCANZADO' : 'MENSAJES VISIBLES'}
                    </p>
                </div>
                <div class="slider-container">
                    <div class="slider-labels"><span>FROZEN</span><span>MELTDOWN</span></div>
                    <div class="track-wrapper">
                        <div class="track-bg"></div>
                        <input type="range" id="ui-slider" min="${app.MIN_KEEP_LAST}" max="${app.MAX_KEEP_LAST}" value="${app.state.keepLast}" ${app.state.isPanic ? 'disabled' : ''}>
                    </div>
                    <div style="text-align: center; font-size: 10px; color: #94A3B8; margin-top: 12px;">
                        Total historial: <b id="ui-total">${app.state.totalMsgs}</b>
                    </div>
                </div>
                <button class="btn ${app.state.isPanic ? 'btn-cooldown' : 'btn-panic'}" id="ui-panic">
                    <span>${app.state.isPanic ? app.ICONS.snow : app.ICONS.warning}</span>
                    <span style="margin-left:8px">${app.state.isPanic ? 'REESTABLECER OPTIMIZACION' : 'VER TODOS LOS MENSAJES'}</span>
                </button>
                ${footerHTML}`;
        }

        app.shadow.innerHTML = `
            ${app.getStyles()}
            <div class="panel ${app.state.isPanic ? 'state-melt' : 'state-cold'}">
                <div class="bg-blob blob-1"></div>
                <div class="bg-blob blob-2"></div>
                <div class="content">${contentHTML}</div>
            </div>`;
        app.attachEvents();
        app.updateTotalLabel();
    };
})();
