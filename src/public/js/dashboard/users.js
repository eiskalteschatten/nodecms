var _dashboardUsers = {
    init: function() {
        $('#accountForm').submit(function(e) {
            e.preventDefault();
            _forms.submitForm($(this), $(this).attr('method'));
        });

        $('#passwordForm').submit(function(e) {
            e.preventDefault();
            _forms.submitForm($(this), $(this).attr('method'));
        });

        $('#deleteUserButton').click(_dashboardUsers.delete);
    },

    delete: function(e) {
        e.preventDefault();

        if (confirm('Are you sure you want to delete this user? It cannot be undone.')) {
            _loader.open();

            $.ajax({
                url: '/dashboard/users/edit',
                method: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({
                    userName: $('#userName').val()
                })
            })
            .done(function() {
                window.location = '/dashboard/users/';
            })
            .fail(function(xhr, status, error) {
                _loader.close();
                _messages.show('error', xhr.responseText);
            });
        }
    }
}

$(document).ready(function() {
    _dashboardUsers.init();
});
