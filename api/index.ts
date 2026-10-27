// Vercel turns every file in /api into a serverless function. This one serves the whole API:
// vercel.json rewrites /api/* here, and Express routes on the original URL.
import app from "../server/app.js";

export default app;
