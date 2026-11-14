import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/errors";
export const ACCESS_TOKEN_ISSUER = "tubely-access";
export async function hashPassword(password) {
    return await Bun.password.hash(password, {
        algorithm: "argon2id",
    });
}
export async function checkPasswordHash(password, hash) {
    if (!password)
        return false;
    try {
        return await Bun.password.verify(password, hash);
    }
    catch {
        return false;
    }
}
export function makeJWT(userID, secret, expiresIn) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const token = jwt.sign({
        iss: ACCESS_TOKEN_ISSUER,
        sub: userID,
        iat: issuedAt,
        exp: expiresAt,
    }, secret, { algorithm: "HS256" });
    return token;
}
export function validateJWT(tokenString, tokenSecret) {
    const decoded = jwt.verify(tokenString, tokenSecret);
    if (decoded.iss !== ACCESS_TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError("Invalid issuer");
    }
    const userID = decoded.sub;
    if (!userID) {
        throw new UserNotAuthenticatedError("Missing subject (user ID)");
    }
    return userID;
}
export function getBearerToken(headers) {
    const authHeader = headers.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthenticatedError("Missing Authorization Header");
    }
    const split = authHeader.split(" ");
    if (split.length < 2 || split[0] !== "Bearer") {
        throw new UserNotAuthenticatedError("Malformed Authorization header");
    }
    return split[1];
}
export function makeRefreshToken() {
    const buf = randomBytes(32);
    return buf.toString("hex");
}
