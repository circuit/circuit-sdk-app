Vue.component('cTextItem', {
    template: `
        <div class="d-flex text-item-component">
            <a href="#">
                <c-avatar class="d-flex mr-2" size="small" :user="item.creator"></c-avatar>
            </a>
            <div class="media-body">
                <div class="d-flex justify-content-start">
                    <div class="name">{{item.creator.displayName}}</div>
                    <div class="ml-auto text-muted" :class="{'unread': isUnread}">{{item.creationTime | time}}</div>
                </div>
                <div v-html="item.text.content"></div>
                <c-item-actions v-if="!isDirect" :item="item"></c-item-actions>
            </div>
        </div>
    `,
    props: {
        item: {
            type: Object
        }
    },
    computed: {
        isDirect: function () {
            return app.conversation.type === 'DIRECT';
        },
        isUnread: function () {
            return this.item.creationTime > app.conversation.userData.lastReadTimestamp;
        }

    },
});