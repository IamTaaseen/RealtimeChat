import Database from "better-sqlite3"
import fs from "node:fs/promises"
await fs.mkdir("data", {recursive: true});
export const db = new Database("data/messages.db")
export const getMessages = db.prepare(`
        SELECT * 
        FROM messages
        ORDER BY createdAt ASC
`)
export const insertMessage = db.prepare(`
    INSERT INTO messages (id, name, stuffs, createdAt, replyTo)
    VALUES (?, ?, ?, ?, ?)
    `)

export const countMessages = db.prepare(`
            SELECT COUNT(*) AS count
            FROM messages
        `)
export const deleteOldestMessage = db.prepare(`
    DELETE FROM messages
    WHERE id = (
        SELECT id
        FROM messages
        ORDER BY createdAt ASC
        LIMIT 1
)`)
export const getMessagesById = db.prepare(`
    SELECT *
    FROM messages
    WHERE id = ?
    `)