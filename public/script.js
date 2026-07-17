const submit = document.getElementById("submit")
const chats = document.getElementById("chats");
const nameInput = document.getElementById("name");
nameInput.value = localStorage.getItem("nameValue") || "";

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
});
nameInput.addEventListener("input", () => {
    localStorage.setItem("nameValue", nameInput.value);
})