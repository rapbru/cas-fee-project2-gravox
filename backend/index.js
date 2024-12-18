import dotenv from "dotenv";
import app from "./app.js";
import logger from "./utils/logger.js";

dotenv.config();

const hostname = '0.0.0.0';
const port = process.env.PORT || 3001;
app.listen(port, hostname, () => {
    logger.info(`Server running at http://${hostname}:${port}/`);
});
