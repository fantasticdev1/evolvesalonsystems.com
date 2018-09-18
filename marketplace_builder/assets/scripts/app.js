$('.dropdown-item').on('click', function(){
  var value = $(this).prop('id');
  var toRemove = '.' + value;
  $('.card-wrapper').not(toRemove).toggle();
  var selText = $(this).text();
  $(this).parents('.dropdown').find('.dropdown-toggle').html(selText);
  $(this).remove();
});