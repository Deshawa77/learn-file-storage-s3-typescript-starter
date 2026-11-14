import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getVideo, updateVideo } from "../db/videos";
import type { ApiConfig } from "../config";
import type { BunRequest } from "bun";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "./errors";
import { Buffer } from "node:buffer";
import path from "node:path";

type Thumbnail = {
  data: ArrayBuffer;
  mediaType: string;
};

const videoThumbnails: Map<string, Thumbnail> = new Map();

export async function handlerGetThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { videoId } = req.params as { videoId?: string };
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

export async function handlerUploadThumbnail(
  cfg: ApiConfig,
  req: BunRequest
) {
  const { videoId } = req.params as { videoId?: string };

  if (!videoId) {
    throw new BadRequestError("Invalid video ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  // 1. Parse form data
  const formData = await req.formData();

  // 2. Retrieve the thumbnail
  const file = formData.get("thumbnail");

  if (!(file instanceof File)) {
    throw new BadRequestError("Thumbnail file missing");
  }

  // 3. Validate file size
  const MAX_UPLOAD_SIZE = 10 << 20;

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new BadRequestError("File is too big");
  }

  // 4. Get media type
  const mediaType = file.type;

  if (mediaType !== "image/jpeg" && mediaType !== "image/png") {
    throw new BadRequestError("Invalid media type");
  }

  // 5. Get file extension
  const extension = mediaType.split("/")[1];

  if (!extension) {
    throw new BadRequestError("Invalid file type");
  }

  // 6. Read binary image data
  const imageData = await file.arrayBuffer();

  // 7. Retrieve video metadata
  const video = getVideo(cfg.db, videoId);

  if (!video) {
    throw new NotFoundError("Video not found");
  }

  // 8. Check ownership
  if (video.userID !== userID) {
    throw new UserForbiddenError("You do not own this video");
  }

  // 9. Generate file name
  const fileName = `${videoId}.${extension}`;

  // 10. Generate file system path
  const filePath = path.join(cfg.assetsRoot, fileName);

  // 11. Write image to disk
  await Bun.write(filePath, imageData);

  // 12. Generate thumbnail URL
  const thumbnailURL =
    `http://localhost:${cfg.port}/assets/${fileName}`;

  // 13. Update video metadata
  video.thumbnailURL = thumbnailURL;

  // 14. Update SQLite database
  updateVideo(cfg.db, video);

  // 15. Return updated video metadata
  return respondWithJSON(200, video);
}
