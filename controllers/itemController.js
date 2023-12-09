const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const admin = true;

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({});
  allItems.forEach((item) => (item.name = decodeURIComponent(item.name)));

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
    errors: [],
    admin: admin,
  });
});

exports.item_create_post = [
  // Convert the specification to an array.
  (req, res, next) => {
    if (!(req.body.specification instanceof Array)) {
      if (typeof req.body.specification === "undefined")
        req.body.specification = [];
      else req.body.specification = new Array(req.body.specification);
    }
    req.body.specification = req.body.specification.map((item) =>
      encodeURIComponent(item),
    );
    req.body.specification = req.body.specification.filter(
      (item) => item !== "",
    );
    next();
  },

  (req, res, next) => {
    req.body.name = encodeURIComponent(req.body.name);
    req.body.description = encodeURIComponent(req.body.description);
    next();
  },

  // Validate and sanitize fields.
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),
  body("category.*").escape(),
  body("specification.*").escape(),
  body("price", "Price must be a valid number.").exists().isFloat({ min: 0 }),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    const allCategories = await Category.find({});

    // Create Item object with escaped and trimmed data
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      specifications: req.body.specification,
      price: req.body.price,
    });

    item.name = decodeURIComponent(item.name);
    if (item.description) item.description = decodeURIComponent(item.description);
    if (item.specifications)
      item.specifications = item.specifications.map((spec) =>
        decodeURIComponent(spec),
      );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("item_form", {
        title: "Create product",
        item: item,
        categories: allCategories,
        admin: admin,
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

  item.name = decodeURIComponent(item.name);
  if (item.description) item.description = decodeURIComponent(item.description);
  if (item.specifications)
    item.specifications = item.specifications.map((spec) =>
      decodeURIComponent(spec),
    );

  res.render("item_form", {
    title: "Update product",
    categories: allCategories,
    item: item,
    errors: [],
    admin: admin,
  });
});

exports.item_update_post = [
  // Convert the specification to an array.
  (req, res, next) => {
    if (!(req.body.specification instanceof Array)) {
      if (typeof req.body.specification === "undefined")
        req.body.specification = [];
      else req.body.specification = new Array(req.body.specification);
    }
    req.body.specification = req.body.specification.map((item) =>
      encodeURIComponent(item),
    );
    req.body.specification = req.body.specification.filter(
      (item) => item !== "",
    );
    next();
  },

  (req, res, next) => {
    req.body.name = encodeURIComponent(req.body.name);
    req.body.description = encodeURIComponent(req.body.description);
    next();
  },

  // Validate and sanitize fields.
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),
  body("category.*").escape(),
  body("specification.*").escape(),
  body("price", "Price can't be a negative number.")
    .exists()
    .isFloat({ min: 0, max: 30000 }),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    const allCategories = await Category.find({});

    // Create Item object with escaped and trimmed data
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      specifications: req.body.specification,
      price: req.body.price,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    item.name = decodeURIComponent(item.name);
    if (item.description) item.description = decodeURIComponent(item.description);
    if (item.specifications)
      item.specifications = item.specifications.map((spec) =>
        decodeURIComponent(spec),
      );

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("item_form", {
        title: "Update product",
        item: item,
        categories: allCategories,
        admin: admin,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save item.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to new item record.
      res.redirect(updatedItem.url);
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const itemDetails = await Item.findById(req.params.id).populate("category");
  const itemInstances = await ItemInstance.find({ item: req.params.id })
    .populate("location")
    .exec();

  itemDetails.name = decodeURIComponent(itemDetails.name);
  if (itemDetails.description)
    itemDetails.description = decodeURIComponent(itemDetails.description);
  if (itemDetails.specifications)
    itemDetails.specifications = itemDetails.specifications.map((spec) =>
      decodeURIComponent(spec),
    );

  itemInstances.location = decodeURIComponent(itemInstances);

  res.render("item_delete", {
    title: "Delete product:",
    item_detail: itemDetails,
    item_instances: itemInstances,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of item and all their instances (in parallel)
  const [item, itemInstances] = await Promise.all([
    Item.findById(req.params.id).exec(),
    ItemInstance.find({ item: req.params.id }).exec(),
  ]);

  if (itemInstances.length > 0) {
    // Item has instances. Render in same way as for GET route.
    res.render("item_delete", {
      title: "Delete Product",
      item: item,
      item_instances: itemInstances,
    });
    return;
  } else {
    // Item has no instances. Delete object and redirect to the list of items.
    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect("/catalog");
  }
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const itemDetails = await Item.findById(req.params.id).populate("category");
  const itemInstances = await ItemInstance.find({ item: req.params.id })
    .populate("location")
    .exec();

  itemDetails.name = decodeURIComponent(itemDetails.name);
  if (itemDetails.description)
    itemDetails.description = decodeURIComponent(itemDetails.description);
  if (itemDetails.specifications)
    itemDetails.specifications = itemDetails.specifications.map((spec) =>
      decodeURIComponent(spec),
    );

  res.render("item_detail", {
    title: "Product detail",
    item_detail: itemDetails,
    item_instances: itemInstances,
    admin: admin,
  });
});
