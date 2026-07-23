import fs from "node:fs/promises";
import express from "express"
import { app, server, io } from "./server/server.js";
import { db, getMessages, getMessagesById } from "./server/database.js";
import { escapeHTML } from "./server/backendUtils.js";
import { handleConnection } from "./server/socket/connection.js";



db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stuffs TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    replyTo TEXT
)
`)
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
                reply = `↳ ${repliedMessage.name}: ${repliedMessage.stuffs.slice(0,50)}`
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
io.on("connection", handleConnection);
const PORT = process.env.PORT || 5500;

server.listen(PORT, "0.0.0.0");
