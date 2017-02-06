Vue.component('cAvatar', {
    template: `
        <span v-if="ready" class="avatar-component" :class="[size, clazz]">
            <img class="top left"  :class="{hide:!urls[0]}" :src="urls[0]"/>
            <img v-if="count>1" class="top right" :class="{hide:!urls[1]}" :src="urls[1]"/>
            <img v-if="count>2" class="bottom left"  :class="{hide:!urls[2]}" :src="urls[2]"/>
            <img v-if="count>3" class="bottom right"  :class="{hide:!urls[3]}" :src="urls[3]"/>
            <div v-if="presence" :class="presence.state"></div>
        </span>
    `,
    props: {
        user: {
            type: Object
        },
        conversation: {
            type: Object
        },
        size: {
            type: String,
            default: function () {
                return 'small';
            }
        }
    },
    computed: {
        ready: function () {
            return !!(this.conversation && this.conversation.participants) || this.user;
        },
        count: function () {
            if (this.user || this.conversation.type === 'DIRECT') {
                // User, or a direct conversation
                return 1;
            }
            if (this.conversation.hasGroupAvatar) {
                // Conversation has a group avatar
                return 1;
            }
            if (!this.conversation.participants) {
                return 0;
            }
            return Math.min(this.conversation.participants.length, 4);
        },
        presence: function () {
            return this.user && (this.user.presence || this.user.presenceState);
        },
        clazz: function () {
            return 'collage-' + this.count;
        },
        urls: function () {
            if (this.user) {
                return [this.size !== 'large' ? this.user.avatar : this.user.avatarLarge];
            }
            if (this.conversation.hasGroupAvatar) {
                return [this.size !== 'large' ? this.conversation.avatar : this.conversation.avatarLarge];
            }
            if (this.conversation.collageAvatars) {
                return this.conversation.collageAvatars.map(a => {
                    return this.size !== 'large' ? a.avatar : a.avatarLarge;
                });
            }
            return [];
        }
    }
});