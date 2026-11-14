export function createRefreshToken(db, params) {
    const query = `
    INSERT INTO refresh_tokens (
      token,
      created_at,
      updated_at,
      user_id,
      expires_at
    ) VALUES (
      ?,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      ?,
      ?
    )
  `;
    db.run(query, [params.token, params.userID, params.expiresAt.toISOString()]);
    return getRefreshToken(db, params.token);
}
export function revokeRefreshToken(db, token) {
    const query = `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token = ?
  `;
    return db.run(query, [token]);
}
export function getRefreshToken(db, token) {
    const row = db
        .query(`
      SELECT
        token,
        created_at,
        updated_at,
        user_id,
        expires_at,
        revoked_at
      FROM refresh_tokens
      WHERE token = ?
    `)
        .get(token);
    if (!row) {
        return;
    }
    const createdAt = new Date(row.created_at);
    const updatedAt = new Date(row.updated_at);
    const expiresAt = new Date(row.expires_at);
    const revokedAt = row.revoked_at ? new Date(row.revoked_at) : undefined;
    return {
        token: row.token,
        userID: row.user_id,
        expiresAt,
        createdAt,
        updatedAt,
        revokedAt,
    };
}
export function deleteRefreshToken(db, token) {
    const query = `
    DELETE FROM refresh_tokens
    WHERE token = ?
  `;
    return db.run(query, [token]);
}
