$(document).ready(function() {
  $('.brand-filter').select2({
    placeholder: 'Select all',
    minimumResultsForSearch: -1,
    allowClear: false,
  });
});
$('#top-filter').on('change', function(){
  var value = $(this).val();
  console.log(value);
  if (value === 'select-all'){
    $('.card-wrapper').show();
  }else {
    var toShow = '#' + value;
    $('.card-wrapper').not(toShow).hide();
    $('.card-wrapper').filter(toShow).show();
    
  }
});