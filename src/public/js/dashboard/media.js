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
      dataType: 'json',
      cache: false,
      contentType: false,
      processData: false
    })
    .done(function(id) {
      window.location = '/dashboard/media/edit/' + id;
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
};

$(document).ready(function() {
  _dashboardMedia.init();
});
