var _dashboard = {
  loadExhibitionTemplate: function(id) {
    var loadTemplateSpinner = $('#loadTemplateSpinner');
    loadTemplateSpinner.removeClass('uk-hidden');

    $.get('/dashboard/exhibitions/new/exhibition-template', {template:id}, function(markup) {
      loadTemplateSpinner.addClass('uk-hidden');
      $('#templateAnchor').html(markup);
    });
  }
};

$(document).ready(function() {
  $('.js-exhibition-template-button').click(function(e) {
    e.preventDefault();
    _dashboard.loadExhibitionTemplate($(this).data('template-id'));
  });
});
