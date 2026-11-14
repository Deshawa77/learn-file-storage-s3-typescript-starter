import { getBearerToken, validateJWT } from "../auth";
import { createVideo, deleteVideo, getVideo, getVideos } from "../db/videos";
import { respondWithJSON } from "./json";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";
export async function handlerVideoMetaCreate(cfg, req) {
    const token = getBearerToken(req.headers);
    const userID = validateJWT(token, cfg.jwtSecret);
    const { title, description } = await req.json();
    if (!title || !description) {
        throw new BadRequestError("Missing title or description");
    }
    const video = createVideo(cfg.db, {
        userID,
        title,
        description,
    });
    return respondWithJSON(201, video);
}
export async function handlerVideoMetaDelete(cfg, req) {
    const { videoId } = req.params;
    if (!videoId) {
        throw new BadRequestError("Invalid video ID");
    }
    const token = getBearerToken(req.headers);
    const userID = validateJWT(token, cfg.jwtSecret);
    const video = getVideo(cfg.db, videoId);
    if (!video) {
        throw new NotFoundError("Couldn't find video");
    }
    if (video.userID !== userID) {
        throw new UserForbiddenError("Not authorized to delete this video");
    }
    deleteVideo(cfg.db, videoId);
    return new Response(null, { status: 204 });
}
export async function handlerVideoGet(cfg, req) {
    const { videoId } = req.params;
    if (!videoId) {
        throw new BadRequestError("Invalid video ID");
    }
    const video = getVideo(cfg.db, videoId);
    if (!video) {
        throw new NotFoundError("Couldn't find video");
    }
    return respondWithJSON(200, video);
}
export async function handlerVideosRetrieve(cfg, req) {
    const token = getBearerToken(req.headers);
    const userID = validateJWT(token, cfg.jwtSecret);
    const videos = getVideos(cfg.db, userID);
    return respondWithJSON(200, videos);
}
