var _dashboardBlogEditor = {
    notSaved: false,

    init: function() {
        _dashboard.simplemdes = [];
        _dashboard.loadMarkdownEditors();

        var markdown = _dashboard.simplemdes[0].value();
        var html = _dashboard.convertMarkdownToHtml(markdown);

        $('.js-markdown-preview').html(html);

        $('#markdownGuide').click(function(e) {
            e.preventDefault();
            window.open('/dashboard/markdown-guide', 'markdownGuide', 'resizable=yes, toolbar=no, scrollbars=yes, menubar=no, status=no, directories=no, width=900, height=1000');
        });

        $('#toolbarSaveButtton').click(function(e) {
            e.preventDefault();
            _dashboardBlogEditor.save();
        });

        $('#toolbarPreviewButtton').click(function(e) {
            e.preventDefault();
            //_dashboardBlogEditor.save();
        });

        $('#toolbarMediaButtton').click(function(e) {
            e.preventDefault();
            window.open('/dashboard/media/select', 'mediaWindow', 'resizable=yes, toolbar=no, scrollbars=yes, menubar=no, status=no, directories=no, width=1200, height=800');
        });

        $('#toolbarDeleteButtton').click(function(e) {
            e.preventDefault();
            _dashboardBlogEditor.delete();
        });

        $('#selectFeaturedImageButton').click(function() {
            window.open('/dashboard/media/select/featured', 'mediaWindow', 'resizable=yes, toolbar=no, scrollbars=yes, menubar=no, status=no, directories=no, width=1200, height=800');
        });

        $('input, select, textarea').on('change', function() {
            _dashboardBlogEditor.notSaved = true;
        });

        _dashboard.simplemdes[0].codemirror.on("change", function(){
            _dashboardBlogEditor.notSaved = true;
        });
    },

    save: function() {
        var name = $('#blogPostName').val();
        var blogPostId = $('#blogPostId').val();
        var currentStatus = $('#blogPostStatus').data('status');
        var currentSlug = $('#blogPostSlug').val();
        var categories = [];
        var tags = $('#tagHidden').val().split(',');

        if (name === '') {
            _messages.show('error', 'A title is required.');
            return;
        }

        _loader.open();

        $('.js-category-checkbox:checked').each(function() {
            categories.push($(this).val());
        });

        $.ajax({
            url: '/dashboard/blog/edit',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                excerpt: $('#blogPostExcerpt').val(),
                markdown: _dashboard.simplemdes[0].value(),
                status: $('#blogPostStatus').val(),
                currentStatus: currentStatus,
                categories: categories,
                tags: tags[0] !== '' ? tags : [],
                featuredImage: $('#featuredImageId').val(),
                blogPostId: blogPostId
            })
        })
        .done(function(post) {
            _messages.show('success', 'Saved successfully.', false);
            _dashboardBlogEditor.notSaved = false;

            if (!blogPostId || currentStatus !== post.status || currentSlug !== post.slug) {
                window.location = '/dashboard/blog/edit/' + post.slug;
            }
        })
        .fail(function(xhr, status, error) {
            _messages.show('error', xhr.responseText);
        })
        .always(function() {
            _loader.close();
        });
    },

    delete: function() {
        if (confirm('Are you sure you want to delete this blog post? It cannot be undone.')) {
            _loader.open();

            $.ajax({
                url: '/dashboard/blog/edit',
                method: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({
                    blogPostId: $('#blogPostId').val()
                })
            })
            .done(function() {
                window.location = '/dashboard/blog/';
            })
            .fail(function(xhr, status, error) {
                _loader.close();
                _messages.show('error', xhr.responseText);
            });
        }
    },

    insertMediaFileIntoMarkdown: function(file) {
        var markdownToInsert;

        if (file.type === 'image') {
            markdownToInsert = '![' +  file.name + '](' + file.path + ' "' + file.name + '")';
        }
        else if (file.type === 'audio') {
            markdownToInsert = '<audio controls>';
            markdownToInsert += '<source src="' + file.path + '" type="' + file.mimeType + '">';
            markdownToInsert += 'Could not load audio file.';
            markdownToInsert += '</audio>';
        }
        else if (file.type === 'video') {
            markdownToInsert = '<video controls>';
            markdownToInsert += '<source src="' + file.path + '" type="' + file.mimeType + '">';
            markdownToInsert += 'Could not load video file.';
            markdownToInsert += '</video>';
        }
        else {
            markdownToInsert = '[' +  file.name + '](' + file.path + ')';
        }

        var editor = _dashboard.simplemdes[0].codemirror;
        var position = editor.getCursor();
        editor.setSelection(position, position);
        editor.replaceSelection(markdownToInsert);
    },

    setFeaturedImage: function(file) {
        var feautredImage = '<img src="' + file.path + '" alt="' + file.name + '">';
        $('#featuredImagePreview').html(feautredImage);
        $('#featuredImageId').val(file.id);
        _dashboardBlogEditor.notSaved = true;
    }
};


$(document).ready(function() {
    _dashboardBlogEditor.init();
});

$(window).bind('beforeunload', function() {
    if(_dashboardBlogEditor.notSaved){
        return "You have unsaved changes on this page. Do you want to leave this page and discard your changes or stay on this page?";
    }
});
