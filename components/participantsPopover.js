Vue.component('cParticipantsPopover', {
    template: `
        <div id="participants-popover" class="hide">
            <div v-for="p in conversation.participantList">
                <div class="media">
                    <c-avatar class="d-flex mr-2 mb-2" size="small" :user="p"></c-avatar>
                    <div class="media-body">
                        <h5 class="mt-1 mb-0 h5 fw4 ellipsis">{{p.displayName}}</h5>
                        <h5 class="h5 light ellipsis subtitle">{{presenceText(p.presenceState)}}</h5>
                    </div>
                </div>
            </div>
            <div v-if="conversation.participants && conversation.participants.length > 25" class="d-flex justify-content-center">
                <small>Load more (todo)</small>
            </div>
        </div>
    `,
    props: {
        conversation: {
            type: Object
        }
    },
    methods: {
        presenceText: function (p) {
            return p && (p.statusMessage || (p.state && p.state.capitalizeFirstLetter()));
        }
    },
    mounted: function () {
        $('.participants-popover-trigger').popover({
            placement: 'bottom',
            offset: '2 0',
            trigger: 'click',
            html: true,
            container: '#app',
            template: `
                <div class="popover" role="tooltip" style="width: 250px">
                    <div class="arrow"></div>
                    <h3 class="popover-title"></h3>
                    <div class="popover-content" style="max-height: 450px">
                        <div class="data-content"></div>
                    </div>
                </div>`,
            content: $('#participants-popover')
        }).on('show.bs.popover', function() {
            $('#participants-popover').addClass('show');
        }).on('hide.bs.popover', function() {
            $('#participants-popover').addClass('hide');
        });
    }
});