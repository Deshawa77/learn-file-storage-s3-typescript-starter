import { randomUUID } from "crypto";
export function getVideos(db, userID) {
    const sql = `
    SELECT
      id,
      created_at,
      updated_at,
      title,
      description,
      thumbnail_url,
      video_url,
      user_id
    FROM videos
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
    const rows = db.query(sql).all(userID);
    const videos = rows.map((row) => ({
        id: row.id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        title: row.title,
        description: row.description,
        thumbnailURL: row.thumbnail_url,
        videoURL: row.video_url,
        userID: row.user_id,
    }));
    return videos;
}
export function createVideo(db, params) {
    const id = randomUUID();
    const sql = `
    INSERT INTO videos (
      id,
      created_at,
      updated_at,
      title,
      description,
      user_id
    ) VALUES (
      ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?
    )
  `;
    db.run(sql, [id, params.title, params.description, params.userID]);
    return getVideo(db, id);
}
export function getVideo(db, id) {
    const sql = `
    SELECT
      id,
      created_at,
      updated_at,
      title,
      description,
      thumbnail_url,
      video_url,
      user_id
    FROM videos
    WHERE id = ?
  `;
    const row = db.query(sql).get(id);
    if (!row) {
        return;
    }
    return {
        id: row.id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        title: row.title,
        description: row.description,
        thumbnailURL: row.thumbnail_url ?? undefined,
        videoURL: row.video_url ?? undefined,
        userID: row.user_id,
    };
}
export function updateVideo(db, video) {
    const sql = `
    UPDATE videos
    SET
      title = ?,
      description = ?,
      thumbnail_url = ?,
      video_url = ?,
      user_id = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
    db.run(sql, [
        video.title,
        video.description,
        video.thumbnailURL ?? null,
        video.videoURL ?? null,
        video.userID,
        video.id,
    ]);
}
export function deleteVideo(db, id) {
    const sql = `
    DELETE FROM videos
    WHERE id = ?
  `;
    db.run(sql, [id]);
}
