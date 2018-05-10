var _dashboardBlog = {
  init: function() {
    _dashboard.simplemdes = [];
    _dashboard.loadMarkdownEditors();

    var markdown = _dashboard.simplemdes[0].value();
    var html = _dashboard.convertMarkdownToHtml(markdown);

    $('.js-markdown-preview').html(html);

    $('#markdownGuide').click(function(e) {
      e.preventDefault();
      window.open('/dashboard/markdown-guide', 'markdownGuide', 'resizable=yes, toolbar=no, scrollbars=yes, menubar=no, status=no, directories=no, width=900, height=1000');
    });

    $('#toolbarSaveButtton').click(function(e) {
      e.preventDefault();
      _dashboardBlog.save();
    });

    $('#toolbarPreviewButtton').click(function(e) {
      e.preventDefault();
      //_dashboardBlog.save();
    });

    $('#toolbarMediaButtton').click(function(e) {
      e.preventDefault();
      //_dashboardBlog.save();
    });

    $('#toolbarDeleteButtton').click(function(e) {
      e.preventDefault();
      _dashboardBlog.delete();
    });

    $('.js-tag-input').keyup(function(e) {
      if (e.keyCode === 13) {
        _dashboardBlog.addTag($(this));
      }
    });

    $(document).on('click', '.js-delete-tag', function() {
      _dashboardBlog.deleteTag($(this));
    });
  },

  save: function() {
    var name = $('#blogPostName').val();
    var blogPostId = $('#blogPostId').val();
    var currentStatus = $('#blogPostStatus').data('status');
    var categories = [];

    if (name === '') {
      _messages.show('error', 'A title is required.');
      return;
    }

    _loader.open();

    $('.js-category-checkbox:checked').each(function() {
      categories.push($(this).val());
    });

    $.ajax({
      url: '/dashboard/blog/edit',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: name,
        excerpt: $('#blogPostExcerpt').val(),
        markdown: _dashboard.simplemdes[0].value(),
        status: $('#blogPostStatus').val(),
        currentStatus: currentStatus,
        categories: categories,
        tags: $('#tagHidden').val().split(','),
        blogPostId: blogPostId
      })
    })
    .done(function(post) {
      _messages.show('success', 'Saved successfully.', false);

      if (!blogPostId || currentStatus != post.status) {
        window.location = '/dashboard/blog/edit/' + post.slug;
      }
    })
    .fail(function(xhr, status, error) {
      _messages.show('error', xhr.responseText);
    })
    .always(function() {
      _loader.close();
    });
  },

  delete: function() {
    if (confirm('Are you sure you want to delete this blog post? It cannot be undone.')) {
      _loader.open();

      $.ajax({
        url: '/dashboard/blog/edit',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({
          blogPostId: $('#blogPostId').val()
        })
      })
      .done(function() {
        window.location = '/dashboard/blog/';
      })
      .fail(function(xhr, status, error) {
        _loader.close();
        _messages.show('error', xhr.responseText);
      });
    }
  },

  addTag: function($field) {
    var inputValue = $field.val().trim();

    if (inputValue !== '') {
      var $tagCluster = $('#tagCluster');
      var $tagHidden = $('#tagHidden');
      var newTags = inputValue.split(',');

      for (var i in newTags) {
        var tag = newTags[i].trim();
        var badge = '<span class="uk-badge uk-margin-small-right js-tag-badge"><span class="js-tag-text">' + tag + '</span>&nbsp;<i class="fas fa-times cursor-pointer js-delete-tag"></i></span>';
        $tagCluster.append(badge);

        var hiddenValue = $tagHidden.val();
        var newValue = hiddenValue !== '' ? hiddenValue + ',' + tag : tag;
        $tagHidden.val(newValue);
      }

      $tagCluster.removeClass('uk-hidden');

      $field.val('');
    }
  },

  deleteTag: function($field) {
    var $badge = $field.closest('.js-tag-badge');
    var $tagCluster = $field.closest('.js-tag-cluster');
    var $tagHidden = $tagCluster.siblings('.js-tag-hidden');

    var tagText = $field.siblings('.js-tag-text').text();
    var tags = $tagHidden.val().split(',');
    var newTags = tags.filter(function(tag) {
      return tag !== tagText;
    });

    $tagHidden.val(newTags);
    $badge.remove();
  }
};


$(document).ready(function() {
  _dashboardBlog.init();
});
