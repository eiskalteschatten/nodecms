var $uploadOverlay = $('.js-file-upload-overlay');
var $fileUpload = $('#fileUpload');
var $uploadForm = $('#uploadForm');

var _dashboardMedia = {
    init: function() {
        $('.js-media-file-upload-button').click(function() {
            $('#fileUpload').trigger('click');
        });

        var $dropArea = $('html');

        $dropArea.on('dragover', function(e) {
            e.preventDefault();
            _dashboardMedia.openUploadOverlay();
        });

        $dropArea.on('dragleave', function(e) {
            e.preventDefault();
            _dashboardMedia.closeUploadOverlay();
        });

        $dropArea.on('drop', function(e) {
            e.preventDefault();
            _dashboardMedia.upload(e.originalEvent.dataTransfer.files);
        });

        $fileUpload.on('change', function() {
            _dashboardMedia.upload();
        });

        $('.media').find('.js-media-grid-thumbnail').click(function() {
            window.location = $(this).data('edit-link');
        });

        var collectFileData = function($obj) {
            return {
                name: $obj.data('file-name'),
                path: $obj.data('file-path'),
                type: $obj.data('file-type'),
                mimeType: $obj.data('file-mime-type'),
                id: $obj.data('file-id')
            }
        };

        $('.select-media').find('.js-media-grid-thumbnail').click(function() {
            opener._dashboardBlogEditor.insertMediaFileIntoMarkdown(collectFileData($(this)));
            window.close();
        });

        $('.select-featured-image').find('.js-media-grid-thumbnail').click(function() {
            opener._dashboardBlogEditor.setFeaturedImage(collectFileData($(this)));
            window.close();
        });

        $('#saveMediaFileButton').click(_dashboardMedia.save);
    },

    upload: function(files = null) {
        var $body = $('body');
        var ajaxData = new FormData($uploadForm.get(0));

        if ($body.hasClass('is-uploading')) {
            return;
        }

        $body.addClass('is-uploading');

        _loader.open();

        if (files) {
            $.each(files, function(i, file) {
                ajaxData.append($fileUpload.attr('name'), file);
            });
        }

        $.ajax({
            url: $uploadForm.attr('action'),
            type: $uploadForm.attr('method'),
            data: ajaxData,
            cache: false,
            contentType: false,
            processData: false
        })
        .done(function(redirect) {
            window.location = redirect;
        })
        .fail(function(xhr, status, error) {
            _loader.close();
            _dashboardMedia.closeUploadOverlay();
            $body.removeClass('is-uploading');
            _messages.show('error', xhr.responseText);
        });
    },

    openUploadOverlay: function() {
        $uploadOverlay.removeClass('uk-hidden');
    },

    closeUploadOverlay: function() {
        $uploadOverlay.addClass('uk-hidden');
    },

    save: function() {
        var name = $('[name="name"]').val();
        var mediaFileId = $('#mediaFileId').val();
        var currentSlug = $('#slug').text();
        var categories = [];
        var tags = $('#tagHidden').val().split(',');

        if (name === '') {
            _messages.show('error', 'A name is required.');
            return;
        }

        _loader.open();

        $('.js-category-checkbox:checked').each(function() {
            categories.push($(this).val());
        });

        $.ajax({
            url: '/dashboard/media',
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name,
                caption: $('[name="caption"]').val(),
                description: $('#description').val(),
                categories: categories,
                tags: tags[0] !== '' ? tags : [],
                id: mediaFileId
            })
        })
        .done(function(slug) {
            _messages.show('success', 'Saved successfully.', false);

            if (currentSlug !== slug) {
                window.location = '/dashboard/media/edit/' + slug;
            }
        })
        .fail(function(xhr, status, error) {
            _messages.show('error', xhr.responseText);
        })
        .always(function() {
            _loader.close();
        });
    }
};

$(document).ready(function() {
    _dashboardMedia.init();
});
