import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default:
        "https://www.salepepe.it/files/2017/06/scritta-di-sale-Too-much-salt.jpg",
    },

    category: {
      type: String,
      default: "uncategorized",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
