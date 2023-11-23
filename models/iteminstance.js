const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemInstanceSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  number_in_stock: { type: number, required: true },
  sku: { type: String, required: true },
  location: { type: Schema.Types.ObjectId, ref: "Location" }
});

ItemInstanceSchema.virtual("url").get(function () {
  return `/catalog/iteminstance/${this._id}`;
});

module.exports = mongoose.model("Item Instance", ItemInstanceSchema);