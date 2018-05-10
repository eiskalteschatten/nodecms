var _dashboardMedia = {
  init: function() {
    $('.js-media-file-upload-button').click(function() {
      $('#fileUpload').trigger('click');
    });

    var $dropArea = $('.js-media-file-drop');

    $dropArea.on('dragover', function() {
      $(this).addClass('dragging');
    });

    $dropArea.on('dragleave', function() {
      $(this).removeClass('dragging');
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
