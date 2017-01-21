Vue.filter('linkify', {
    read: function(val) {
        return linkifyHtml(val, {
            defaultProtocol: 'https'
        });
    },
});

moment.updateLocale('en', {
    calendar : {
        lastDay : '[Yesterday at] LT',
        sameDay : 'LT',
        lastWeek : 'ddd LT',
        sameElse : 'MMM D'
    }
});

Vue.filter('time', function (value) {
    return moment(value).calendar();
});
