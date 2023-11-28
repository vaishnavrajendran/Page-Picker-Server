import express from "express";
import multer from "multer";

import {
  createNewPdf,
  createOrRetrieveUser,
  getUserDocs,
  storeImageToDb,
} from "../controller/userController.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const userRoute = express();
//GET
userRoute.get("/user-docs", getUserDocs);

//POST
userRoute.post("/getUser", createOrRetrieveUser);
userRoute.post("/file-upload", upload.single("file"), storeImageToDb);
userRoute.post("/extract-page", createNewPdf);

export default userRoute;
