import User from "../models/userModel.js";
import Docs from "../models/docsModel.js";

export const createOrRetrieveUser = async (req, res) => {
  try {
    const checkUser = await User.findOne({ userId: req.body.userId });
    if (!checkUser) {
      const newUser = new User({
        userId: req.body.id,
        imageUrl: req.body.imageUrl,
        fullName: req.body.fullName,
      });
      const data = await newUser.save();
      return res.json(data);
    }
  } catch (error) {
    console.log("Error fetching/creating user", error);
  }
};

export const getUserDocs = async (req, res) => {
  try {
    const userDocs = await Docs.find({ userId: req.body.userId });
    return res.json(userDocs);
  } catch (error) {
    console.log("Error fetching user docs", error);
  }
};
