Vue.component('cMainEditor', {
    template: `
        <div class="main-editor-component">
            <div class="subject-editor">
                <div ref="subjectEditor" class="editor"></div>
            </div>
            <div class="content-editor">
                <div ref="contentEditor" class="editor"></div>

                <div class="toolbar">
                    <button class="ql-bold" data-toggle="tooltip" data-placement="top" title="Bold"></button>
                    <button class="ql-italic" data-toggle="tooltip" data-placement="top" title="Italic"></button>
                    <button class="ql-list" value="bullet" data-toggle="tooltip" data-placement="top" title="Bullet List"></button>
                    <button class="ql-list" value="ordered" data-toggle="tooltip" data-placement="top" title="Ordered List"></button>
                    <button class="ql-code-block ml-3" data-toggle="tooltip" data-placement="top" title="Code Block"></button>
                    <button class="ql-link" data-toggle="tooltip" data-placement="top" title="Insert link"></button>
                    <button class="ql-clean ml-3" data-toggle="tooltip" data-placement="top" title="Remove formatting"></button>
                    <button type="button" class="btn btn-sm btn-outline-primary send" v-on:click="startThread">Start new thread</button>
                </div>
            </div>
        </div>
    `,
    data: function () {
        return {
            contentEditor: null,
            subjectEditor: null            
        }
    },
    mounted: function () {
        let self = this;

        var bindings = {
            // Add new 'enter' binding and propagate to quill
            enter: {
                key: 13,
                handler: _ => {
                    this.$emit('scroll-feed', {bottom: true});
                    return true;
                }
            }
        };

        this.contentEditor = new Quill(this.$refs.contentEditor, {
            modules: {
                toolbar: '.main-editor-component .toolbar',
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
                this.quill.format('link', href);
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
    },
    methods: {
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