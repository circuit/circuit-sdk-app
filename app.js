$(document).ready(function() {
    // Tooltip config
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]',
        delay: { show: 1000, hide: 400 }
    });

    // Close popovers on backdrop click
    $(document).on('click', function (e) {
        $('.backdrop-close').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
                (($(this).popover('hide').data('bs.popover') || {}).inState || {}).click = false;
            }
        });
    });
});

// Circuit client instance
var client = null;

var hub = new Vue();

var config = {
    feedLoad: {
        commentsPerThread: 10,
        minTotalItems: 100,
        maxUnreadPerThread: 100
    },
    systems: [                  // Supported systems
        {domain: 'circuitsandbox.net', name: 'Sandbox', client_id: '20b41777208442eb9432d4aeb4a361b6'},
        {domain: 'beta.circuit.com', name: 'Beta', client_id: '8d0572f9cc334c8287faf9e51e0ed871'},
        {domain: 'eu.yourcircuit.com', name: 'EU', client_id: '1b394869703e42ce9d4782c5f793ed95'},
        {domain: 'na.yourcircuit.com', name: 'NA', client_id: '', disabled: true},
        {domain: 'circuitdev.unify.com:8094', name: 'dev', client_id: '98d903b55aa4465aa9007081ffa80812'}
    ],
    filters: [
        {id: 'unread', name: 'Unread Conversations'},
        {id: 'direct', name: 'Direct Conversations'},
        {id: 'group', name: 'Group Conversations'},
        {id: 'favorites', name: 'Favorites'},
        {id: 'flagged', name: 'Flagged Messages'},
        {id: 'muted', name: 'Archive'}
    ]
};

