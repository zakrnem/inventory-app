const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  specifications: { type: Array },
  price: { type: Number, required: true },
  thumbnail: { type: String },
});

ItemSchema.virtual("url").get(function () {
  return `/catalog/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
