Vue.component('cSchedulePopover', {
    template: `
        <div id="schedule-popover" class="hide">
            <div v-if="conversation.dialInDetails" class="small">
                <div class="entry">
                    <div class="label">Guest Link:</div>
                    <a :href="conversation.dialInDetails.link">{{conversation.dialInDetails.link}}</a>
                </div>
                <div class="entry">
                    <div class="label">Bridge nunmbers:</div>
                    <div v-for="bridge in conversation.dialInDetails.bridgeNumbers">
                        <span>{{bridge.name || bridge.country}}: {{bridge.bridgeNumber}}</span>
                    </div>
                </div>
                <div class="entry">
                    <span class="label">Pin:</span><span>{{conversation.dialInDetails.pin}}</span>
                </div>
            </div>
        </div>
    `,
    props: {
        conversation: {
            type: Object
        }
    },
    mounted: function () {
        $('.schedule-popover-trigger').popover({
            placement: 'bottom',
            offset: '2 0',
            trigger: 'click',
            html: true,
            container: '#app',
            template: `
                <div class="popover" role="tooltip" style="width: 550px; max-width: 550px">
                    <div class="arrow"></div>
                    <h3 class="popover-title"></h3>
                    <div class="popover-content" style="max-height: 450px">
                        <div class="data-content"></div>
                    </div>
                </div>`,
            content: $('#schedule-popover')
        }).on('show.bs.popover', function() {
            $('#schedule-popover').addClass('show');
        }).on('hide.bs.popover', function() {
            $('#schedule-popover').addClass('hide');
        });
    }
});