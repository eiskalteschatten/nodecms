var _messages = {
  show: function(type, message) {
    var template = $('#message').html();
    var html = nunjucks.renderString(template, {
      type: type,
      message: message
    });
    $('#messageAnchor').html(html).removeClass('uk-hidden');
  }
};
