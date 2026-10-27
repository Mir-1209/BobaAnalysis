import app from "./app.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.API_PORT ?? 8787);

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "StudyCraft API listening");
});
