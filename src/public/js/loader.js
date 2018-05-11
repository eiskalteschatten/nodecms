var _loader = {
    init: function() {
        $(document).on('click', '.use-loader', function() {
            _loader.open();
        });
    },
    open: function() {
        UIkit.notification({
            'message': $('#ajaxLoader').html(),
            'timeout': 1000000000    // Because the notification shouldn't disappear, but there's no option to disable the timeout
        });
    },
    close: function() {
        UIkit.notification.closeAll();
    }
};
