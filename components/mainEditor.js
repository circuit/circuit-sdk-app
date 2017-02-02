Vue.component('cMainEditor', {
    template: `
    <div> 
        <div class="d-flex justify-content-center">  
            <button class="btn btn-link btn-sm reply" v-if="!editorShown" v-on:click="showEditor">Start new thread</button>
        </div>
        <div v-show="editorShown"  class="main-editor-component">
            <div class="subject-editor">
                <div ref="subjectEditor" class="editor"></div>
            </div>
            <div class="content-editor">
                <div ref="contentEditor" class="editor"></div>
                <button type="button" class="btn btn-sm btn-outline-primary send" v-on:click="startThread">Send</button>
            </div>
        </div>
    </div>
    `,
    data: function () {
        return {
            editorShown: false,
            contentEditor: null,
            subjectEditor: null            
        }
    },
    created: function () {
        hub.$on('editor-shown', this.hideEditor);
        hub.$on('conversation-selected', this.hideEditor);
    },
    beforeDestroy: function () {
        hub.$off('editor-shown', this.hideEditor);
        hub.$off('conversation-selected', this.hideEditor);
    },
    mounted: function () {
        let self = this;

        var bindings = {
            // Add new 'enter' binding and propagate to quill
            enter: {
                key: 13,
                handler: _ => {
                    hub.$emit('scroll-feed', { bottom: true });
                    return true;
                }
            }
        };

        var toolbarOptions = [['bold', 'italic', { 'list': 'ordered'}, { 'list': 'bullet' }], ['code-block', 'link'], ['clean']];

        this.contentEditor = new Quill(this.$refs.contentEditor, {
            modules: {
                toolbar: toolbarOptions,
                keyboard: {
                    bindings: bindings
                }
            },
            placeholder: '',
            theme: 'snow'
        });

        var toolbar = this.contentEditor.getModule('toolbar');
        toolbar.addHandler('link', value => {
            if (value) {
                var href = prompt('Enter the URL');
                self.contentEditor.format('link', href);
            }
        });

        this.subjectEditor = new Quill(this.$refs.subjectEditor, {
            modules: {
                toolbar: false,
                keyboard: {
                    bindings: {
                        // Add new 'tab' binding to tab to main editor
                        tab: {
                            key: 9,
                            handler: _ => {
                                window.requestAnimationFrame(_ => self.$refs.contentEditor.querySelector('.ql-editor').focus());
                                return true;
                            }
                        }
                    }
                }
            },
            placeholder: 'Thread title',
            theme: 'snow'
        });

        this.$refs.contentEditor.parentNode.insertBefore(this.$refs.contentEditor, this.$refs.contentEditor.previousSibling);
    },
    methods: {
        showEditor: function () {
            this.editorShown = true;
            window.requestAnimationFrame(_ => this.$refs.subjectEditor.querySelector('.ql-editor').focus());
            hub.$emit('editor-shown', { type: 'post' });
            hub.$emit('scroll-feed', { bottom: true });
        },
        hideEditor: function (data) {
            if (!data || data.type !== 'post') {
               this.editorShown = false;
            }
        },
        startThread: function () {
            let topic = this.subjectEditor.getText();
            topic = topic.replace(/(\r\n|\n|\r)/gm,'');

            if (!topic) {
                // TODO: show inline error instead
                alert('A topic is required when creating a new thread');
                return;
            }
            let text = this.contentEditor.root.innerHTML;

            // Circuit server does not yet allow target="_blank". Ticket is open
            // against Circuit.
            text = text.replace('target="_blank"', '');

            // Remove "spellcheck" attribute as this is throwing an sanitization
            // error by Circuit server.
            text = text.replace(' spellcheck="false"', '');

            let content = {
                subject: topic,
                content: text,
                contentType: Circuit.Constants.TextItemContentType.RICH
            }

            this.$emit('start-thread', content, _ => this.clear());
        },
        clear: function () {
            this.contentEditor.setText('');
            this.subjectEditor.setText('');            
        }
    }
});