// var timer; => included in common.js


$("#searchBox").keydown((e) => {
  clearTimeout(timer)

  var textbox = $(e.target);
  var value = textbox.val()

  var searchType = textbox.attr("data-search");

  if(searchType === undefined) {
    searchType = "posts";
  }

  timer = setTimeout(() => {
    value = textbox.val().trim()

    if(value == "") {
      $(".resultsContainer").html("")

    } else {
      search(value, searchType)

    }
  }, 1000)


})


function search(term, type) {

  if(type !== "posts" && type !== "users") {
    return alert('search type messed up, ' + type)
  }

  var url = "/api/" + type;

  $.get(url, { search: term }, results => {

    if(type === "users") {
      outputUsers(results, $(".resultsContainer"))
    } else {
      outputPosts(results, $(".resultsContainer"))
    }

  })

}