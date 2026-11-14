import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getVideo } from "../db/videos";
import { BadRequestError, NotFoundError } from "./errors";
const videoThumbnails = new Map();
export async function handlerGetThumbnail(cfg, req) {
    const { videoId } = req.params;
    if (!videoId) {
        throw new BadRequestError("Invalid video ID");
    }
    const video = getVideo(cfg.db, videoId);
    if (!video) {
        throw new NotFoundError("Couldn't find video");
    }
    const thumbnail = videoThumbnails.get(videoId);
    if (!thumbnail) {
        throw new NotFoundError("Thumbnail not found");
    }
    return new Response(thumbnail.data, {
        headers: {
            "Content-Type": thumbnail.mediaType,
            "Cache-Control": "no-store",
        },
    });
}
export async function handlerUploadThumbnail(cfg, req) {
    const { videoId } = req.params;
    if (!videoId) {
        throw new BadRequestError("Invalid video ID");
    }
    const token = getBearerToken(req.headers);
    const userID = validateJWT(token, cfg.jwtSecret);
    console.log("uploading thumbnail for video", videoId, "by user", userID);
    // TODO: implement the upload here
    return respondWithJSON(200, null);
}
