(function() {
    const app = globalThis.AntifreezeContent;

    app.getConversationRoot = () => document.querySelector('main');

    app.hasConversationMessages = () => {
        const conversationRoot = app.getConversationRoot();
        return Boolean(conversationRoot?.querySelector('article'));
    };

    app.isChatConversation = () => (
        location.pathname.includes('/c/') || app.hasConversationMessages()
    );

    app.getMessages = () => {
        const conversationRoot = app.getConversationRoot();

        if (!conversationRoot) {
            return [];
        }

        return Array.from(conversationRoot.querySelectorAll('article'));
    };
})();
