Vue.component('cFilesPopover', {
    template: `
        <div id="todo-popover" class="hide">
            <div ng-if="user">
                <span>TODO:</span>
            </div>
        </div>
    `,
    props: {
        conversation: {
            type: Object
        }
    },
    mounted: function () {
        $('.files-popover-trigger').popover({
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
            content: $('#todo-popover')
        }).on('show.bs.popover', function() {
            $('#todo-popover').addClass('show');
        }).on('hide.bs.popover', function() {
            $('#todo-popover').addClass('hide');
        });
    }
});