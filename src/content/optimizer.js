(function() {
    const app = globalThis.AntifreezeContent;

    app.clearOptimization = () => {
        document.querySelectorAll('.hidden-by-optimizer').forEach((message) => {
            message.classList.remove('hidden-by-optimizer');
        });
    };

    app.scheduleOptimization = () => {
        if (app.runtime.optimizationTimerId) {
            window.clearTimeout(app.runtime.optimizationTimerId);
        }

        app.runtime.optimizationTimerId = window.setTimeout(() => {
            app.runtime.optimizationTimerId = null;
            app.runOptimization();
        }, app.OPTIMIZATION_DEBOUNCE_MS);
    };

    app.runOptimization = () => {
        const messages = app.getMessages();
        app.state.totalMsgs = messages.length;

        if (!app.isChatConversation() || messages.length === 0) {
            app.clearOptimization();
            app.updateTotalLabel();
            return;
        }

        messages.forEach((message, index) => {
            const shouldHide = !app.state.isPanic && index < messages.length - app.state.keepLast;
            message.classList.toggle('hidden-by-optimizer', shouldHide);
        });

        app.updateTotalLabel();
    };

    app.syncUrlState = () => {
        if (location.href === app.state.lastUrl) {
            return;
        }

        app.state.lastUrl = location.href;
        app.state.startTime = Date.now();
        app.state.isPanic = false;
        app.state.totalMsgs = 0;
        app.render();
        app.observeDomChanges();
    };

    app.observeDomChanges = () => {
        const nextRoot = app.getConversationRoot() || document.body;

        if (!app.runtime.optimizerObserver || app.runtime.observedRoot === nextRoot) {
            return;
        }

        app.runtime.optimizerObserver.disconnect();
        app.runtime.observedRoot = nextRoot;
        app.runtime.optimizerObserver.observe(nextRoot, { childList: true, subtree: true });
    };
})();
