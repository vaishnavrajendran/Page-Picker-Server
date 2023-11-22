import mongoose from "mongoose";

const docsSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Docs", docsSchema);
