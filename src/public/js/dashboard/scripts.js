var _dashboard = {
    simplemdes: [],

    init: function() {
        $('.js-item-row').click(function() {
            window.location = $(this).data('edit-link');
        });

        $('.js-tag-input').keyup(function(e) {
            e.preventDefault();

            if (e.keyCode === 13) {
                _dashboard.addTag($(this));
            }
        });

        $(document).on('click', '.js-delete-tag', function() {
            _dashboard.deleteTag($(this));
        });
    },

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
    },

    addTag: function($field) {
        var inputValue = $field.val().trim();

        if (inputValue !== '') {
            var $tagCluster = $('#tagCluster');
            var $tagHidden = $('#tagHidden');
            var newTags = inputValue.split(',');

            for (var i in newTags) {
                var tag = newTags[i].trim();
                var badge = '<span class="uk-badge uk-margin-small-right js-tag-badge"><span class="js-tag-text">' + tag + '</span>&nbsp;<i class="fas fa-times cursor-pointer js-delete-tag"></i></span>';
                $tagCluster.append(badge);

                var hiddenValue = $tagHidden.val();
                var newValue = hiddenValue !== '' ? hiddenValue + ',' + tag : tag;
                $tagHidden.val(newValue);
            }

            $tagCluster.removeClass('uk-hidden');

            $field.val('');
        }
    },

    deleteTag: function($field) {
        var $badge = $field.closest('.js-tag-badge');
        var $tagCluster = $field.closest('.js-tag-cluster');
        var $tagHidden = $tagCluster.siblings('.js-tag-hidden');

        var tagText = $field.siblings('.js-tag-text').text();
        var tags = $tagHidden.val().split(',');
        var newTags = tags.filter(function(tag) {
            return tag !== tagText;
        });

        $tagHidden.val(newTags);
        $badge.remove();
    }
};

$(document).ready(function() {
    _dashboard.init();
});
