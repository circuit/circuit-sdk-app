$(document).ready(function() {
    // Tooltip config
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]',
        delay: { show: 1000, hide: 100 }
    });

    $(document).on('click', function (e) {
        $('.participants, .details, .schedule, .files').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
                (($(this).popover('hide').data('bs.popover') || {}).inState || {}).click = false;
            }
        });
    });

    window.subjectEditor = new Quill('#subject-editor-container', {
        modules: {
            toolbar: '#subject-toolbar-container'
        },
        placeholder: 'Thread title',
        theme: 'snow'
    });

    var bindings = {
        // Add new 'enter' binding and propagate to quill
        enter: {
            key: 13,
            handler: function() {
                var elContent = document.querySelector('.main .content');
                window.requestAnimationFrame(_ => elContent.scrollTop = elContent.scrollHeight);
                return true;
            }
        }
    };

    window.mainEditor = new Quill('#editor-container', {
        modules: {
            toolbar: '#toolbar-container',
            keyboard: {
                bindings: bindings
            }
        },
        placeholder: '',
        theme: 'snow'
    });
    var toolbar = window.mainEditor.getModule('toolbar');
    toolbar.addHandler('link', function (value) {
        if (value) {
            var href = prompt('Enter the URL');
            this.quill.format('link', href);
        }
    });

    $('.participants').popover({
        placement: 'bottom',
        offset: '2 0',
        trigger: 'click',
        html: true,
        container: '#app',
        template: `
            <div class="popover" role="tooltip" style="width: 250px">
                <div class="arrow"></div>
                <h3 class="popover-title"></h3>
                <div class="popover-content" style="max-height: 450px">
                    <div class="data-content"></div>
                </div>
            </div>`,
        content: $('#participants-popover')
    }).on('show.bs.popover', function() {
        $('#participants-popover').addClass('show');
    }).on('hide.bs.popover', function() {
        $('#participants-popover').addClass('hide');
    });


    $('.details').popover({
        placement: 'bottom',
        offset: '2 0',
        trigger: 'click',
        html: true,
        container: '#app',
        template: `
            <div class="popover" role="tooltip" style="width: 350px; max-width: 350px">
                <div class="arrow"></div>
                <h3 class="popover-title"></h3>
                <div class="popover-content" style="max-height: 450px">
                    <div class="data-content"></div>
                </div>
            </div>`,
        content: $('#details-popover')
    }).on('show.bs.popover', function() {
        $('#details-popover').addClass('show');
    }).on('hide.bs.popover', function() {
        $('#details-popover').addClass('hide');
    });

    $('.schedule').popover({
        placement: 'bottom',
        offset: '2 0',
        trigger: 'click',
        html: true,
        container: '#app',
        template: `
            <div class="popover" role="tooltip" style="width: 550px; max-width: 550px">
                <div class="arrow"></div>
                <h3 class="popover-title"></h3>
                <div class="popover-content" style="max-height: 450px">
                    <div class="data-content"></div>
                </div>
            </div>`,
        content: $('#schedule-popover')
    }).on('show.bs.popover', function() {
        $('#schedule-popover').addClass('show');
    }).on('hide.bs.popover', function() {
        $('#schedule-popover').addClass('hide');
    });

    $('.files').popover({
        placement: 'bottom',
        offset: '2 0',
        trigger: 'click',
        html: true,
        container: '#app',
        template: `
            <div class="popover" role="tooltip" style="width: 250px">
                <div class="arrow"></div>
                <h3 class="popover-title"></h3>
                <div class="popover-content" style="max-height: 450px">
                    <div class="data-content"></div>
                </div>
            </div>`,
        content: $('#todo-popover')
    }).on('show.bs.popover', function() {
        $('#todo-popover').addClass('show');
    }).on('hide.bs.popover', function() {
        $('#todo-popover').addClass('hide');
    });

});

// Circuit client instance
var client = null;

