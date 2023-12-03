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
    item: false,
    admin: admin,
  });
});

exports.item_create_post = [
// Convert the category to an array.
(req, res, next) => {
  if (!(req.body.category instanceof Array)) {
    if (typeof req.body.category === "undefined") req.body.category = [];
    else req.body.category = new Array(req.body.category);
  }
  next();
},

// Convert the specification to an array.
(req, res, next) => {
  if (!(req.body.specification instanceof Array)) {
    if (typeof req.body.specification === "undefined") req.body.specification = [];
    else req.body.specification = new Array(req.body.specification);
  }
  next();
},

  // Validate and sanitize fields.
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),
  body("category.*").escape(),
  body("specification.*").escape(),
  body("price", "Price must not be empty.")
    .exists()
    .isFloat({ min: 0, max: 30000 }),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Item object with escaped and trimmed data
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      specifications: req.body.specification,
      price: req.body.price,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("item_form", {
        title: "Create product",
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save item.
      await item.save();
      // Redirect to new item record.
      res.redirect(item.url);
    }
  }),
];

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({});
  const item = await Item.findById(req.params.id).populate("category");

  res.render("item_form", {
    title: "Update product",
    categories: allCategories,
    item: item,
    admin: admin,
  });
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
