function parseWhatsAppChat(text, myName) {

  const lines = text.split("\n")
  const messages = []

  const regex =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}\s?[ap]m)\s-\s(.*?):\s(.*)$/

  let lastMessage = null

  for (let line of lines) {

    const match = line.match(regex)

    if (match) {

      const message = {
        sender: match[3],
        message: match[4],
        date: match[1],
        time: match[2],
        isMe: match[3] === myName
      }

      messages.push(message)
      lastMessage = message

    } else if (lastMessage) {

      lastMessage.message += "\n" + line

    }

  }

  return messages
}

export { parseWhatsAppChat }