export function randomColor(colors){
    
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    return randColor;
}
export function formattedTimestamp(createdAt){
    return new Date(createdAt).toLocaleString();
}
export function colorGradient(colors){
    let gradient = `45deg,`;
    for (let i = 0; i < 23; i++) {
        gradient += randomColor(colors);

        if (i < 22) {
            gradient += ",";
        }
    }

    return gradient;
}
export function autoResize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}
