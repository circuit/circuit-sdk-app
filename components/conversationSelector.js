Vue.component('cConversationSelector', {
    template: `
        <ul class="chat">
          <li v-for="c in conversations" :key="c.convId" v-on:click="select(c)" :class="{selected: c.convId==conversation.convId, unread: c.userData.unreadItems>0}" class="left clearfix">
            <c-avatar size="large" :user="c.peerUser" :conversation="c"></c-avatar>
            <div class="chat-body clearfix">
              <div class="header ellipsis">
                <strong class="primary-font">{{c.title}}</strong>
              </div>
              <div class="teaser" v-if="c.topLevelItem">
                <p v-if="c.topLevelItem.text" class="ellipsis">{{c.topLevelItem.teaser}}</p>
              </div>
              <div class="info" v-if="c.topLevelItem">
                <small class="pull-right text-muted timestamp" v-if="filter!=='favorites'">
                  {{c.topLevelItem.creationTime | time}}
                </small>
              </div>
            </div>
          </li>
        </ul>
    `,
    data: function () {
        return {
            conversation: {},
            filter: ''
        }
    },
    props: {
        conversations: {
            type: Array
        }
    },
    methods: {
        select: function (c) {
            this.conversation = c;
            this.$emit('conversation-selected', c);
        },
        setFilter: function (id) {
            this.filter = id;
            this.conversations.length && (this.conversation = this.conversations[0]);

        }
    }
});