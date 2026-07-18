const socket = io();


const form = document.getElementById("form");

const submit = document.getElementById("submit")
const chats = document.getElementById("chats");
const messageTextarea = document.getElementById("message");
const nameInput = document.getElementById("name");
const messages = document.querySelectorAll(".msg");
const userCount = document.getElementById("userCount");
const colors = [
                    "#FFF8E7",
                    "#F5F5DC",
                    "#DFFFE0",
                    "#EAF6FF",
                    "#DFF6FF",
                    "#F3E8FF",
                    "#FFE5D4",
                    "#FFF4B8",
                    "#DDE8D4",
                    "#F2F2F2",
                    "#D9ECFF",
                    "#E6FFFF",
                    "#FDE2E4",
                    "#FAD2E1",
                    "#E2F0CB",
                    "#BDE0FE",
                    "#CDEAC0",
                    "#FFD6A5",
                    "#FDFFB6",
                    "#CAFFBF",
                    "#9BF6FF",
                    "#A0C4FF",
                    "#BDB2FF",
                    "#FFC6FF",
                    "#F1FAEE",
                    "#E9F5DB",
                    "#FEEBC8",
                    "#E0FBFC",
                    "#F8F9FA",
                    "#FFF1E6",
                    "#E7F9F0",
                    "#E3F2FD",
                    "#FFFACD",
                    "#F0FFF0",
                    "#F5FFFA",
                    "#FAFAD2",
                    "#F0F8FF",
                    "#FAF0E6",
                    "#FDFCDC",
                    "#EEF7FF",
                    "#FFD1DC",
                    "#FFDFD3",
                    "#FFE4B5",
                    "#FFDAB9",
                    "#FFEFD5",
                    "#FFF0F5",
                    "#FFF5EE",
                    "#FAEBD7",
                    "#F8E8E8",
                    "#F7D9C4",

                    "#E6E6FA",
                    "#D8BFD8",
                    "#E0BBE4",
                    "#DCC6E0",
                    "#EADCF8",
                    "#F3E5F5",

                    "#D0F0C0",
                    "#C1E1C1",
                    "#E8F5E9",
                    "#F0FFF4",
                    "#DCFCE7",
                    "#D8F3DC",
                    "#ECFCCB",

                    "#D6F5FF",
                    "#D4F1F9",
                    "#CFE8FF",
                    "#E0FFFF",
                    "#E6F7FF",
                    "#EAF4FC",
                    "#DFF4FF",

                    "#FFF8DC",
                    "#FFF7AE",
                    "#FFF9C4",
                    "#FFFDE7",
                    "#FEF3C7",

                    "#F4F1DE",
                    "#F6EEE3",
                    "#F7F3E9",
                    "#EDE7E3",
                    "#ECEFF1",
                    "#F3F4F6",
                    "#F5F3FF",
                    "#FDF2F8",
                    "#ECFEFF",
                    "#FEFCE8"
                    ];
function randomColor(){
    
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    return randColor;
}
function formattedTimestamp(createdAt){
    return new Date(createdAt).toLocaleString();
}
function colorGradient(){
    let gradient = `45deg,`;
    for (let i = 0; i < 23; i++) {
        gradient += randomColor();

        if (i < 22) {
            gradient += ",";
        }
    }

    return gradient;
}
socket.on("onlineUsers", (count) => {
    userCount.innerHTML = `<p><b>Online Users: </b>${count}</p>`
})
socket.on("message", (msg) => {
    const p2 = document.createElement("p");
    p2.className = "timestamp"
    p2.textContent = `${formattedTimestamp(msg.createdAt)}`;
    const p1 = document.createElement("p");
    p1.className = "msg";
    p1.textContent = `${msg.name}: ${msg.stuffs}`
    chats.appendChild(p2);
    chats.appendChild(p1);
    
    chats.lastElementChild.scrollIntoView({
    behavior: "smooth"
    
});
    chats.lastElementChild.style.background = `linear-gradient(${colorGradient()})`
});
socket.on("deleteOldest", () => {
    const timestamp = chats.querySelector(".timestamp");
    const message = chats.querySelector(".msg");
    if(timestamp) timestamp.remove();
    if(message) message.remove();
})
document.querySelectorAll(".timestamp").forEach(el => {
    el.textContent = formattedTimestamp(Number(el.dataset.time));
});
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
form.addEventListener("submit", (e) => {
    e.preventDefault();

    socket.emit("message", {
        name: nameInput.value,
        stuffs: messageTextarea.value
    });
    messageTextarea.value = "";
    autoResize(messageTextarea);
});

nameInput.value = localStorage.getItem("nameValue") || "";




autoResize(messageTextarea);
function autoResize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}
if (chats.lastElementChild) {
    chats.lastElementChild.scrollIntoView({
    behavior: "smooth"
});
}
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
    el.style.background = `linear-gradient(${colorGradient()})`;
})
