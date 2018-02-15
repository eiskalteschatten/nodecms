var _dashboardTemplates = {
  sections: {
    addSection: function() {
      var sectionClasses = [
        'uk-section-default',
        'uk-section-muted',
        'uk-section-secondary'
      ];

      var sectionClone = $('.js-section').last().clone();
      var cloneClass;

      for (var i = 0; i < sectionClasses.length; i++) {
        var sectionClass = sectionClasses[i];
        if (sectionClone.hasClass(sectionClass)) {
          sectionClone.removeClass(sectionClass);
          cloneClass = i + 1 === sectionClasses.length ? sectionClasses[0] : sectionClasses[i + 1];
        }
      }

      sectionClone.addClass(cloneClass);

      // remove anything from the markdown editor

      sectionClone.find('.markdown-preview').html('');
    }
  }
};
