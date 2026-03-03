(function() {
    const app = globalThis.AntifreezeContent;

    app.loadSettings = (onReady) => {
        chrome.storage.local.get(['keepLast'], (res) => {
            app.state.keepLast = app.normalizeKeepLast(res.keepLast);
            onReady();
        });
    };

    app.saveKeepLast = () => {
        chrome.storage.local.set({ keepLast: app.state.keepLast });
    };
})();
