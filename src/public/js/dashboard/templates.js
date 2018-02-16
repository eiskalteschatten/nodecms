var _dashboardTemplates = {
  loadExhibitionTemplate: function(id, loadContent) {
    var dropdown = document.getElementById('exhibitionTemplatesDropdown');
    UIkit.dropdown(dropdown).hide();

    if ($('#templateAnchor').html() !== '') {
      if (!confirm('Are you sure you would like to change the template? This will remove any content below.')) {
        return;
      }
    }

    _loader.open();

    $.ajax('/dashboard/exhibitions/new/exhibition-template?id=' + id)
      .done(function(markup) {
        $('#templateAnchor').html(markup);
        _dashboard.simplemdes = [];
        _dashboard.loadMarkdownEditors();

        if (loadContent) {
          _dashboardTemplates[id].loadContent();
        }
      })
      .fail(function(xhr, status, error) {
        _messages.show('error', xhr.responseText);
      })
      .always(function() {
        _loader.close();
      });
  },

  save: function() {
    var templateId = $('#templateId').data('template-id');

    if (typeof templateId === 'undefined' || templateId === '') {
      _messages.show('error', 'Please choose a template before saving.');
      return;
    }

    var name = $('#exhibitionName').val();
    var description = $('#exhibitionDescription').val();

    if (name === '' || description === '') {
      _messages.show('error', 'The exhibition needs a title and description.');
      return;
    }

    _loader.open();

    var texts = [];

    _dashboard.simplemdes.forEach(function(editor) {
      texts.push(editor.value());
    });

    $.ajax({
      url: '/dashboard/exhibitions/edit',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        templateId: templateId,
        name: name,
        description: description,
        texts: texts,
        exhibitionId: $('#exhibitionId').val()
      })
    })
    .done(function(exhibition) {
      _messages.show('success', 'Saved successfully.', false);
      $('#exhibitionId').val(exhibition.exhibitionId);
    })
    .fail(function(xhr, status, error) {
      _messages.show('error', xhr.responseText);
    })
    .always(function() {
      _loader.close();
    });
  },

  article: {
    loadContent: function() {
      var markdown = $('.js-editor-text').val();
      _dashboard.simplemdes[0].value(markdown);
    }
  },

  sections: {
    sectionClasses: [
      'uk-section-default',
      'uk-section-muted',
      'uk-section-secondary'
    ],

    loadContent: function() {
      $('.js-editor-text').each(function(i) {
        if (i > 0) {
          _dashboardTemplates.sections.addSection();
        }

        var markdown = $(this).val();
        _dashboard.simplemdes[i].value(markdown);
      });
    },

    addSection: function() {
      var $sectionClone = $('.js-section').last().clone();

      $sectionClone.find('.markdown-preview').html('');
      $sectionClone.find('.CodeMirror').remove();
      $sectionClone.find('.editor-preview-side').remove();
      $sectionClone.find('.editor-statusbar').remove();
      _dashboard.loadMarkdownEditor($sectionClone.find('.js-markdown-editor'));

      $sectionClone.insertBefore('#sectionFooter');
      _dashboardTemplates.sections.assignSectionClasses();
      $('.js-delete-section-wrapper').removeClass('uk-hidden');
    },

    deleteSection: function($button) {
      var $section = $button.closest('.js-section');
      $section.addClass('uk-background-primary');
      if (confirm('Are you sure you would like to delete this section? This will remove any content within.')) {
        $section.remove();
        _dashboardTemplates.sections.assignSectionClasses();
      }
      else {
        $section.removeClass('uk-background-primary');
      }

      if ($('.js-section').length <= 1) {
        $('.js-delete-section-wrapper').addClass('uk-hidden');
      }
    },

    assignSectionClasses: function() {
      var sectionClasses = _dashboardTemplates.sections.sectionClasses;
      var $sections = $('.js-section');
      $sections.removeClass(sectionClasses.join(' '));

      var i = 0;

      $('.js-section').each(function() {
        $(this).addClass(sectionClasses[i]);
        i = i === sectionClasses.length - 1 ? 0 : i + 1;
      });
    }
  }
};


$(document).ready(function() {
  $('.js-exhibition-template-button').click(function(e) {
    e.preventDefault();
    _dashboardTemplates.loadExhibitionTemplate($(this).data('template-id'));
  });

  $('#markdownGuide').click(function(e) {
    e.preventDefault();
    window.open('/dashboard/markdown-guide', 'markdownGuide', 'resizable=yes, toolbar=no, scrollbars=yes, menubar=no, status=no, directories=no, width=900, height=1000');
  });

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
