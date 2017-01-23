Vue.component('avatar', {
    template: `
        <span class="avatar-component" :class="size">
            <img :src="imgUrl"/>
            <div v-if="presence" :class="presence.state"></div>
        </span>
    `,
    props: {
        presence: {
            type: Object,
            default: function () {
                return {};
            }
        },
        size: {
            type: String,
            default: function () {
                return 'small';
            }
        },
        imgUrl: [String]
    }
});