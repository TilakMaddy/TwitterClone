
$('#postTextarea').on('keyup', e => {
  var textbox = $(e.target)
  var val = textbox.val().trim()

  var submitButton = $("#submitPostButton");

  if(val == "") {
    submitButton.prop('disabled', true)
    return;
  }

  submitButton.prop('disabled', false)
})

