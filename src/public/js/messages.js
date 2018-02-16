var _messages = {
  show: function(type, message, scrollToTop = true) {
    var template = $('#message').html();
    var html = nunjucks.renderString(template, {
      type: type,
      message: message
    });
    $('#messageAnchor').html(html).removeClass('uk-hidden');

    if (scrollToTop) {
      $('html, body').animate({ scrollTop: 0 }, 600);
    }
  }
};
