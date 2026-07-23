export function deleteOldest(){
    const timestamp = chats.querySelector(".timestamp");
    const message = chats.querySelector(".msg");
    if(timestamp) timestamp.remove();
    if(message) message.remove();
}