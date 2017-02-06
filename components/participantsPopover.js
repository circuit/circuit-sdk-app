Vue.component('cParticipantsPopover', {
    template: `
        <div id="participants-popover" class="hide">
            <c-users-list :users="conversation.participantList"></c-users-list>
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
                <div class="popover" role="tooltip" style="width: 220px">
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