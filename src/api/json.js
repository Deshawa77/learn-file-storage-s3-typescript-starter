export function respondWithJSON(status, payload) {
    const body = JSON.stringify(payload);
    return new Response(body, {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
