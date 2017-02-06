Vue.component('cLikesPopover', {
    template: `
        <div id="likes-popover" class="hide">
        test
            <div v-for="user in users">
                <span>{{user}}</span>
            </div>
        </div>
    `,
    data: function () {
        return {
            users: []
        }
    },
    created: function () {
        hub.$on('show-likes-popover', this.show);
    },
    mounted: function () {

    },
    methods: {
        show: function (data) {
            this.users = data.users;
        $(data.target).popover({
            placement: 'right',
            template: `
                <div ref="likePopover" class="popover aaa" role="tooltip" style="width: 250px">
                    <div class="arrow"></div>
                    <h3 class="popover-title"></h3>
                    <div class="popover-content" style="max-height: 450px">
                        <div class="data-content"></div>
                    </div>
                </div>`,
            content: $('#likes-popover')
        }).on('show.bs.popover', function() {
            $('#likes-popover').addClass('show');
        }).on('hide.bs.popover', function() {
            $('#likes-popover').addClass('hide');
        });

            $('#likes-popover').addClass('show');
            window.setTimeout(_ => {
       //         data.target.parentNode.append(document.querySelector('.aaa'))
            },300)
        }
    }
});