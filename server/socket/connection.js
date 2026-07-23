
import {
    countMessages,
    deleteOldestMessage,
    getMessages,
    getMessagesById,
    insertMessage
} from "../database.js";

import { io } from "../server.js";

import { PleaseDontCollide } from "../backendUtils.js";

import { lastMessageTime, MAX_MESSAGES } from "./state.js";
export function handleConnection(socket){
        io.emit("onlineUsers", io.engine.clientsCount);
        socket.on("message",async (msg) => {
            const now = Date.now();
            const last = lastMessageTime.get(socket.id) || 0;
            if(now - last < 1000)
                return
            
            lastMessageTime.set(socket.id, now);
            if (typeof msg.stuffs !== "string" || typeof msg.name !== "string")
                return;
            
    
            msg.name = msg.name.trim()
            msg.stuffs = msg.stuffs.trim();
            if(!msg.name || !msg.stuffs)
                return;
            if(msg.name.length > 30)
                msg.name = msg.name.slice(0, 30);
            if (msg.stuffs.length > 25000) 
                msg.stuffs = msg.stuffs.slice(0, 25000);
            
            const messageWithProperties = {
                id: PleaseDontCollide(),
                name: msg.name,
                stuffs: msg.stuffs,
                createdAt: Date.now(),
                replyTo: msg.replyTo ?? null
            }
            const replyToMessage = messageWithProperties.replyTo
                ? getMessagesById.get(messageWithProperties.replyTo)
                : null;
            
            insertMessage.run(
                messageWithProperties.id,
                messageWithProperties.name,
                messageWithProperties.stuffs,
                messageWithProperties.createdAt,
                messageWithProperties.replyTo
            );
            const totalMessage = countMessages.get().count;
            if(totalMessage> MAX_MESSAGES){
                deleteOldestMessage.run()
                io.emit("deleteOldest");
            }
            io.emit("message", {
                ...messageWithProperties,
            replyToMessage: replyToMessage});
        });
        socket.on("disconnect", () => {
            io.emit("onlineUsers", io.engine.clientsCount);
            lastMessageTime.delete(socket.id);
    
        })
        
}