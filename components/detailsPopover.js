Vue.component('cDetailsPopover', {
    template: `
      <div id="details-popover" class="hide">
            <div class="small" v-if="conversation.type=='COMMUNITY'">
                <div class="entry">
                    <div class="label">Description:</div>
                    <div>{{conversation.description}}</div>
                </div>
            </div>
            <div class="small" v-if="conversation.dialInDetails && conversation.type=='GROUP'">
                <div class="form-check" :disabled="!moderationEnabled" v-if="conversation.dialInDetails.isModerationAllowed">
                    <label class="form-check-label">
                        <input class="form-check-input" type="checkbox" v-model="conversation.isModerated" :disabled="!moderationEnabled"><span class="chk-label">Moderated</span>
                    </label>
                </div>
                <div class="form-check">
                    <label class="form-check-label">
                        <input class="form-check-input" type="checkbox" v-model="conversation.isGuestAccessEnabled"><span class="chk-label">Guest Access Enabled</span>
                    </label>
                </div>
            </div>
            <div class="small" v-if="conversation.type=='DIRECT' && conversation.peerUser">
                <div class="entry" v-if="conversation.peerUser.company">
                    <div class="label">Company:</div>
                    <div>{{conversation.peerUser.company}}</div>
                </div>
                <div class="entry" v-if="conversation.peerUser.jobTitle">
                    <div class="label">Company:</div>
                    <div>{{conversation.peerUser.jobTitle}}</div>
                </div>
                <div class="entry" v-if="conversation.peerUser.phoneNumbers">
                    <div v-for="phone in conversation.peerUser.phoneNumbers">
                        <div class="label">{{phone.type.toTitleCase()}}:</div><span>{{phone.phoneNumber}}</span>
                    </div>
                </div>
            </div>
      </div>
    `,
    props: {
        conversation: {
            type: Object
        },
        user: {
            type: Object
        }
    },
    computed: {
        moderationEnabled: function () {
            let self = this;
            if (!this.conversation.moderators) {
                return false;
            }
            return this.conversation.moderators.some(function (elem) {
                return elem.userId === self.user.userId;
            });
        }
    },
    mounted: function () {
        $('.details-popover-trigger').popover({
            placement: 'bottom',
            offset: '2 0',
            trigger: 'click',
            html: true,
            container: '#app',
            template: `
                <div class="popover" role="tooltip" style="width: 350px; max-width: 350px">
                    <div class="arrow"></div>
                    <h3 class="popover-title"></h3>
                    <div class="popover-content" style="max-height: 450px">
                        <div class="data-content"></div>
                    </div>
                </div>`,
            content: $('#details-popover')
        }).on('show.bs.popover', function() {
            $('#details-popover').addClass('show');
        }).on('hide.bs.popover', function() {
            $('#details-popover').addClass('hide');
        });
    }
});