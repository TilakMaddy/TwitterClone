$(document).ready(() => {
  $.get("api/posts", results => {
    outputPosts(results, $(".postsContainer"))
  })
})

function outputPosts(results, container) {
  container.html("")

  results.forEach(r => {
    var html = createPostHtml(r)
    container.append(html)
  });

  if(results.length === 0) {
    container.append("<span class='noresults'> Nothing to show <span>")
  }
}