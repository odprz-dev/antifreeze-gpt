(function() {
    const app = globalThis.AntifreezeContent = globalThis.AntifreezeContent || {};

    app.MIN_KEEP_LAST = 5;
    app.MAX_KEEP_LAST = 100;
    app.DEFAULT_KEEP_LAST = 10;
    app.OPTIMIZATION_DEBOUNCE_MS = 80;

    app.state = {
        view: 'MAIN',
        keepLast: app.DEFAULT_KEEP_LAST,
        isPanic: false,
        totalMsgs: 0,
        startTime: Date.now(),
        lastUrl: location.href,
        isVisible: true
    };

    app.runtime = {
        optimizerObserver: null,
        observedRoot: null,
        optimizationTimerId: null,
        isDragging: false,
        currentX: 0,
        currentY: 0,
        initialX: 0,
        initialY: 0,
        xOffset: 0,
        yOffset: 0
    };

    app.ICONS = {
        snow: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 21v-4.175l-3.2 1.85-1-1.725 3.2-1.85-3.2-1.85 1-1.725 3.2 1.85V9l-3.2-1.85 1-1.725 3.2 1.85V3h2v4.275l3.2-1.85 1 1.725L13.2 9v4.1l3.2-1.85 1 1.725-3.2 1.85 3.2 1.85-1 1.725-3.2-1.85V21h-2z"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
        back: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`
    };

    app.normalizeKeepLast = (value) => {
        const parsedValue = Number.parseInt(value, 10);

        if (!Number.isFinite(parsedValue)) {
            return app.DEFAULT_KEEP_LAST;
        }

        return Math.min(app.MAX_KEEP_LAST, Math.max(app.MIN_KEEP_LAST, parsedValue));
    };
})();
