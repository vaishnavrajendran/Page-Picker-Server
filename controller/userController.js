import fs from "fs/promises";
import { Poppler } from "node-poppler";
import { PDFDocument } from "pdf-lib";
import path from "path";

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
  // Backend validation
  if (req.file.mimetype === "application/pdf") {
    try {
      const userId = req.query.userId;
      const { originalname, filename } = req.file;
      const pdfPath = `uploads/${filename}`;
      const imageName = `${filename.replace(".pdf", "")}.png`;
      const imagePath = `images/${imageName}`;

      // Convert 1st page of PDF to an image for thumbnail
      const poppler = new Poppler("/usr/bin");
      const options = {
        firstPageToConvert: 1,
        lastPageToConvert: 1,
        pngFile: true,
      };

      // Output file without extension
      const outputFile = `images/${path.basename(
        imagePath,
        path.extname(imagePath)
      )}`;
      await poppler.pdfToCairo(pdfPath, outputFile, options);

      // Find the image name after conversion
      const imageFiles = await fs.readdir(path.dirname(imagePath));
      const convertedImageName = imageFiles.find((file) =>
        file.startsWith(path.basename(imagePath, path.extname(imagePath)))
      );

      // Save PDF info to the database
      const newFile = new Docs({
        userId,
        path: pdfPath,
        fileName: originalname,
        imagePath: `images/${convertedImageName}`,
      });

      const newPdf = await newFile.save();
      return res.json(newPdf);
    } catch (error) {
      console.error("Error storing image and PDF info", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(500).json({ error: "Only pdf files accepted" });
  }
};

export const createNewPdf = async (req, res) => {
  try {
    const { path, pageOrder, selectedPages } = req.body;

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

    res.json({ downloadLink: `http://localhost:8080/${outputPath}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error occurred while creating pdf" });
  }
};
