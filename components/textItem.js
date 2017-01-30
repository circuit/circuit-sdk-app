Vue.component('cTextItem', {
    template: `
        <div>
            <a class="d-flex" href="#">
                <c-avatar class="d-flex mr-2" size="small" :user="item.creator"></c-avatar>
            </a>
            <div class="media-body">
                <div v-html="item.text.content"></div>
            </div>
        </div>
    `,
    props: {
        item: {
            type: Object
        }
    }
});