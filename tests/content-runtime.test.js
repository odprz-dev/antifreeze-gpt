(function() {
    const app = window.AntifreezeContent;
    const resultsNode = document.getElementById('results');
    const root = document.getElementById('conversation-root');
    const logs = [];
    let failed = false;

    function log(status, message) {
        logs.push(`${status} ${message}`);
    }

    function assert(condition, message) {
        if (!condition) {
            failed = true;
            log('FAIL', message);
            throw new Error(message);
        }

        log('PASS', message);
    }

    function resetRoot(count) {
        root.innerHTML = '';

        for (let i = 0; i < count; i += 1) {
            const article = document.createElement('article');
            article.textContent = `Message ${i + 1}`;
            root.appendChild(article);
        }
    }

    function renderResults() {
        resultsNode.textContent = logs.join('\n');
        resultsNode.className = failed ? 'fail' : 'pass';
    }

    try {
        assert(app.normalizeKeepLast('abc') === app.DEFAULT_KEEP_LAST, 'normalizeKeepLast falls back to default');
        assert(app.normalizeKeepLast('2') === app.MIN_KEEP_LAST, 'normalizeKeepLast clamps to minimum');
        assert(app.normalizeKeepLast('999') === app.MAX_KEEP_LAST, 'normalizeKeepLast clamps to maximum');

        resetRoot(0);
        assert(app.hasConversationMessages() === false, 'hasConversationMessages returns false when there are no articles');
        assert(app.isChatConversation() === false, 'isChatConversation returns false without route or messages');

        resetRoot(3);
        assert(app.hasConversationMessages() === true, 'hasConversationMessages returns true when articles exist');
        assert(app.isChatConversation() === true, 'isChatConversation falls back to DOM detection');
        assert(app.getMessages().length === 3, 'getMessages returns all chat articles');

        app.state.keepLast = 1;
        app.state.isPanic = false;
        app.runOptimization();

        const articlesAfterOptimize = app.getMessages();
        assert(articlesAfterOptimize[0].classList.contains('hidden-by-optimizer'), 'runOptimization hides older messages');
        assert(articlesAfterOptimize[1].classList.contains('hidden-by-optimizer'), 'runOptimization hides all but the configured tail');
        assert(!articlesAfterOptimize[2].classList.contains('hidden-by-optimizer'), 'runOptimization keeps the most recent message visible');

        app.state.isPanic = true;
        app.runOptimization();
        assert(articlesAfterOptimize.every((article) => !article.classList.contains('hidden-by-optimizer')), 'panic mode restores all messages');

        root.innerHTML = '';
        const strayHiddenNode = document.createElement('article');
        strayHiddenNode.className = 'hidden-by-optimizer';
        document.body.appendChild(strayHiddenNode);
        app.state.isPanic = false;
        app.runOptimization();
        assert(!strayHiddenNode.classList.contains('hidden-by-optimizer'), 'runOptimization clears stale hidden classes when no chat messages remain');
        strayHiddenNode.remove();

        log('PASS', 'All smoke tests completed');
    } catch (error) {
        console.error(error);
    }

    renderResults();
})();
