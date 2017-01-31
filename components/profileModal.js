Vue.component('cProfileModal', {
    template: `
        <div ref="modal" class="modal left fade" id="profileModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header py-2 px-3">
                        <h4 class="modal-title">My Profile</h4>
                        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <div class="entry">
                            <div class="label"><span class="fa fa-exchange"></span>Switch system</div>
                        </div>
                        <div class="mt-2">
                            <button type="button" v-for="system in systems" v-on:click="switchSystem(system.name)" class="btn btn-sm btn-outline-primary mx-1 mb-1" :class="{disabled: system.disabled}">{{system.name}}</button>
                        </div>
                        <div class="entry">
                            <button type="button" v-on:click="logout" class="btn btn-sm btn-link px-0 mb-1"><span class="fa fa-sign-out"></span>Logout from {{system && system.name}}</button>
                        </div>
                        <p><br><br>
                        TODO:<br>
                        Set status message<br>
                        Edit profile picture<br>
                        Edit name, phone, etc<br>
                        Edit language<br>
                        Edit share preferences, etc<br>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        systems: {
            type: Array
        },
        system: {
            type: Object
        },
        user: {
            type: Object
        }
    },
    computed: {
    },
    methods: {
        switchSystem: function (name) {
            this.$emit('switch-system', name);
            $(this.$refs.modal).modal('hide');
        },
        logout: function (name) {
            this.$emit('logout');
            $(this.$refs.modal).modal('hide');
        }
    }
});