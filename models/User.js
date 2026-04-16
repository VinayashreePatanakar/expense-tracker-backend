  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    theme: {
      type: String,
      default: "light",
    },
    createdAt: {
    type: Date,
    default: Date.now,
  },
  profilePic: {
  type: String,
  default: "",
  },
  }, { timestamps: true });

  export default mongoose.model("User", userSchema);