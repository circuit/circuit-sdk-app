// Setup conversation injector (async) so all conversations returned in any API
// will contain a title attribute which is either the diplayName of a
// direct conversation peer, the topic of a group conversation (if given),
// or a list of the first 5 members firstnames
Circuit.Injectors.conversationInjector = conv => {
    conv.participantList = [];
    conv.dialInDetails = {
        isModerationAllowed: undefined
    };
    conv.isGuestAccessEnabled = !conv.isGuestAccessDisabled;
    conv.hasGroupAvatar = !!(conv.conversationAvatar && conv.conversationAvatar.largePictureId);
    conv.userData = conv.userData || {};
}


// Synchroneous item injector to add a `teaser` attribute to a text item
Circuit.Injectors.itemInjector = item => {
    item.creator = {};

    if (item.text) {
        if (item.text.state === 'DELETED') {
            item.teaser = 'Message deleted';
            return;
        }

        // Add "prettyprint" class to "pre" elements
        if (item.text.content.indexOf('<pre>') >= 0) {
            item.text.content = item.text.content.replace('<pre>', '<pre class="prettyprint">');
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