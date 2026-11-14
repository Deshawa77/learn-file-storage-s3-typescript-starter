import { existsSync, mkdirSync } from "fs";
export function ensureAssetsDir(cfg) {
    if (!existsSync(cfg.assetsRoot)) {
        mkdirSync(cfg.assetsRoot, { recursive: true });
    }
}