// App
var app = new Vue({
    el: '#app',

    data: {
        // Cache
        conversations: [],          // Cached conversations array
        convHT: [],                 // Cached conversation hashtable
        usersHT: {},                // Cached user hashtable
        favorites: [],              // Favorites
        muted: [],                  // Muted (aka Archived) conversations
        flagged: [],                // Conversations with flagged messages

        // Data
        conversation: {},           // Selected conversation
        user: {},                   // Logged on user
        telephonyConvId: null,
        supportConvId: null,

        // Login, systems
        systems: config.systems,
        system: null,               // Current system
        systemLoading: false,       // UI indicator for system loading spinner
        connectingSystem: '',       // UI text string for showing connecting system

        // Convversion filtering
        filters: config.filters,
        filteredConversations: [],  // Conversations shown in selector
        selectedFilter: 'all'       // Selected conversation filter ID
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

            client.logonCheck()
            .then(this.init.bind(null, system))
            .catch(err => {
                this.systemLoading = false;
                console.error(`Cannot auto logon to ${systemname}. Require user action to trigger OAuth popup.`);
            });
        }

        hub.$on('editor-shown', data => {
            if (data.type === 'post') {
                this.scrollToBottom(true);
            } else if (data.threadId && this.conversation.threads.length > 0) {
                // If this is the last thread, then scroll to the bottom
                if (this.conversation.threads[this.conversation.threads.length - 1].parentItem.itemId === data.threadId) {
                    this.scrollToBottom(true);
                }
            }
        });
        hub.$on('scroll-feed', data => {
            if (data.bottom) {
                this.scrollToBottom(true);
            }
        });
    },
    mounted: function () {
        let obj = document.querySelector('.content');
        throttle('scroll', 'scroll.throttled', obj);
        obj.addEventListener('scroll.throttled', _ => {
            hub.$emit('feed-scrolled')
        });
    },
    updated: function () {
        prettyPrint();
    },
    computed: {
        showParticipantsTab: function () {
            return this.conversation.participants && this.conversation.type !== 'DIRECT';
        }
    },
    watch: {
        conversation: function (val) {
        }
    },
    methods: {
        test: function () {
            client.revokeToken()
            .then(console.log)
            .catch(console.error)
        },
        init: function (system) {
            let self = this;
            // Show landing page
            this.clearSystem();
            this.systemLoading = true;
            this.connectingSystem = system.name;

            return client.logon()
            .then(user => {
                console.log(`Successfully authenticated as ${user.displayName}`);
                user.presence = user.userPresenceState;
                this.user = user;
                this.$set(this.usersHT, user.userId, user);
            })
            .then(this.addEventListeners)
            .then(_ => client.subscribePresence.bind(null, [self.user.userId]))
            .then(client.getConversations.bind(null, {numberOfConversations: 100, numberOfParticipants: 4}))
            .then(conversations => {
                this.conversations = conversations.reverse();
                this.conversations.forEach(c => this.convHT[c.convId] = c);
                this.conversation = this.conversations[0];
                this.$refs.filter.select('all');
                return this.conversations;
            })
            .then(this.processConversations)
            .then(conversations => {
                this.$refs.selector.select(conversations[0]);
                this.setSystem(system);
                this.systemLoading = false;
            })
            .then(this.filterSpecialConversations)
            .then(client.setPresence.bind(null, {state: Circuit.Enums.PresenceState.AVAILABLE}))
            .then(_ => { return client.getPresence([this.user.userId]); })
            .then(p => this.$set(this.usersHT[p[0].userId], 'presence', p[0]))
            .catch(_ => this.systemLoading = false);
        },
        addEventListeners: function () {
            client.addEventListener('userPresenceChanged', evt => {
                let user = this.usersHT[evt.presenceState.userId];
                if (user) {
                    this.$set(user, 'presence', evt.presenceState);
                }
            });

            client.addEventListener('itemAdded', this.handleItem);
            client.addEventListener('itemUpdated', this.handleItem);

            client.addEventListener('conversationUpdated', evt => {
                let c = evt.conversation;
            });
        },
        handleItem: function (evt) {
            // If the item is for the selected conversation, then
            // update it. Otherwise mark the conversation as dirty
            // so the next time it is loaded the conversation is
            // fetched again. This is not the best solution performance
            // or bandwidth wise, but will do for this example app.
            let item = evt.item;
            let c = this.convHT[item.convId];
            if (!c) {
                return;
            }
            if (this.conversation.convId === item.convId) {
                this.retrieveConversationFeed(c);
            } else {
                c.dirty = true;
            }

            if (evt.type === 'itemAdded') {
                // Update topLevelItem
                c.topLevelItem = item;
                c.userData.unreadItems++;
                c.lastItemModificationTime = item.modificationTime;
                this.sortConversations();
            }
        },
        sortConversations: function () {
            this.conversations = this.conversations.sort((a, b) => { 
                return b.topLevelItem.creationTime - a.topLevelItem.creationTime;
            });
        },
        // Fetch most recent conversation threads with a few items each,
        // reverse the threads and process any new creators.
        retrieveConversationFeed: function (c) {
            let self = this;
            return client.getConversationFeed(c.convId, config.feedLoad)
            // Reserve the threads
            .then(res => {
                this.$set(this.convHT[c.convId], 'threads', res.threads.reverse());
                !c.processed && this.scrollToBottom();
                return c.threads = res.threads.reverse();
            })
            // Get all creatorIds
            .then(threads => {
                let users = threads.reduce((res, thread) => {
                    if (res.indexOf(thread.parentItem.creatorId) === -1) {
                        res.push(thread.parentItem.creatorId);
                    }
                    thread.comments && thread.comments.forEach(comment => {
                        if (res.indexOf(comment.creatorId) === -1) {
                            res.push(comment.creatorId);
                        }
                    });
                    return res;
                }, []);

                return users;
            })
            // Get the user object for the creators. If not yet in cache
            // fetch them from the server.
            .then(self.processUsers)
            // Set the creator object on the post and comments
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
            })
            .then(_ => c.dirty = false);
        },
        processConversations: function (convs) {
            let self = this;
            // Add new conversations to the cache and looks up
            // new users for direct conversations
            return new Promise((resolve, reject) => {
                let newUserIds = [];
                convs.forEach(c => {
                    if (this.convHT[c.convId]) {
                        // Conversation is already in the cache, update it instead
                        c = this.convHT[c.convId];
                    }
                    if (c.type === Circuit.Enums.ConversationType.DIRECT) {
                        let peerUserId = c.participants.filter(p => { 
                            return p !== client.loggedOnUser.userId;
                        })[0];
                        if (!self.usersHT[peerUserId]) {
                            newUserIds.push(peerUserId);
                            c.peerUserId = peerUserId;
                        }
                    } else {
                        // Group conversation. Get first few users for the avatar
                        // in the left pane.
                        Array.prototype.push.apply(newUserIds, c.participants.slice(0, Math.min(c.participants.length, 4)));
                    }
                })

                // workaround for the backend issue in getUsersById with purged users
                newUserIds = newUserIds.filter(uid => { return uid !== 'a932a8f7-d847-4e05-bc20-0442281a9d12'; })

                // Use conversation from cache since that's the one we updated
                convs = convs.map(c => {
                    return this.convHT[c.convId] || c;
                });

                self.processUsers(newUserIds)
                .then(_ => {
                    convs.forEach(c => {
                        if (c.peerUserId) {
                            c.peerUser = self.usersHT[c.peerUserId];
                            // TODO: Don't copy those. Instead looks them up in the userHT when needed
                            c.avatarLarge = c.peerUser && c.peerUser.avatarLarge;
                            c.avatar = c.peerUser && c.peerUser.avatar;
                            c.title = c.peerUser && c.peerUser.displayName;
                        }
                        if (c.type !== Circuit.Enums.ConversationType.DIRECT) {
                            if (!c.hasConversationAvatar) {
                                // Get avatars of first four users
                                let collageAvatars = c.participants.slice(0, 4).map(p => {
                                    let user = this.usersHT[p];
                                    return {
                                        avatar: user.avatar,
                                        avatarLarge: user.avatarLarge
                                    };
                                });
                                this.$set(c, 'collageAvatars', collageAvatars);
                            }
                            c.title = c.topic || c.topicPlaceholder || this.getFirstnames(c, 4).join(', ');
                            
                        }
                    });
                    resolve(convs);
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                });
            });
        },
        getFirstnames: function (conversation, howMany) {
            return conversation.participants.slice(0, howMany).map(p => {
                let user = this.usersHT[p];
                return (user && user.firstName) || '';
            });
        },
        processUsers: function (userIds) {
            let self = this;
            // Add the new users to the cache, get their
            // presence and suscribe to their presence.
            // In a production app the subscriptions should
            // be limited in some way.
            return new Promise((resolve, reject) => {
                let newUserIds = [], existingUsers = [];
                userIds.forEach(userId => {
                    let user = this.usersHT[userId];
                    if (user) {
                        existingUsers.push(user);
                    } else {
                        newUserIds.push(userId);
                    }
                });
                if (newUserIds.length) {
                    // Limit getting more than 100 users at a time
                    return client.getUsersById(newUserIds)
                    .then(users => {
                        console.log(`Retrieved ${users.length} users from server`);
                        users.forEach(user => this.$set(this.usersHT, user.userId, user));
                        Array.prototype.push.apply(existingUsers, users);
                    })
                    .then(client.getPresence.bind(null, newUserIds))
                    .then(presence => {
                        console.log(`Retrieved and subscribing presence for ${presence.length} users from server`);
                        if (!Array.isArray(presence)) {
                            presence = [presence];
                        }
                        presence.forEach(p => {
                            if (this.usersHT[p.userId]) {
                                this.$set(this.usersHT[p.userId], 'presence', p);
                            }
                        });
                    })
                    .then(client.subscribePresence.bind(null, newUserIds))
                    .then(_ => resolve(existingUsers))
                    .catch(reject);
                } else {
                    resolve(existingUsers);
                }
            });
        },
        filterSpecialConversations: function () {
            return new Promise((resolve, reject) => {
                let promises = [];
                promises.push(client.getTelephonyConversationId());
                promises.push(client.getSupportConversationId());
                Promise.all(promises)
                .then(res => {
                    [this.telephonyConvId, this.supportConvId] = res;
                    resolve(res);
                })
                .catch(reject)
            });
        },
        startThread: function (content, cb = _ => {}) {
            client.addTextItem(this.conversation.convId, content)
            .then(_ => {
                cb();
                console.log(`Started new thread on conversation ${this.conversation.convId}`);
            })
            .catch(cb);
        },
        scrollToBottom: function (animate) {
            let self = this;
            // Scroll to bottom of page and show editor
            var elContent = document.querySelector('.main .content');
            window.requestAnimationFrame(_ => {
                $('.main .content').animate({ scrollTop: elContent.scrollHeight }, animate ? 500 : 0);
            });

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
        content: function (s) {
            return s.replace(/<(hr[\/]?)>/gi, '<br>');
        },
        onFilterChanged: function (filter) {
            let conversations = [];
            this.selectedFilter = filter;
            switch (filter) {
                case 'unread':
                this.filteredConversations = this.conversations.filter(function (c) {return c.userData && (c.userData.unreadItems > 0);});
                this.$refs.selector.setFilter(filter);
                break;
                case 'direct':
                this.filteredConversations = this.conversations.filter(function (c) {return c.type === 'DIRECT';});
                this.$refs.selector.setFilter(filter);
                break;
                case 'group':
                this.filteredConversations = this.conversations.filter(function (c) {return c.type === 'GROUP' || c.type === 'COMMUNITY';});
                this.$refs.selector.setFilter(filter);
                break;
                case 'favorites':
                this.retrieveFavorites().then(c => {
                    this.filteredConversations = c;
                    // Only set the filter now, after having filtered the conversations
                    this.$refs.selector.setFilter(filter);
                });
                break;
                case 'muted':
                this.retrieveMutedConversations().then(c => {
                    this.filteredConversations = c;
                    this.$refs.selector.setFilter(filter);
                });
                break;
                case 'flagged':
                this.retrieveFlagged().then(c => {
                    this.filteredConversations = c;
                    this.$refs.selector.setFilter(filter);
                });
                break;
                default:
                this.filteredConversations = this.conversations;
                this.$refs.selector.setFilter(filter);
                break;
            }
            return conversations;
        },
        onConversationSelected: function (c) {
            hub.$emit('conversation-selected', { old: this.conversation, new: c });

            this.conversation = c;

            // Clear editor. No support for drafts.
            this.$refs.mainEditor.clear();

            // For now, scroll to bottom if this is the first time
            // this conversation is selected
            if (c.processed && !c.dirty) {
                this.scrollToBottom();
                return;
            }

            // Fetch the first 25 conversation participants so these are ready
            // when opening the participants popover. GetUsersById is less performant
            // than this API and does not support filtering.
            return this.retrieveConversationFeed(c)
            .then(_ => this.scrollToBottom())
            .then(client.getConversationParticipants.bind(null, c.convId, {pageSize: 25, includePresence: true}))
            .then(res => {
                c.participantList = res.participants.filter(p => { 
                    return !p.isCMP && !p.isPending && !p.isDeleted;
                }).sort((a, b) => { 
                    return a.displayName.localeCompare(b.displayName);
                });
            })
            // Get Dial-in details for Schedule popover
            .then(client.getConversationDetails.bind(null, c.convId))
            .then(dialInDetails => {
                c.dialInDetails = dialInDetails;
                c.dirty = false;
                c.processed = true;
            })
            .catch(console.error);
        },
        retrieveFavorites: function () {
            return client.getMarkedConversations()
            .then(res => { return res.favoriteConvIds; })
            .then(favs => {
                let promises = [];
                favs && favs.forEach(convId => promises.push(client.getConversationById(convId)));

                return Promise.all(promises)
                .then(this.processConversations);
            });
        },
        retrieveMutedConversations: function () {
            return client.getMarkedConversations()
            .then(res => { return res.mutedConvIds; })
            .then(muted => {
                let promises = [];
                muted && muted.forEach(convId => promises.push(client.getConversationById(convId)));
                return Promise.all(promises)
                .then(this.processConversations);
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
                return Promise.all(promises)
                .then(this.processConversations);
            });
        },
        clearCache: function () {
            this.usersHT = {};
            this.conversations = [];
            this.convHT = {};
            this.favorites = [];
            this.muted = [];
            this.flagged = [];
            this.conversation = {};
            this.user = null;
        },
        closePopover: function (e) {
            $(e.target).parents('.popover').popover('hide');
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
            this.clearCache();
            client.revokeToken()
            .then(client.logout)
            .then(() => this.clearSystem());
        },
        switchSystem: function(name, e) {
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
        scrollFeed: function () {
            var elContent = document.querySelector('.main .content');
            window.requestAnimationFrame(_ => elContent.scrollTop = elContent.scrollHeight);
        }
    }
});