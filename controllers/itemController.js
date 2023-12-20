const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const decode = require("html-entities").decode;
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, "thumbnail" + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({});
  allItems.forEach((item) => (item.name = decodeURIComponent(item.name)));

  res.render("item_list", {
    title: "Thinkpad Store",
    item_list: allItems,
    admin: req.app.locals.admin,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({});
  allCategories.forEach(
    (category) => (category.name = decode(decodeURIComponent(category.name))),
  );

  res.render("item_form", {
    title: "Create product",
    categories: allCategories,
    item_detail: false,
    errors: [],
    existing_error: false,
    admin: req.app.locals.admin,
  });
});

exports.item_create_post = [
  upload.single("thumbnail"),
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
    req.body.name = encodeURIComponent(req.body.name);
    req.body.description = encodeURIComponent(req.body.description);
    next();
  },

  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),
  body("category.*").escape(),
  body("specification.*").escape(),
  body("price", "Price must be a valid number.").exists().isFloat({ min: 0 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const filePath = req.file ? req.file.filename : undefined;
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      specifications: req.body.specification,
      price: req.body.price,
      thumbnail: filePath,
    });

    const existingInstance = await Item.findOne({
      name: decode(decodeURIComponent(req.body.name)),
    });
    const existingError = existingInstance !== null;

    if (!errors.isEmpty() || existingError) {
      const allCategories = await Category.find({});
      allCategories.forEach(
        (category) =>
          (category.name = decode(decodeURIComponent(category.name))),
      );

      item.name = decode(decodeURIComponent(item.name));
      if (item.description)
        item.description = decode(decodeURIComponent(item.description));
      if (item.specifications)
        item.specifications = item.specifications.map((spec) =>
          decode(decodeURIComponent(spec)),
        );

      res.render("item_form", {
        title: "Create product",
        item_detail: item,
        categories: allCategories,
        admin: req.app.locals.admin,
        errors: errors.array(),
        existing_error: existingError,
      });
      return;
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [allCategories, itemDetails] = await Promise.all([
    Category.find({}),
    Item.findById(req.params.id).populate("category"),
  ]);

  itemDetails.name = decode(decodeURIComponent(itemDetails.name));
  if (itemDetails.description)
    itemDetails.description = decode(
      decodeURIComponent(itemDetails.description),
    );
  if (itemDetails.specifications)
    itemDetails.specifications = itemDetails.specifications.map((spec) =>
      decode(decodeURIComponent(spec)),
    );
  allCategories.forEach(
    (category) => (category.name = decode(decodeURIComponent(category.name))),
  );

  res.render("item_form", {
    title: "Update product",
    categories: allCategories,
    item_detail: itemDetails,
    errors: [],
    existing_error: false,
    admin: req.app.locals.admin,
  });
});

