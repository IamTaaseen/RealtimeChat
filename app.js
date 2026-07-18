import express from "express";
import fs from "node:fs/promises";
import Database from "better-sqlite3";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

const app = express();
const db = new Database("data/messages.db")
const server = createServer(app);
const io = new Server(server)

const lastMessageTime = new Map();
const MAX_MESSAGES = 500;
let messages = ""

try{
    messages = JSON.parse(await fs.readFile("data/messages.json", "utf8"));
} catch {
    await fs.mkdir("data", { recursive: true });
    await fs.writeFile("data/messages.json", "[]");
    messages = JSON.parse(await fs.readFile("data/messages.json", "utf8"));
}


db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
    id TEXT PROMARY KEY,
    name TEXT NOT NULL,
    stuffs TEXT NOT NULL,
    createdAt INTEGER NOT NULL
)
`)
const insertMessage = db.prepare(`
    INSERT INTO messages (id, name, stuffs, createdAt)
    VALUES (?, ?, ?, ?)
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
    return Date.now() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID() + "-" + randomUUID()
}
function formattedTimestamp(createdAt){
    return new Date(createdAt).toLocaleString();
}

app.use(express.static("public"))
app.get("/", async (req, res) => {
    let web = await fs.readFile("index.html", "utf8");
    let template = "";
    messages.forEach(element => {

            const safeName = escapeHTML(element.name.trim());
            const safeText = escapeHTML(element.stuffs.trim());
            template += `
            <p class="timestamp" data-time="${element.createdAt}"></p>
            <p class = "msg">${safeName}: ${safeText}</p>\n`
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
        if (msg.stuffs.length > 2000) 
            msg.stuffs = msg.stuffs.slice(0, 2000);
        const messageWithProperties = {
            id: PleaseDontCollide(),
            name: msg.name,
            stuffs: msg.stuffs,
            createdAt: Date.now()
        }
        insertMessage.run(
            messageWithProperties.id,
            messageWithProperties.name,
            messageWithProperties.stuffs,
            messageWithProperties.createdAt
        );

        messages.push(messageWithProperties);
        if(messages.length > MAX_MESSAGES){
            messages.shift();
        }
        await fs.writeFile("data/messages.json", JSON.stringify(messages, null, 2));
        io.emit("message", messageWithProperties);
    });
    socket.on("disconnect", () => {
        io.emit("onlineUsers", io.engine.clientsCount);
        lastMessageTime.delete(socket.id);
    })
    
})
server.listen(5500, "0.0.0.0");
