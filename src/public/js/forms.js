var _forms = {
    submitForm: function($form, method) {
        var $buttons = $form.find('button');

        $buttons.prop('disabled', true);

        _loader.open();

        $.ajax({
            url: $form.attr('action'),
            method: method,
            data: $form.serialize()
        }).done(function(message) {
            if (typeof message === 'object') {
                _messages.show('success', message.message);

                if (message.callback) {
                    formCallback(message.object);
                }
            }
            else {
                _messages.show('success', message);
            }
        }).fail(function(message) {
            _messages.show('error', message.responseText);
        }).always(function() {
            $buttons.prop('disabled', false);
            _loader.close();
        });
    }
};
