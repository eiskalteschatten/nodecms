var _dashboard = {
    simplemdes: [],

    loadMarkdownEditors: function() {
        var $editorElement = $('.js-markdown-editor');

        $editorElement.each(function(i) {
            var simplemde = new SimpleMDE({
                element: $editorElement[i],
                toolbar: false,
                autofocus: true,
                previewRender: function(plainText) {
                    return marked(plainText);
                }
            });

            simplemde.codemirror.on('change', function() {
                var html = _dashboard.convertMarkdownToHtml(simplemde.value());
                $editorElement.closest('.js-markdown-wrapper').find('.js-markdown-preview').html(html);
            });

            _dashboard.simplemdes.push(simplemde);
        });
    },

    loadMarkdownEditor: function($editorElement) {
        var simplemde = new SimpleMDE({
            element: $editorElement[0],
            toolbar: false,
            autofocus: true,
            previewRender: function(plainText) {
                return marked(plainText);
            }
        });

        simplemde.codemirror.on('change', function() {
            var html = _dashboard.convertMarkdownToHtml(simplemde.value());
            $editorElement.closest('.js-markdown-wrapper').find('.js-markdown-preview').html(html);
        });

        _dashboard.simplemdes.push(simplemde);
    },

    convertMarkdownToHtml: function(markdown) {
        return marked(markdown);
    }
};

$(document).ready(function() {
    $('.js-item-row').click(function() {
        window.location = $(this).data('edit-link');
    });
});
