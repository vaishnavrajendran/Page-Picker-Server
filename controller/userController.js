import fs from "fs/promises";
import poppler from "pdf-poppler";
import { PDFDocument } from "pdf-lib";

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
    console.error("Error fetching/creating user", error);
  }
};

export const getUserDocs = async (req, res) => {
  try {
    const userId = req.query.userId;
    const userDocs = await Docs.find({ userId: userId });
    return res.json(userDocs);
  } catch (error) {
    console.error("Error fetching user docs", error);
  }
};

export const storeImageToDb = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { originalname, filename } = req.file;
    const pdfPath = `uploads/${filename}`;
    const imagePath = `images/${filename.replace(".pdf", "-1.png")}`;

    console.log(originalname, filename, pdfPath, imagePath);

    // Save PDF info to the database
    const newFile = new Docs({
      userId,
      path: pdfPath,
      fileName: originalname,
      imagePath,
    });
    const newPdf = await newFile.save();

    // Convert PDF to an image (1st page) and save it
    const opts = {
      format: "png",
      out_dir: "images",
      out_prefix: filename.replace(".pdf", ""),
      page: 1,
    };
    await poppler.convert(pdfPath, opts);
    return res.json(newPdf);
  } catch (error) {
    console.error("Error storing image and PDF info", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createNewPdf = async (req, res) => {
  try {
    const { path, userId, pageOrder, selectedPages } = req.body;

    // Read pdf
    const pdfBytes = await fs.readFile(path);
    const donorPdf = await PDFDocument.load(pdfBytes);

    // Creating a new pdf
    const pdfDoc = await PDFDocument.create();

    // Extract selectedPages
    const extractedPages = {};
    for (const key in selectedPages) {
      if (selectedPages[key]) {
        const [existingPage] = await pdfDoc.copyPages(donorPdf, [
          parseInt(key, 10) - 1,
        ]);
        extractedPages[key] = existingPage;
      }
    }

    // Rearrange selectedPages
    for (const order of pageOrder) {
      if (extractedPages[order]) {
        pdfDoc.addPage(extractedPages[order]);
      }
    }

    // Save the modified PDF
    const modifiedBytes = await pdfDoc.save();
    const outputPath = `modifiedPdf/modified${Date.now()}.pdf`;
    await fs.writeFile(outputPath, modifiedBytes);

    res.json({ downloadLink: outputPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error occurred while creating pdf" });
  }
};