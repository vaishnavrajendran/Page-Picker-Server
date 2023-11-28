import express, { json } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connect } from "mongoose";
import "dotenv/config";

import userRoute from "./routes/userRoute.js";

const app = express();

const isDev = app.settings.env === "development";
const URL = isDev
  ? "http://localhost:3000"
  : "https://sketch-craft-7f75l8kar-vaishnavrajendran.vercel.app";

app.use(cors({ origin: URL }));
app.use(json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/modifiedPdf", express.static(path.join(__dirname, "modifiedPdf")));

app.use("/user", userRoute);

app.listen(process.env.PORT, () => {
  connect(process.env.MONGO_URL)
    .then(() => {
      console.log(`Server Connected on ${process.env.PORT}`);
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
});
