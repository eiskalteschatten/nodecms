var _dashboardMedia = {
  init: function() {
    $('.js-media-file-upload-button').click(function() {
      $('#fileUpload').trigger('click');
    });

    var $dropArea = $('html');
    var $uploadOverlay = $('.js-file-upload-overlay');

    $dropArea.on('dragover', function() {
      $uploadOverlay.removeClass('uk-hidden');
    });

    $dropArea.on('dragleave', function() {
      $uploadOverlay.addClass('uk-hidden');
    });

    $dropArea.on('drop', function() {

    });
  },

  upload: function() {

  }
};

$(document).ready(function() {
  _dashboardMedia.init();
});
