export type Message = {
    sender: string;
    message: string;
    date: string;
    time: string;
    isMe: boolean;
}


export function parseWhatsAppChat(text: string, myName: string): Message[] {
    const lines = text.split('\n');
    const messages: Message[] = [];

    const regex =
        /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}\s?[ap]m)\s-\s(.*?):\s(.*)$/;



    let lastMessage: Message | null = null

    for (let line of lines) {

        const match = line.match(regex)

        if (match) {

            const messageObj: Message = {
                sender: match[3],
                message: match[4],
                date: match[1],
                time: match[2],
                isMe: match[3] === myName
            }

            messages.push(messageObj)
            lastMessage = messageObj

        } else {

            if (lastMessage) {
                lastMessage.message += "\n" + line
            }

        }


    }
    return messages;
}
