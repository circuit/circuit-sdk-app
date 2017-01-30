Vue.component('cThread', {
    template: `
    <li class="media" :key="thread.parentItem.itemId" :id="thread.parentItem.itemId">
        <c-avatar class="d-flex mr-2" size="small" :user="thread.parentItem.creator"></c-avatar>
        <div class="media-body">
            <h4 v-if="thread.parentItem.text.subject" class="mt-0 mb-2 fw4">{{thread.parentItem.text.subject}}</h4>
            <div v-html="thread.parentItem.text.content"></div>
            <div class="media mt-3"
                v-if="thread.comments && thread.comments.length > 0"
                v-for="comment in thread.comments">
                <c-text-item :item="comment"></c-text-item>
            </div>
            <button class="btn btn-link btn-sm reply" v-on:click="reply"><span class="fa fa-reply"></span>Reply to thread</button>
        </div>
    </li>
    `,
    props: {
        thread: {
            type: Object
        }
    },
    computed: {
    },
    methods: {
        reply: function () {

        }
    }
});