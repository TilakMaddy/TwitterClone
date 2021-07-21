$(document).ready(() => {

  $.get(
    '/api/notifications', (data) => {
      outputNotificationList(data, $(".resultsContainer"));
    }
  )

});

$("#markRead").click(() => {markNotificationsAsOpened(); location.reload()});

function outputNotificationList(notifications, container) {

  notifications.forEach(n => {
    var html = createNotificationHtml(n);
    container.append(html);
  });

  if(notifications.length == 0) {
    container.append("<span class='noResults'> No notifications to show !</span>")
  }

}

function createNotificationHtml(notif) {

  var userFrom = notif.userFrom;
  var text = getNotificationText(notif);
  var clsName = notif.opened ? '' : 'active';

  return `
    <a href='${getNotificationURL(notif)}' class='resultListItem notification ${clsName}' data-id='${notif._id}'>
      <div class='resultsImageContainer'>
        <img src='${userFrom.profilePic}'/>
      </div>
      <div class='resultsDetailsContainer ellipsis'>
        <span class='ellipsis'>${text}</span>
      </div>
    </a>
  `;

}

function getNotificationText(notification) {

  var userFrom = notification.userFrom;

  if(!userFrom.firstName)
    return alert('user not populated');

  var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  var text;

  switch(notification.notificationType) {

    case "retweet":
      text = `${userFromName} retweeted one of your posts`;
      break;

    case "postLike":
      text = `${userFromName} liked one of your posts`;
      break;

    case "follow":
      text = `${userFromName} followed you`;
      break;

    case "reply":
      text = `${userFromName} replied to one of your posts`;
      break;

  }

  return `<span class='ellipsis'> ${text} </span>`;

}



function getNotificationURL(notification) {

  var url = '#';
  switch(notification.notificationType) {

    case "retweet":
    case "postLike":
    case "reply":
      url = '/posts/' + notification.entityId;
      break;

    case "follow":
      url = '/profile/' + notification.entityId;
      break;

  }

  return url;

}
