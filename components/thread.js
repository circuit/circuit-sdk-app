Vue.component('cThread', {
    template: `
    <li class="thread-component" :key="thread.parentItem.itemId" :id="thread.parentItem.itemId">
        <c-avatar class="d-flex mr-2" size="small" :user="thread.parentItem.creator"></c-avatar>
        <div>
            <h4 v-if="thread.parentItem.text.subject" class="mt-0 mb-2 fw4">{{thread.parentItem.text.subject}}</h4>
            <div class="post">
                <div class="d-flex justify-content-start">
                    <div class="name">{{thread.parentItem.creator.displayName}}</div>
                    <div class="ml-auto text-muted" :class="{'unread': isUnread}">{{thread.parentItem.creationTime | time}}</div>
                </div>
                <div v-html="thread.parentItem.text.content"></div>
                <c-item-actions v-if="!isDirect" :item="thread.parentItem"></c-item-actions>
            </div>
            <div class="comments media mt-3"
                v-if="thread.comments && thread.comments.length > 0"
                v-for="comment in thread.comments">
                <c-text-item :item="comment" :ctype="ctype"></c-text-item>
            </div>
            <button class="btn btn-link btn-sm reply" v-if="!editorShown" v-on:click="showEditor"><span class="fa fa-reply"></span>Reply to thread</button>
            <c-reply-editor v-else v-on:reply="reply"></c-reply-editor>
        </div>
    </li>
    `,
    data: function () {
        return {
            editorShown: false
        }
    },
    props: {
        thread: {
            type: Object
        }
    },
    computed: {
        isDirect: function () {
            return app.conversation.type === 'DIRECT';
        },
        isUnread: function () {
            return this.thread.parentItem.creationTime > app.conversation.userData.lastReadTimestamp;
        }
    },
    created: function () {
        hub.$on('conversation-selected', this.hideEditor);
        hub.$on('editor-shown', this.hideEditor);
    },
    beforeDestroy: function () {
        hub.$off('conversation-selected', this.hideEditor);
        hub.$off('editor-shown', this.hideEditor);
    },
    methods: {
        showEditor: function () {
            this.editorShown = true;
            hub.$emit('editor-shown', { type: 'reply',  threadId: this.thread.parentItem.itemId });
        },
        hideEditor: function (data) {
            if (!data || !data.threadId || data.threadId !== this.thread.parentItem.itemId) {
               this.editorShown = false;
            }
        },
        reply: function (content, cb = _ => {}) {
            content.parentId = this.thread.parentItem.itemId;
            client.addTextItem(this.thread.parentItem.convId, content)
            .then(_ => {
                this.editorShown = false;
                cb();
                console.log(`Sent reply on thread ${this.thread.parentItem.itemId} of conversation ${this.thread.parentItem.convId}`);
            })
            .catch(cb);
        }
    }
});