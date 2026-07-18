import express from "express";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

const app = express();
const server = createServer(app);
const io = new Server(server)

const lastMessageTime = new Map();
const MAX_MESSAGES = 500;
let messages = ""
try{
    messages = JSON.parse(await fs.readFile("data/messages.json", "utf8"));
} catch {
    await fs.writeFile("data/messages.json", "[]");
    messages = JSON.parse(await fs.readFile("data/messages.json", "utf8"));
}

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

app.use(express.static("public"))
app.get("/", async (req, res) => {
    let web = await fs.readFile("index.html", "utf8");
    let template = "";
    messages.forEach(element => {

            const safeName = escapeHTML(element.name.trim());
            const safeText = escapeHTML(element.stuffs.trim());
            template += `<p class = "msg">${safeName}: ${safeText}</p>\n`
        });
    web = web.replace("{xXplaceholderXXmessageXx&}",template);
    res.send(web);
});
app.post("/", async (req, res) => {
    res.redirect("/")
});
io.on("connection", (socket) => {
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
        
        messages.push(messageWithProperties);
        if(messages.length > MAX_MESSAGES){
            messages.shift();
        }
        await fs.writeFile("data/messages.json", JSON.stringify(messages, null, 2));
        io.emit("message", messageWithProperties);
    });
    socket.on("disconnect", () => {
        lastMessageTime.delete(socket.id);
    })
    
})
server.listen(5500, "0.0.0.0");
