$('#navTab a').click(function (e) {
  e.preventDefault();
  if(!$(this).parent().hasClass('disabled')){
    $(this).tab('show');
  }
});