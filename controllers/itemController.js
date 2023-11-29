const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const admin = true;

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name price");

  res.render("item_list", {
    title: "Thinkpad Store",
    item_list: allItems,
    admin: admin,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({});

  res.render("item_form", {
    title: "Create product",
    categories: allCategories,
    admin: admin,
  });
});

exports.item_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item create POST");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item update GET");
});

exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item update POST");
});

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const itemDetails = await Item.findById(req.params.id).populate("category");
  const itemInstances = await ItemInstance.find({ item: req.params.id })
    .populate("location")
    .exec();

  res.render("item_delete", {
    title: "Delete product:",
    item_detail: itemDetails,
    item_instances: itemInstances,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item delete POST");
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const itemDetails = await Item.findById(req.params.id).populate("category");
  const itemInstances = await ItemInstance.find({ item: req.params.id })
    .populate("location")
    .exec();

  res.render("item_detail", {
    title: "Product detail",
    item_detail: itemDetails,
    item_instances: itemInstances,
    admin: admin,
  });
});
