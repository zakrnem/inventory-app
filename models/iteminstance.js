const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemInstanceSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  sku: { type: String },
  location: { type: Schema.Types.ObjectId, ref: "Location" },
  stock_at_location: { type: Number, required: true },
});

ItemInstanceSchema.virtual("url").get(function () {
  return `/catalog/iteminstance/${this._id}`;
});

module.exports = mongoose.model("Item Instance", ItemInstanceSchema);
