const Category = require("../models/category");
const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const decode = require("html-entities").decode;
const admin = true;

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, "name");
  allCategories.forEach((category) => {
    category.name = decode(decodeURIComponent(category.name))
  })
  res.render("category_list", {
    title: "Categories list",
    category_list: allCategories,
    admin: admin,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", {
    title: "Create category",
    category: false,
    errors: [],
    existing_error: false,
    admin: admin,
  });
});

exports.category_create_post = [
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    req.body.name = encodeURIComponent(req.body.name);
    next();
  },

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({ name: req.body.name });

    const existingCategory = await Category.findOne({
      name: req.body.name,
    });
    const existingError = existingCategory !== null;

    if (!errors.isEmpty() || existingError) {
      res.render("category_form", {
        title: "Create category",
        category: category,
        errors: errors.array(),
        existing_error: existingError,
        admin: admin,
      });
      return;
    } else {
      await category.save();
      res.redirect(category.url);
    }
  }),
];

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  category.name = decode(decodeURIComponent(category.name))

  res.render("category_form", {
    title: "Update category",
    category: category,
    errors: [],
    existing_error: false,
    admin: admin,
  });
});

exports.category_update_post = [
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    req.body.name = encodeURIComponent(req.body.name);
    next();
  },

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      _id: req.params.id,
    });

    // Prevent instance duplication
    const [existingCategory, prevValue] = await Promise.all([
      Category.findOne({
        name: req.body.name,
      }),
      Category.findById(req.params.id),
    ]);
    const existingError = existingCategory !== null;
    const editPrevInstance = prevValue.name.toString() === req.body.name;

    if (!errors.isEmpty() || (existingError && !editPrevInstance)) {
      res.render("category_form", {
        title: "Update category",
        category: category,
        errors: errors.array(),
        existing_error: existingError,
        admin: admin,
      });
      return;
    } else {
      await Category.findByIdAndUpdate(req.params.id, category, {});
      res.redirect(category.url);
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, itemList] = await Promise.all([
    Category.findById(req.params.id).exec(),
    ItemInstance.find({ item: req.params.id }).exec(),
  ]);
  category.name = decodeURIComponent(category.name);
  itemList.forEach((item) => {
    item.name = decodeURIComponent(item.name);
    item.description = decodeURIComponent(item.description);
  });

  res.render("category_delete", {
    title: "Delete category: ",
    category: category,
    item_list: itemList,
    admin: admin,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, itemList] = await Promise.all([
    Category.findById(req.params.id).exec(),
    ItemInstance.find({ item: req.params.id }).exec(),
  ]);

  if (itemList.length > 0) {
    res.render("item_delete", {
      title: "Delete category: ",
      category: category,
      item_list: itemList,
      admin: admin,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/catalog/categories");
  }
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, itemList] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);
  category.name = decodeURIComponent(category.name)
  category.name = decode(category.name)
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
