(function() {
    const app = globalThis.AntifreezeContent;

    function ensureInjected() {
        if (!document.getElementById('antifreeze-root')) {
            document.body.appendChild(app.container);
            app.render();
        }

        app.container.style.display = app.state.isVisible ? 'block' : 'none';
    }

    function init() {
        ensureInjected();

        document.addEventListener('mouseup', app.dragEnd, false);
        document.addEventListener('mousemove', app.drag, false);

        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === 'toggle-ui') {
                app.state.isVisible = !app.state.isVisible;
                app.container.style.display = app.state.isVisible ? 'block' : 'none';
            }
        });

        app.runtime.optimizerObserver = new MutationObserver(() => {
            ensureInjected();
            app.syncUrlState();
            app.observeDomChanges();
            app.scheduleOptimization();
        });

        app.runtime.observedRoot = null;
        app.observeDomChanges();
        app.scheduleOptimization();

        setInterval(() => {
            app.syncUrlState();

            const timer = app.shadow.getElementById('ui-timer');
            if (timer) {
                timer.innerText = app.formatTime(Date.now() - app.state.startTime);
            }
        }, 1000);
    }

    app.loadSettings(init);
})();
