const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  name: { type: String, required: true }
});

LocationSchema.virtual("url").get(function () {
  return `/catalog/location/${this._id}`;
});

module.exports = mongoose.model("Location", LocationSchema);