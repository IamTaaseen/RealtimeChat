const submit = document.getElementById("submit")
const chats = document.getElementById("chats");

const lastMessage = chats.lastElementChild;

if (lastMessage) {
    lastMessage.scrollIntoView({
    behavior: "smooth"
});
}
document.body.addEventListener("click", () => {
    lastMessage.scrollIntoView({
        behavior: "smooth"
    })
})