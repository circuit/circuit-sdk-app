// Setup conversation injector (async) so all conversations returned in any API
// will contain a title attribute which is either the diplayName of a
// direct conversation peer, the topic of a group conversation (if given),
// or a list of the first 5 members firstnames
Circuit.Injectors.conversationInjector = conv => {
    return new Promise((resolve, reject) => {
        conv.participantList = [];
        conv.dialInDetails = {
            isModerationAllowed: undefined
        };
        conv.isGuestAccessEnabled = !conv.isGuestAccessDisabled;

        if (conv.topic || conv.topicPlaceholder) {
            // Group conversation. Named or server-computed string
            // of first 5 participant firstnames
            conv.title = conv.topic || conv.topicPlaceholder;
            resolve(conv);
            return;
        } else if (conv.type === Circuit.Enums.ConversationType.DIRECT) {
            let peerUserId = conv.participants.filter(p => { return p !== client.loggedOnUser.userId; });
            client.getUsersById(peerUserId)
            .then(users => {
                conv.peerUser = users[0];
                conv.avatarLarge = conv.peerUser.avatarLarge;
                conv.avatar = conv.peerUser.avatar;
                conv.title = conv.peerUser.displayName;
                resolve(conv);
            })
            .catch(reject);
        } else {
            conv.topic = 'unknown';
            resolve(conv);
        }
    });
}


// Synchroneous item injector to add a `teaser` attribute to a text item
Circuit.Injectors.itemInjector = item => {
    item.creator = {};

    if (item.text) {
        if (item.text.state === 'DELETED') {
            item.teaser = 'Message deleted';
            return;
        }
        // Limit subject or content to 100 char, but first remove html tags
        // if content is used.
        let len = 50;
        item.teaser = item.text.subject || $('<p>' + item.text.content + '</p>').text();
        if (item.teaser.length > len) {
            item.teaser = `${item.teaser.slice(0, len - 3)}...`;
        }

        // If no subject or content, but an attachment, then use the filenames
        if (!item.teaser && item.attachments && item.attachments.length) {
            item.teaser = item.attachments.slice(0, 3).map(a => {
                return a.fileName;
            }).join(', ');
            if (item.attachments.length > 3) {
                item.teaser = `${item.teaser} +${item.attachments.length - 3} more`;
            }
        }
    } else if (item.system) {
        item.teaser = 'system';
    } else if (item.rtc) {
        item.teaser = 'rtc';
    }
}

//Circuit.Injectors.userInjector = user => {
//}

String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}