// App
var app = new Vue({
    el: '#app',

    data: {
        showMainEditor: false,
        conversations: [],          // Cached conversations array
        usersHT: {},                // Cached user hashtable
        favorites: [],              // Favorites
        muted: [],                  // Muted (aka Archived) conversations
        flagged: [],                // Conversations with flagged messages
        filteredConversations: [],  // Conversations shown in selector
        conversation: {
            dialInDetails: {}
        },           // Selected conversation
        threads: [],                // Threads of selected conversation
        user: {},                   // Logged on user
        systems: [                  // Supported systems
            {domain: 'circuitsandbox.net', name: 'Sandbox', client_id: '06f08f1efbfc4f6d96f086a3677fad0f'},
            {domain: 'beta.circuit.com', name: 'Beta', client_id: '8d0572f9cc334c8287faf9e51e0ed871'},
            {domain: 'eu.yourcircuit.com', name: 'EU', client_id: '1b394869703e42ce9d4782c5f793ed95'},
            {domain: 'na.yourcircuit.com', name: 'NA', client_id: '', disabled: true},
            {domain: 'circuitdev.unify.com:8094', name: 'dev', client_id: '98d903b55aa4465aa9007081ffa80812'}
        ],
        system: null,               // Current system
        systemLoading: false,       // UI indicator for system loading spinner
        connectingSystem: '',       // UI text string for showing connecting system
        filters: [{                 // Supported filters
            id: 'unread',
            name: 'Unread Conversations'
        }, {
            id: 'direct',
            name: 'Direct Conversations'
        }, {
            id: 'group',
            name: 'Group Conversations'
        }, {
            id: 'favorites',
            name: 'Favorites'
        }, {
            id: 'flagged',
            name: 'Flagged Messages'
        }, {
            id: 'muted',
            name: 'Archived Conversations'
        }],
        feedLoadConfig: {
            commentsPerThread: 10,
            minTotalItems: 100,
            maxUnreadPerThread: 100
        },
        selectedFilter: null        // Selected conversation selector filter
    },

    created: function () {
        // On page load try to login to the previously logged in system
        // which is stored in localStorage. If no valid session & token
        // is present, the app should show a login button. Due to browser
        // security the OAuth popup cannot be triggered on page load
        // without a user action.
        // The `checkLogon` API can be used to verify if the login will
        // succeed, and if so the logon can be invoked immediately.
        let systemname = localStorage.getItem('system');
        if (systemname) {
            let system = this.getSystem(systemname);
            this.systemLoading = true;

            client = new Circuit.Client({
                domain: system.domain,
                client_id: system.client_id,
                scope: 'ALL'
            });

            // Temporary until all systems support logonCheck API
            !client.logonCheck && (client.logonCheck = _ => {
                return new Promise((resolve, reject) => {
                    reject();
                });
            })

            return client.logonCheck()
            .then(this.init.bind(null, system))
            .catch(console.info.bind(`Cannot auto logon to ${systemname}. Require user action to trigger OAuth popup.`));
        }
    },
    updated: function () {
    },
    computed: {
        filterDisplay: function () {
            return (this.selectedFilter && this.selectedFilter.id !== 'all') ? this.selectedFilter.name : '';
        },
        showParticipantsTab: function () {
            return this.conversation.participants && this.conversation.type !== 'DIRECT';
        },
        moderationEnabled: function () {
            let self = this;
            if (!this.conversation.moderators) {
                return false;
            }
            return this.conversation.moderators.some(function (elem) {
                return elem.userId === self.user.userId;
            });
        }
    },

    watch: {
        conversation: function (val) {
            let self = this;
            let c = val;

            // Hide editor until feed is rendered
            self.showMainEditor = false;
/*

            function setPresence(presence) {
                if (!Array.isArray(presence)) {
                    presence = [presence];
                }
                presence.forEach(p => {
                    if (self.usersHT[p.userId]) {
                        p.state = p.state.capitalizeFirstLetter();
                        self.usersHT[p.userId].presence = p;
                    }
                });
            }
*/
            // Different conversation is being selected. If not already
            // processed, fetch new users and add them to a hashtable
            // and to conversation.otherUsers
            if (!c.convId) {
                return;
            }

            // Clear editor. No support for drafts.
            mainEditor.setText('');
            subjectEditor.setText('');

            if (c.processed) {
                self.scrollToBottom();
                return;
            }

            console.log(`Processing new conversation ${val.convId}`);
            c.processed = true;

            // Fetch conversation threads with some items each
            client.getConversationFeed(c.convId, this.feedLoadConfig)
            // Reserve the threads
            .then(res => {
                let idx = this.conversations.findIndex(el => {
                    return el.convId === c.convId;
                });
                this.$set(this.conversations[idx], 'threads', res.threads.reverse());
                return c.threads = res.threads.reverse();
            })
            // Get all creatorIds
            .then(threads => {
                return threads.reduce((res, thread) => {
                    if (res.indexOf(thread.parentItem.creatorId) === -1) {
                        res.push(thread.parentItem.creatorId);
                    }
                    thread.comments && thread.comments.forEach(comment => {
                        if (res.indexOf(comment.creatorId) === -1) {
                            res.push(comment.creatorId);
                        }
                    });
                    self.scrollToBottom();

                    return res;
                }, [])
            })
            // Get the user object for the creators. If not yet in cache
            // fetch them from the server.
            .then(creatorIds => {
                let newUserIds = [], existingUsers = [];
                creatorIds.forEach(creatorId => {
                    let user = this.usersHT[creatorId];
                    if (user) {
                        existingUsers.push(user);
                    } else {
                        newUserIds.push(creatorId);
                    }
                });
                if (newUserIds.length) {
                    return new Promise((resolve, reject) => {
                        client.getUsersById(newUserIds)
                        .then(users => {
                            users.forEach(user => this.usersHT[user.userId] = user);
                            existingUsers.push.apply(existingUsers, users);
                            return resolve(existingUsers);
                        })
                        .catch(reject);
                    })
                } else {
                    return existingUsers;
                }
            })
            // Add users to cache, and also to their item object as `creator`
            .then(users => {
                users.forEach(user => {
                    this.usersHT[user.userId] = user;
                    c.threads.forEach(thread => {
                        thread.parentItem.creator = this.usersHT[thread.parentItem.creatorId];
                        thread.comments.forEach(comment => {
                            comment.creator = this.usersHT[comment.creatorId];
                        });
                    });
                });
                console.log(`Loaded ${users.length} users for conversation ${c.convId} when loading its items.`);
            })
            // Fetch the first 25 conversation participants so these are ready
            // when opening the participants popover. GetUsersById is less performant
            // than this API and does not support filtering.
            .then(client.getConversationParticipants.bind(null, c.convId, {pageSize: 25, includePresence: true}))
            .then(res => {
                c.participantList = res.participants.filter(p => { 
                    return !p.displayName.startsWith('_CMP') && !p.isDeleted;
                }).sort((a, b) => { 
                    return a.displayName.localeCompare(b.displayName);
                });
            })
            // Get Dial-in details for Schedule popover
            .then(client.getConversationDetails.bind(null, c.convId))
            .then(dialInDetails => {
                c.dialInDetails = dialInDetails
            })
            .catch(console.error);
        }
    },

    methods: {
        startThread: function () {
            let topic = subjectEditor.getText();
            topic = topic === '\n' ? undefined : topic;
            if (!topic) {
                alert('A topic is required when creating a new thread');
                return;
            }
            let text = mainEditor.root.innerHTML;
            text = text.replace('target="_blank"', '');
            let content = {
                subject: topic,
                content: text,
                contentType: Circuit.Constants.TextItemContentType.RICH
            }
            client.addTextItem(this.conversation.convId, content)
            .then(_ => {
                mainEditor.setText('');
                subjectEditor.setText('');
                console.log(`Started new thread on conversation ${this.conversation.convId}`);
            })
            .catch(console.error);
        },
        scrollToBottom: function () {
            let self = this;
            // Scroll to bottom of page and show editor
            var elContent = document.querySelector('.main .content');
            self.showMainEditor = true;
            window.requestAnimationFrame(_ => {
                elContent.scrollTop = elContent.scrollHeight;
            })
        },
        userIsModerator: function (user) {
            if (!user || !this.conversation.moderators) {
                return false;
            }
            return this.conversation.moderators.some(function (elem) {
                return elem.userId === user.userId;
            });
        },
        addUserToCache: function (user) {
            if (!this.usersHT[user.userId]) {
                this.usersHT[user.userId] = user;
            }
        },
        test: function() {

        },
        presenceText: function (p) {
            return p && (p.statusMessage || (p.state && p.state.capitalizeFirstLetter()));
        },
        content: function (s) {
            return s.replace(/<(hr[\/]?)>/gi, '<br>');
        },
        init: function (system) {
            // Show landing page
            this.clearSystem();
            this.systemLoading = true;
            this.connectingSystem = system.name;

            return client.logon()
            .then(user => {
                console.log(`Successfully authenticated as ${user.displayName}`);
                this.user = user;
                this.usersHT[user.userId] = user;
                return {numberOfConversations: 100, numberOfParticipants: 4};
            })
            .then(client.getConversations)
            .then(conversations => {
                this.conversations = conversations.reverse();
                this.conversation = this.conversations[0];
                this.setFilter('all');
                this.setSystem(system);
                this.systemLoading = false;
            })
            .catch(() => {
                this.systemLoading = false;
            });
        },
        setFilter: function (filter) {
            let conversations = [];
            this.selectedFilter = this.filters.find(s => { return s.id === filter; });
            switch (filter) {
                case 'unread':
                this.filteredConversations = this.conversations.filter(function (c) {return c.userData && (c.userData.unreadItems > 0);});
                break;
                case 'direct':
                this.filteredConversations = this.conversations.filter(function (c) {return c.type === 'DIRECT';});
                break;
                case 'group':
                this.filteredConversations = this.conversations.filter(function (c) {return c.type === 'GROUP' || c.type === 'COMMUNITY';});
                break;
                case 'favorites':
                this.retrieveFavorites().then(c => { this.filteredConversations = c; });
                break;
                case 'muted':
                this.retrieveMutedConversations().then(c => { this.filteredConversations = c; });
                break;
                case 'flagged':
                this.retrieveFlagged().then(c => { this.filteredConversations = c; });
                break;
                default:
                this.filteredConversations = this.conversations;
                break;
            }
            conversations.length && this.selectConversation(conversations[0]);
            return conversations;
        },
        selectConversation: function (c) {
            this.threads = [];
            this.conversation = c;
        },
        retrieveFavorites: function () {
            return client.getMarkedConversations()
            .then(res => { return res.favoriteConvIds; })
            .then(favs => {
                let promises = [];
                favs && favs.forEach(convId => promises.push(client.getConversationById(convId)));
                return Promise.all(promises);
            });
        },
        retrieveMutedConversations: function () {
            return client.getMarkedConversations()
            .then(res => { return res.mutedConvIds; })
            .then(muted => {
                let promises = [];
                muted && muted.forEach(convId => promises.push(client.getConversationById(convId)));
                return Promise.all(promises);
            });
        },
        retrieveFlagged: function () {
            return client.getFlaggedItems()
            .then(flaggedConvs => {
                if (!flaggedConvs) {
                    resolve([]);
                    return;
                }
                let promises = [];
                flaggedConvs
                .map(obj => { return obj.conversationId; })
                .forEach(convId => promises.push(client.getConversationById(convId)));
                return Promise.all(promises);
            });
        },
        clearCache: function () {
            this.users = {};
            this.conversations = [];
            this.favorites = [];
            this.muted = [];
            this.flagged = [];
            this.conversation = {};
            this.threads = [];
            this.user = null;
        },
        closePopover: function (e) {
            $(e.target).parents('.popover').popover('hide');
        },
        closeModal: function (e) {
            if (!e) return;
            let modal = e.target.closest('.modal');
            modal && $(modal).modal('hide');
        },
        setSystem: function(system) {
            this.system = system;
            localStorage.setItem('system', system.name);
        },
        getSystem: function(name) {
            return this.systems.find(s => { return s.name === name; });
        },
        clearSystem: function(name) {
            this.system = null;
            localStorage.removeItem('system');
        },
        logout: function (e) {
            this.closeModal(e);
            this.clearCache();
            client.revokeToken()
            .then(client.logout)
            .then(() => this.clearSystem());
        },
        switchSystem: function(name, e) {
            e && this.closeModal(e);
            this.clearCache();
            client && client.logout();

            let system = this.getSystem(name);

            // Create new client instance for the new system
            client = new Circuit.Client({
                domain: system.domain,
                client_id: system.client_id,
                scope: 'ALL'
            });
            app.init(system)
            .catch(console.error);
        },
        _processNewConversation: function (c) {

        }
    }
});