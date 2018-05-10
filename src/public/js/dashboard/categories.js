var _dashboardCategories = {
  init: function() {
    $('#addNewCategoryButton').click(_dashboardCategories.scrollToForm);
    $('.js-edit-category-cancel-button').click(_dashboardCategories.cancelEditCategory);
    $('#deleteCategoryButton').click(_dashboardCategories.deleteCategory);

    $('.category-row').click(function() {
      _dashboardCategories.editCategory($(this));
    });
  },

  scrollToForm: function() {
    var formTop = $('#addNewCategoryFormContainer').offset().top;
    $('html,body').animate({scrollTop: formTop}, 'slow');
  },

  editCategory: function($row) {
    var $form = $('#editCategoryForm');
    var id = $row.data('id');

    $('tr.selected').removeClass('selected');
    $row.addClass('selected');

    $form.find('[name="id"]').val(id);
    $form.find('[name="categoryName"]').val($row.find('#name').text());
    $form.find('[name="categoryDescription"]').val($row.find('#description').text());

    $('#addNewCategoryFormContainer').addClass('uk-hidden');
    $('#editCategoryFormContainer').removeClass('uk-hidden');
  },

  cancelEditCategory: function(e) {
    if (e) {
      e.preventDefault();
    }

    $('tr.selected').removeClass('selected');
    $('#editCategoryFormContainer').addClass('uk-hidden');
    $('#addNewCategoryFormContainer').removeClass('uk-hidden');
    $('#editCategoryForm').trigger('reset');
  },

  deleteCategory: function(e) {
    if (e) {
      e.preventDefault();
    }

    var confirmed = confirm('Are you sure you want to delete this category? It cannot be undone.');

    if (confirmed) {
      pp.forms.submitForm($('#editCategoryForm'), 'delete');
    }
  }
};

$(document).ready(function() {
  _dashboardCategories.init();
});
