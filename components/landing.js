Vue.component('cLanding', {
    template: `
        <div class="no-system">
            <div class="center pb-4">
                <div class="display-4">Circuit SDK App</div>
                <p class="lead">Circuit-like app built with vue.js and Circuit JS SDK</p>
                <div class="mt-4">
                    <button type="button" class="btn btn-sm btn-outline-primary mr-1"
                        v-for="system in systems"
                        v-on:click="switchSystem(system.name)"
                        :disabled="system.disabled || systemLoading"
                        :class="{disabled: system.disabled || systemLoading}">{{system.name}}</button>
                </div>
                <div class="mt-4 spinner">
                    <i v-show="systemLoading" class="fa fa-spinner fa-spin"></i>
                </div>
                <div class="mt-1 message">
                    <transition name="fade">
                        <p class="lead" v-if="systemLoading && name">Hi {{name}}. Connecting to {{connectingSystemText}}...</p>
                    </transition>
                </div>
            </div>
            <nav class="navbar fixed-bottom navbar-light bg-faded">
                <span class="navbar-text text-center">
                    <a href="https://github.com/circuit/circuit-sdk-app" target="_blank">Fork this project on github</a>&middot;
                    <a href="mailto:roger.urscheler@unify.com">Feedback</a>&middot;
                    <a href="https://circuit.github.com" target="_blank">More info on Circuit SDK</a>
                </span>
            </nav>
        </div>
    `,
    data: function () {
        return {
            connectingTo: ''
        }
    },
    props: {
        systems: {
            type: Array
        },
        user: {
            type: Object
        },
        systemLoading: {
            type: Boolean,
            required:true
        },
        connectingSystem: {
            type: String
        }
    },
    computed: {
        connectingSystemText: function () {
            return this.connectingTo || this.connectingSystem;
        },
        name: function () {
            return this.user ? this.user.firstName : '';
        }
    },
    methods: {
        switchSystem: function (name) {
            this.connectingTo = name;
            this.$emit('switch-system', name);
        }
    }
});