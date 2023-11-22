import User from "../models/userModel.js";
import Docs from "../models/docsModel.js";

export const createOrRetrieveUser = async (req, res) => {
  try {
    const checkUser = await User.findOne({ userId: req.body.id });
    if (!checkUser) {
      const newUser = new User({
        userId: req.body.id,
        imageUrl: req.body.imageUrl,
        fullName: req.body.fullName,
      });
      const data = await newUser.save();
      return res.json(data);
    }
    return res.json(checkUser);
  } catch (error) {
    console.log("Error fetching/creating user", error);
  }
};

export const getUserDocs = async (req, res) => {
  try {
    const userId = req.query.userId;
    const userDocs = await Docs.find({ userId: userId });
    return res.json(userDocs);
  } catch (error) {
    console.log("Error fetching user docs", error);
  }
};

export const storeImageToDb = async (req, res) => {
  try {
    const { originalname, filename } = req.file;
    const newFile = new Docs({
      userId: req.body.userId,
      filename: originalname,
      path: `uploads/${filename}`,
    });
    const newPdf = await newFile.save();
    res.json(newPdf);
  } catch (error) {
    console.log("Error storing image name", error);
  }
};
