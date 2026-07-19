import express from "express";
import fs from "node:fs/promises";
import Database from "better-sqlite3";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

const app = express();
await fs.mkdir("data", {recursive: true});
const db = new Database("data/messages.db")
const server = createServer(app);
const io = new Server(server)

const lastMessageTime = new Map();
const MAX_MESSAGES = 100;

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stuffs TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    replyTo TEXT
)
`)
const getMessages = db.prepare(`
        SELECT * 
        FROM messages
        ORDER BY createdAt ASC
`)
const insertMessage = db.prepare(`
    INSERT INTO messages (id, name, stuffs, createdAt, replyTo)
    VALUES (?, ?, ?, ?, ?)
    `)

const countMessages = db.prepare(`
            SELECT COUNT(*) AS count
            FROM messages
        `)
const deleteOldestMessage = db.prepare(`
    DELETE FROM messages
    WHERE id = (
        SELECT id
        FROM messages
        ORDER BY createdAt ASC
        LIMIT 1
)`)
const getMessagesById = db.prepare(`
    SELECT *
    FROM messages
    WHERE id = ?
    `)
function escapeHTML(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
function PleaseDontCollide(){
    return Date.now() + "-" + randomUUID()
}
function formattedTimestamp(createdAt){
    return new Date(createdAt).toLocaleString();
}

app.use(express.static("public"))
app.get("/", async (req, res) => {
    let web = await fs.readFile("index.html", "utf8");
    let template = "";
    const messages = getMessages.all()
    messages.forEach(element => {
            const repliedMessage = getMessagesById.get(element.replyTo);
            let reply = null;
            
            const safeName = escapeHTML(element.name.trim());
            const safeText = escapeHTML(element.stuffs.trim());
            if (repliedMessage) {
                reply = `↳ ${repliedMessage.name}: ${repliedMessage.stuffs.slice(0,20)}`
            }
            template += `
            <p class="timestamp" data-time="${element.createdAt}" data-reply="${reply}"></p>
            <p class = "msg" data-id="${element.id}" data-name="${safeName}" >${safeName}: ${safeText}</p>\n`
        });
    web = web.replace("{xXplaceholderXXmessageXx&}",template);
    res.send(web);
});
app.post("/", async (req, res) => {
    res.redirect("/")
});
io.on("connection", (socket) => {
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
        if(countMessages.get().count > MAX_MESSAGES){
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
    
})
server.listen(5500, "0.0.0.0");
