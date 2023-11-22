import express, { json } from "express";
import cors from "cors";
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
