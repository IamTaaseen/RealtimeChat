import { randomUUID } from "node:crypto";

export function escapeHTML(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
export function PleaseDontCollide(){
    return Date.now() + "-" + randomUUID()
}
export function formattedTimestamp(createdAt){
    return new Date(createdAt).toLocaleString();
}
