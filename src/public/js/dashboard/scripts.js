var _dashboard = {
  loadExhibitionTemplate: function(id) {
    var loadTemplateSpinner = $('#loadTemplateSpinner');
    loadTemplateSpinner.removeClass('uk-hidden');

    var dropdown = document.getElementById('exhibitionTemplatesDropdown');
    UIkit.dropdown(dropdown).hide();

    $.ajax('/dashboard/exhibitions/new/exhibition-template?id=' + id)
      .done(function(markup) {
        $('#templateAnchor').html(markup);
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
    var simplemde = new SimpleMDE({
      element: $('.js-markdown-editor')[0],
      toolbar: false,
      autofocus: true
    });
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
