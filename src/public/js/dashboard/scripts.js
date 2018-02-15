var _dashboard = {
  simplemdes: [],

  loadExhibitionTemplate: function(id) {

    var dropdown = document.getElementById('exhibitionTemplatesDropdown');
    UIkit.dropdown(dropdown).hide();

    if ($('#templateAnchor').html() !== '') {
      if (!confirm('Are you sure you would like to change the template? This will remove any content below.')) {
        return;
      }
    }

    var loadTemplateSpinner = $('#loadTemplateSpinner');
    loadTemplateSpinner.removeClass('uk-hidden');

    $.ajax('/dashboard/exhibitions/new/exhibition-template?id=' + id)
      .done(function(markup) {
        $('#templateAnchor').html(markup);
        _dashboard.simplemdes = [];
        _dashboard.loadMarkdownEditors();
      })
      .fail(function(xhr, status, error) {
        _messages.show('error', error);
      })
      .always(function() {
        loadTemplateSpinner.addClass('uk-hidden');
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
        $editorElement.closest('.js-exhibition-template').find('.markdown-preview').html(html);
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
      $editorElement.closest('.js-exhibition-template').find('.markdown-preview').html(html);
    });

    _dashboard.simplemdes.push(simplemde);
  },

  convertMarkdownToHtml: function(markdown) {
    return marked(markdown);
  }
};

$(document).ready(function() {
  $('.js-exhibition-template-button').click(function(e) {
    e.preventDefault();
    _dashboard.loadExhibitionTemplate($(this).data('template-id'));
  });

  $('#markdownGuide').click(function(e) {
    e.preventDefault();
    window.open('/dashboard/markdown-guide', 'markdownGuide', 'resizable=yes, toolbar=no, scrollbars=yes, menubar=no, status=no, directories=no, width=900, height=1000');
  });
});
