Vue.component('cItemActions', {
    template: `
        <div class="item-actions-component d-flex justify-content-start text-muted">
            <div class="fa" :class="[likedByMe ? 'fa-heart' : 'fa-heart-o']" v-on:click="like"></div>
            <div ref="likes" class="likes backdrop-close" v-show="likes > 0" v-on:click="toggleLikesPopover($event)">{{likes}} like{{likes === 1 ? '' : 's'}}</div>

            <div ref="likesPopover" class="hide" style="min-width: 220px; width: 220px; max-height: 200px">
                <c-users-list :users="likeUsers"></c-users-list>
                <div v-if="likeUsers.length > 25" class="d-flex justify-content-center">
                    <small>and more</small>
                </div>
            </div>
        </div>
    `,
    data: function () {
        return {
            likeUsers: []
        }
    },
    props: {
        item: {
            type: Object
        }
    },
    created: function () {
        hub.$on('feed-scrolled', this.hideLikesPopover);
    },
    destroyed: function () {
        hub.$off('feed-scrolled');
    },
    computed: {
        likes: function () {
            return this.item.text.likedByUsers ? this.item.text.likedByUsers.length : 0;
        },
        likedByMe: function () {
            return this.item.text.likedByUsers && this.item.text.likedByUsers.indexOf(client.loggedOnUser.userId) >= 0;
        }
    },
    methods: {
        like: function () {
            let fn = this.likedByMe ? client.unlikeItem : client.likeItem;
            fn(this.item.itemId)
            .then(_ => console.log(`${this.likedByMe?'Unliked':'Liked'} item ${this.item.itemId}`))
            .catch(console.log);
        },
        hideLikesPopover: function () {
            if (this.$refs.likesPopover.classList.contains('show')) {
                this.$refs.likesPopover.classList.remove('show');
                $(this.$refs.likes).popover('dispose');
            }
        },
        toggleLikesPopover: function (e) {
            if (this.$refs.likesPopover.classList.contains('show')) {
                this.hideLikesPopover();
                return;
            }

            this.likeUsers = this.item.text.likedByUsers.map(userId => {
                return app.usersHT[userId];
            });

            $(this.$refs.likes).popover({
                placement: 'bottom',
                trigger: 'click',
                html: true,
                template: `
                    <div class="popover" role="tooltip" style="width: 220px">
                        <div class="arrow"></div>
                        <div class="popover-content" style="max-height: 200px; padding: 5px">
                            <div class="data-content"></div>
                        </div>
                    </div>`,
                content: $(this.$refs.likesPopover)
            }).on('show.bs.popover', _ => {
                this.$refs.likesPopover.classList.add('show');
            }).on('hide.bs.popover', _ => {
                this.$refs.likesPopover.classList.remove('show');
            }).popover('show');
        }
    }
});