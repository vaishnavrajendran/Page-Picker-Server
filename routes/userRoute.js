import express from "express";
import {
  createOrRetrieveUser,
  getUserDocs,
} from "../controller/userController.js";

const userRoute = express();
//GET
userRoute.get("/user-docs", getUserDocs);

//POST
userRoute.post("/getUser", createOrRetrieveUser);

export default userRoute;
