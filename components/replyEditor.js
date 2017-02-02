Vue.component('cReplyEditor', {
    template: `
        <div class="reply-editor-component">
            <div class="content-editor">
                <div ref="contentEditor" class="editor"></div>
                <button type="button" class="btn btn-sm btn-outline-primary send" v-on:click="reply">Send</button>
            </div>
        </div>
    `,
    data: function () {
        return {
            contentEditor: null         
        }
    },
    mounted: function () {
        let self = this;

        var toolbarOptions = [['bold', 'italic', { 'list': 'ordered'}, { 'list': 'bullet' }], ['code-block', 'link'], ['clean']];

        this.contentEditor = new Quill(this.$refs.contentEditor, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: '',
            theme: 'snow'
        });

        var toolbar = this.contentEditor.getModule('toolbar');
        toolbar.addHandler('link', value => {
            if (value) {
                var href = prompt('Enter the URL');
                this.contentEditor.format('link', href);
            }
        });

        window.requestAnimationFrame(_ => self.$refs.contentEditor.querySelector('.ql-editor').focus());

        this.$refs.contentEditor.parentNode.insertBefore(this.$refs.contentEditor, this.$refs.contentEditor.previousSibling);
    },
    methods: {
        reply: function () {
            let text = this.contentEditor.root.innerHTML;

            // Circuit server does not yet allow target="_blank". Ticket is open
            // against Circuit.
            text = text.replace('target="_blank"', '');

            // Remove "spellcheck" attribute as this is throwing an sanitization
            // error by Circuit server.
            text = text.replace(' spellcheck="false"', '');

            let content = {
                content: text,
                contentType: Circuit.Constants.TextItemContentType.RICH
            }

            this.$emit('reply', content, _ => this.clear());
        },
        clear: function () {
            this.contentEditor.setText('');         
        }
    }
});