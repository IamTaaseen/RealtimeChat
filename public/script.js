import { colors } from "./js/constants.js";
import {
    formattedTimestamp,
    autoResize,
    colorGradient,
    notification
} from "./js/utils.js";
import { deleteOldest } from "./js/ui.js";

const socket = io();

const form = document.getElementById("form");
const submit = document.getElementById("submit")
const chats = document.getElementById("chats");
const messageTextarea = document.getElementById("message");
const nameInput = document.getElementById("name");
const messages = document.querySelectorAll(".msg");
const userCount = document.getElementById("userCount");
const isReplying = document.getElementById("isReplying")


let replyingTo = null;
let moved = false;


nameInput.value = localStorage.getItem("nameValue") || "";

function createMessage(msg, chats, isReplying){
    
    let p2 = "";
    if(msg.replyTo){
        let reply = `↳ ${msg.replyToMessage.name}: ${msg.replyToMessage.stuffs.slice(0,50)}`
        p2 = document.createElement("p");
        p2.className = "timestamp reply"
        p2.textContent = `${reply}- ${formattedTimestamp(msg.createdAt)}`;
    }
    else{
        p2 = document.createElement("p");
        p2.className = "timestamp"
        p2.textContent = `${formattedTimestamp(msg.createdAt)}`;
    }
    const p1 = document.createElement("p");
    p1.className = "msg";
    p1.dataset.id = msg.id;
    p1.textContent = `${msg.name}: ${msg.stuffs}`
    chats.appendChild(p2);
    chats.appendChild(p1);
    p1.addEventListener("click", () => {
        if (moved) return;
        replyingTo = msg.id;
        isReplying.textContent = `↳ Replying to ${msg.name}`;
    })
    chats.lastElementChild.scrollIntoView({
    behavior: "smooth"
    
});
    chats.lastElementChild.style.background = `linear-gradient(${colorGradient(colors)})`
}

function handleSubmit(e){
    e.preventDefault();
    socket.emit("message", {
        name: nameInput.value,
        stuffs: messageTextarea.value,
        replyTo: replyingTo
    });
    replyingTo = null;
    isReplying.textContent = "";
    messageTextarea.value = "";
    autoResize(messageTextarea);
}
function replyDeleteFull(e){
    if (moved) return;
    const clickedInside =
        chats.contains(e.target) ||
        messageTextarea.contains(e.target) ||
        nameInput.contains(e.target) ||
        submit.contains(e.target) ||
        isReplying.contains(e.target);

    if (!clickedInside) {
        replyingTo = null;
        isReplying.textContent = "";
    }
}
socket.on("onlineUsers", (count) => {
    userCount.innerHTML = `<p><b>Online Users: </b>${count}</p>`
})
socket.on("message", (msg) => {
    createMessage(msg, chats, isReplying);
    notification();
});
socket.on("deleteOldest", deleteOldest);
//Probebly dead code
document.querySelectorAll(".timestamp").forEach(el => {
    if(el.dataset.reply !== "null"){
        el.textContent = `${el.dataset.reply}- ${formattedTimestamp(Number(el.dataset.time))}`;}
    else{
        el.textContent = formattedTimestamp(Number(el.dataset.time));
    }
    });


form.addEventListener("submit", handleSubmit);
document.addEventListener("pointerdown", () => {
    moved = false;
});

document.addEventListener("pointermove", () => {
    moved = true;
});
document.addEventListener("pointerup", () => {
    setTimeout(() => moved = false, 0);
});

document.addEventListener("click", replyDeleteFull);
messageTextarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey){
        e.preventDefault();
        form.requestSubmit();
    }
});
nameInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        e.preventDefault();
        form.requestSubmit();
    }
})
chats.addEventListener("click", () => {
    chats.lastElementChild.scrollIntoView({
        behavior: "smooth"
    })
});
nameInput.addEventListener("input", () => {
    localStorage.setItem("nameValue", nameInput.value);
});
messageTextarea.addEventListener("input", () => {
    autoResize(messageTextarea)
});
messages.forEach(el => {
    el.style.background = `linear-gradient(${colorGradient(colors)})`;
})
document.querySelectorAll(".msg").forEach(msg => {
    msg.addEventListener("click", () => {
        if(moved) return;
        replyingTo = msg.dataset.id;
        isReplying.textContent = `↳ Replying to ${msg.dataset.name}`;

    })
})

autoResize(messageTextarea);

if (chats.lastElementChild) {
    chats.lastElementChild.scrollIntoView({
    behavior: "smooth"
});
}
