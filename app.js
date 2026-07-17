import express from "express";
import fs from "node:fs/promises";
const app = express();
let messages = JSON.parse(await fs.readFile("messages.json", "utf8"));

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))
app.get("/", async (req, res) => {
    let web = await fs.readFile("index.html", "utf8");
    let template = "";
    messages.forEach(element => {
            template += `<p class = "msg">${element.name}: ${element.stuffs}</p>\n`
        });
    web = web.replace("{xXplaceholderXXmessageXx&}",template);
    res.send(web);
});
app.post("/", async (req, res) => {
    messages.push(req.body);
    await fs.writeFile("messages.json", JSON.stringify(messages, null, 2));
    res.redirect("/")
});
app.listen(5500, "0.0.0.0");
