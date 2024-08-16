import dotenv from "dotenv";
import app from "./app.js";

// load config-file
dotenv.config();

const hostname = '127.0.0.1';
const port = process.env.PORT || 3001;
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
