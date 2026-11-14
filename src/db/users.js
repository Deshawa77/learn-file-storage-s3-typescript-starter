import { randomUUID } from "crypto";
export function getUsers(db) {
    const sql = `
    SELECT *
    FROM users
  `;
    const query = db.query(sql);
    const users = [];
    for (const row of query.iterate()) {
        users.push({
            id: row.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            email: row.email,
            password: "",
        });
    }
    return users;
}
export function getUserByEmail(db, email) {
    const sql = `
    SELECT *
    FROM users
    WHERE email = ?
  `;
    const row = db.query(sql).get(email);
    if (!row) {
        return;
    }
    return {
        id: row.id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        email: row.email,
        password: row.password,
    };
}
export function getUserByRefreshToken(db, token) {
    const sql = `
    SELECT u.id, u.email, u.created_at, u.updated_at, u.password
    FROM users u
    JOIN refresh_tokens rt ON u.id = rt.user_id
    WHERE rt.token = ?
  `;
    const row = db.query(sql).get(token);
    if (!row)
        return;
    return {
        id: row.id,
        email: row.email,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        password: row.password,
    };
}
export function createUser(db, params) {
    const newID = randomUUID();
    const sql = `
    INSERT INTO users (id, created_at, updated_at, email, password)
    VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)
  `;
    db.run(sql, [newID, params.email, params.password]);
    return getUser(db, newID);
}
export function getUser(db, id) {
    const sql = `
    SELECT *
    FROM users
    WHERE id = ?
  `;
    const row = db.query(sql).get(id);
    if (!row)
        return;
    return {
        id: row.id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        email: row.email,
        password: row.password,
    };
}
export function deleteUser(db, id) {
    const sql = `
    DELETE FROM users
    WHERE id = ?
  `;
    db.run(sql, [id]);
}
