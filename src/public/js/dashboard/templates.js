var _dashboardTemplates = {
  sections: {
    addSection: function() {
      var sectionClasses = [
        'uk-section-default',
        'uk-section-muted',
        'uk-section-secondary'
      ];

      var $sectionClone = $('.js-section').last().clone();
      var cloneClass;

      for (var i = 0; i < sectionClasses.length; i++) {
        var sectionClass = sectionClasses[i];
        if ($sectionClone.hasClass(sectionClass)) {
          $sectionClone.removeClass(sectionClass);
          cloneClass = i + 1 === sectionClasses.length ? sectionClasses[0] : sectionClasses[i + 1];
        }
      }

      $sectionClone.addClass(cloneClass);
      $sectionClone.find('.markdown-preview').html('');
      $sectionClone.find('.CodeMirror').remove();
      $sectionClone.find('.editor-preview-side').remove();
      $sectionClone.find('.editor-statusbar').remove();
      _dashboard.loadMarkdownEditor($sectionClone.find('.js-markdown-editor'));

      $sectionClone.insertBefore('#sectionFooter');
      $('.js-delete-section-wrapper').removeClass('uk-hidden');
    },

    deleteSection: function($button) {
      var $section = $button.closest('.js-section');
      $section.addClass('uk-background-primary');
      if (confirm('Are you sure you would like to delete this section? This will remove any content within.')) {
        $section.remove();
      }
      else {
        $section.removeClass('uk-background-primary');
      }

      if ($('.js-section').length <= 1) {
        $('.js-delete-section-wrapper').addClass('uk-hidden');
      }
    }
  },

  save: function() {
    alert("save");
  }
};


$(document).ready(function() {
  $('#toolbarSaveButtton').click(function(e) {
    e.preventDefault();
    _dashboardTemplates.save();
  });

  $('#toolbarPreviewButtton').click(function(e) {
    e.preventDefault();
    //_dashboardTemplates.save();
  });

  $('#toolbarUploadButtton').click(function(e) {
    e.preventDefault();
    //_dashboardTemplates.save();
  });

  $('#toolbarDeleteButtton').click(function(e) {
    e.preventDefault();
    //_dashboardTemplates.save();
  });

  $(document).on('click', '#addSection', function() {
    _dashboardTemplates.sections.addSection();
  });

  $(document).on('click', '.js-delete-section', function() {
    _dashboardTemplates.sections.deleteSection($(this));
  });
});
