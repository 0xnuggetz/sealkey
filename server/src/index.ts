import * as dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { users } from "./users";
import { assets } from "./assets";
import { oracle } from "./oracle";

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const app: Express = express();
const port = process.env.PORT ?? 8888;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/oracle", oracle);
app.use("/users", users);
app.use("/assets", assets);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
