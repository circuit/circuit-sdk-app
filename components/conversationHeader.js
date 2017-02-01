Vue.component('cConversationHeader', {
    template: `
        <div class="media header">
          <c-avatar class="d-flex mr-3" size="large" :user="conversation.peerUser" :conversation="conversation"></c-avatar>
          <div class="media-body">
            <h3 class="mt-1 mb-1 fw4">{{conversation.title}}</h3>
            <div class="d-flex tabs">
              <button v-show="showParticipantsTab" class="btn btn-sm btn-link participants-popover-trigger  backdrop-close">{{conversation.participants && conversation.participants.length}} Member<span v-if="conversation.participants && conversation.participants.length > 1">s</span></button>
              <span v-show="showParticipantsTab" class="middot">&middot;</span>
              <button class="btn btn-sm btn-link details-popover-trigger backdrop-close">Details</button>
              <span class="middot">&middot;</span>
              <button v-show="conversation.type=='GROUP'" class="btn btn-sm btn-link schedule-popover-trigger backdrop-close">Schedule</button>
              <span v-show="conversation.type=='GROUP'" class="middot">&middot;</span>
              <button class="btn btn-sm btn-link files-popover-trigger backdrop-close">Files</button>
            </div>
          </div>
        </div>
    `,
    props: {
        conversation: {
            type: Object
        }
    },
    computed: {
        showParticipantsTab: function () {
            return this.conversation.participants && this.conversation.type !== 'DIRECT';
        }
    }
});