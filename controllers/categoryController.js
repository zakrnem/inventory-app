const Category = require("../models/category");
const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const admin = true;

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, "name");
  res.render("category_list", {
    title: "Categories list",
    category_list: allCategories,
    admin: admin,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Category create GET");
});

exports.category_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Category create POST");
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Category update GET");
});

exports.category_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Category update POST");
});

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Category delete GET");
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Category delete POST");
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();
  const itemList = await Item.find({ category: req.params.id }).exec();
  itemList.forEach((item) => {
    item.name = decodeURIComponent(item.name);
    item.description = decodeURIComponent(item.description);
  });

  res.render("category_detail", {
    title: "Category: ",
    category: category,
    item_list: itemList,
    admin: admin,
  });
});
