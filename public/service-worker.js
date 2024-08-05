self.addEventListener('push', (event) => {
  console.log('push', event)

  // const title = event.data.text()
  // event.waitUntil(self.registration.showNotification(title))

  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    tag: data.tag,
    data: data.link
  })
})

self.addEventListener("notificationclick", (event) => {
  console.log("On notification click: ", event.notification.tag)
  console.log("On notification click: ", event.notification.data)
  console.log("On notification click: ", event.notification)
  event.notification.close()

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data && "focus" in client) return client.focus()
        }
        console.log('openNewWindow')
        if (clients.openWindow) return clients.openWindow(event.notification.data)
      }),
  )
})
