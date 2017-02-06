Vue.component('cUsersList', {
    template: `
        <div>
            <template v-for="user in users">
                <div class="media mt-1">
                    <c-avatar class="d-flex mr-2 mb-2" size="tiny" :user="user"></c-avatar>
                    <div class="media-body">
                        <h5 class="mt-1 mb-0 h5 fw4 ellipsis">{{user.displayName}}</h5>
                    </div>
                </div>
            </template>
        </div>
    `,
    props: {
        users: {
            type: Array
        }
    }
});