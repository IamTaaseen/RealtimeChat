import express from "express";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server)

let messages = JSON.parse(await fs.readFile("messages.json", "utf8"));

app.use(express.static("public"))
app.get("/", async (req, res) => {
    let web = await fs.readFile("index.html", "utf8");
    let template = "";
    messages.forEach(element => {
            const text = element.stuffs.trim();
            template += `<p class = "msg">${element.name}: ${text}</p>\n`
        });
    web = web.replace("{xXplaceholderXXmessageXx&}",template);
    res.send(web);
});
app.post("/", async (req, res) => {
    res.redirect("/")
});
io.on("connection", (socket) => {
    socket.on("message",async (msg) => {        
        if (msg.stuffs.length > 2000) {
            msg.stuffs = msg.stuffs.slice(0, 2000);
        }
        msg.name = msg.name.trim();
        msg.stuffs = msg.stuffs.trim();
        messages.push(msg);
        await fs.writeFile("messages.json", JSON.stringify(messages, null, 2));
        io.emit("message", msg);
    })
    
})
server.listen(5500, "0.0.0.0");
