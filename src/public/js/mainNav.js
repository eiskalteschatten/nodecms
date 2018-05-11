var _mainNav = {
    init: function() {
        $(document).on('beforeshow', '#mobileMenu', function() {
            var $mobileMenuAnchor = $('#mobileMenuAnchor');

            if ($mobileMenuAnchor.attr('data-empty') === 'true') {
                var $navLinks = $('#mainNavLinks').clone();
                $navLinks.find('.remove-mobile').remove();
                $mobileMenuAnchor.html($navLinks);
                $mobileMenuAnchor.attr('data-empty', '');
            }
        });
    }
};