exports.item_update_post = [
  upload.single("thumbnail"),
  (req, res, next) => {
    if (!(req.body.specification instanceof Array)) {
      if (typeof req.body.specification === "undefined")
        req.body.specification = [];
      else req.body.specification = new Array(req.body.specification);
    }
    req.body.specification = req.body.specification.map((spec) =>
      encodeURIComponent(spec),
    );
    req.body.specification = req.body.specification.filter(
      (spec) => spec !== "",
    );
    req.body.name = encodeURIComponent(req.body.name);
    req.body.description = encodeURIComponent(req.body.description);
    next();
  },

  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description").trim().escape(),
  body("category.*").escape(),
  body("specification.*").escape(),
  body("price", "Price must be a valid number.").exists().isFloat({ min: 0 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const itemCategory = await Category.findById(req.body.category);
    const itemName = decode(decodeURIComponent(req.body.name));
    const filePath = req.file ? req.file.filename : undefined;
    const item = new Item({
      name: itemName,
      description: req.body.description,
      category: itemCategory,
      specifications: req.body.specification,
      price: req.body.price,
      _id: req.params.id,
      thumbnail: filePath,
    });
    const existingItem = await Item.find({ name: itemName });
    const prevValue = await Item.findById(req.params.id);
    const editPrevItem = prevValue.name === itemName;
    const existingError = existingItem.length > 0 && !editPrevItem;

    if (
      (prevValue.thumbnail !== undefined && item.thumbnail !== undefined) ||
      req.body.delete_thumbnail === "on"
    ) {
      const thumbnail = "public/uploads/" + prevValue.thumbnail;
      fs.stat(thumbnail, function (err, stats) {
        console.log(stats);

        if (err) {
          return console.error(err);
        }

        fs.unlink(thumbnail, function (err) {
          if (err) return console.log(err);
          console.log("file deleted successfully");
        });
      });
      if (req.body.delete_thumbnail === "on" && !req.file)
        item.thumbnail = null;
    }

    if (!errors.isEmpty() || existingError) {
      const allCategories = await Category.find({});
      allCategories.forEach(
        (category) =>
          (category.name = decode(decodeURIComponent(category.name))),
      );

      if (item.description)
        item.description = decode(decodeURIComponent(item.description));
      if (item.specifications)
        item.specifications = item.specifications.map((spec) =>
          decode(decodeURIComponent(spec)),
        );

      res.render("item_form", {
        title: "Update product",
        item_detail: item,
        categories: allCategories,
        admin: req.app.locals.admin,
        errors: errors.array(),
        existing_error: existingError,
      });
      return;
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url);
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const [itemDetails, itemInstances] = await Promise.all([
    Item.findById(req.params.id).populate("category"),
    ItemInstance.find({ item: req.params.id }).populate("location").exec(),
  ]);

  itemDetails.name = decode(decodeURIComponent(itemDetails.name));
  if (itemDetails.description)
    itemDetails.description = decode(
      decodeURIComponent(itemDetails.description),
    );
  if (itemDetails.specifications)
    itemDetails.specifications = itemDetails.specifications.map((spec) =>
      decode(decodeURIComponent(spec)),
    );
  itemInstances.location = decode(decodeURIComponent(itemInstances));

  res.render("item_delete", {
    title: "Delete product:",
    item_detail: itemDetails,
    item_instances: itemInstances,
    admin: req.app.locals.admin,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const [itemDetails, itemInstances] = await Promise.all([
    Item.findById(req.params.id).exec(),
    ItemInstance.find({ item: req.params.id }).exec(),
  ]);

  if (itemInstances.length > 0) {
    itemDetails.name = decode(decodeURIComponent(itemDetails.name));
    if (itemDetails.description)
      itemDetails.description = decode(
        decodeURIComponent(itemDetails.description),
      );
    if (itemDetails.specifications)
      itemDetails.specifications = itemDetails.specifications.map((spec) =>
        decode(decodeURIComponent(spec)),
      );
    itemInstances.location = decode(decodeURIComponent(itemInstances));

    res.render("item_delete", {
      title: "Delete product",
      item_detail: itemDetails,
      item_instances: itemInstances,
      admin: req.app.locals.admin,
    });
    return;
  } else {
    await Item.findByIdAndDelete(req.body.itemid);

    let thumbnail;
    if (itemDetails.thumbnail !== undefined) {
      thumbnail = "public/uploads/" + itemDetails.thumbnail;
    }
    fs.stat(thumbnail, function (err, stats) {
      console.log(stats);

      if (err) {
        return console.error(err);
      }

      fs.unlink(thumbnail, function (err) {
        if (err) return console.log(err);
        console.log("file deleted successfully");
      });
    });
    res.redirect("/catalog");
  }
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const [itemDetails, itemInstances] = await Promise.all([
    Item.findById(req.params.id).populate("category"),
    ItemInstance.find({ item: req.params.id }).populate("location").exec(),
  ]);

  itemDetails.name = decode(decodeURIComponent(itemDetails.name));
  if (itemDetails.description)
    itemDetails.description = decode(
      decodeURIComponent(itemDetails.description),
    );
  if (itemDetails.specifications)
    itemDetails.specifications = itemDetails.specifications.map((spec) =>
      decode(decodeURIComponent(spec)),
    );
  if (itemDetails.category) {
    itemDetails.category.name = decode(
      decodeURIComponent(itemDetails.category.name),
    );
  }
  itemInstances.forEach((instance) => {
    instance.location.name = decode(decodeURIComponent(instance.location.name));
  });

  let thumbnail;
  if (itemDetails.thumbnail) {
    thumbnail = "/uploads/" + itemDetails.thumbnail;
  } else {
    thumbnail = false;
  }

  res.render("item_detail", {
    title: "Product detail",
    item_detail: itemDetails,
    item_instances: itemInstances,
    item_thumbnail: thumbnail,
    admin: req.app.locals.admin,
  });
});
