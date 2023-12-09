const ItemInstance = require("../models/iteminstance");
const Item = require("../models/item");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const decode = require("html-entities").decode;
const admin = true;

exports.iteminstance_list = asyncHandler(async (req, res, next) => {
  const allIteminstances = await ItemInstance.find({})
    .populate("item")
    .populate("location");
  allIteminstances.forEach((instance) => {
    instance.item.name = decodeURIComponent(instance.item.name);
    instance.location.name = decodeURIComponent(instance.location.name);
  });

  res.render("iteminstance_list", {
    title: "Product Instance List",
    iteminstance_list: allIteminstances,
    admin: admin,
  });
});

exports.iteminstance_create_get = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({});
  const allLocations = await Location.find({});
  allItems.forEach((item) => {
    item.name = decodeURIComponent(item.name);
  });
  allLocations.forEach((location) => {
    location.name = decodeURIComponent(location.name);
  });

  res.render("iteminstance_form", {
    title: "Create product instance",
    item_list: allItems,
    item_instance: false,
    location_list: allLocations,
    admin: admin,
    errors: [],
  });
});

exports.iteminstance_create_post = [
  // Validate and sanitize fields
  body("item", "Product must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("sku").trim().escape(),
  body("location", "Location must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock_at_location", "Stock must be a valid number")
    .exists()
    .isFloat({ min: 0 }),

  // Process request
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const itemInstance = new ItemInstance({
      item: req.body.item,
      sku: req.body.sku,
      location: req.body.location,
      stock_at_location: req.body.stock_at_location,
    });

    
    if (!errors.isEmpty()) {
      const allItems = await Item.find({});
      const allLocations = await Location.find({});

      itemInstance.sku = decode(itemInstance.sku);
      allItems.forEach((item) => {
        item.name = decodeURIComponent(item.name);
      });
      allLocations.forEach((location) => {
        location.name = decodeURIComponent(location.name);
      });

      res.render("iteminstance_form", {
        title: "Create product instance",
        item_list: allItems,
        selected_item: itemInstance.item._id,
        item_instance: itemInstance,
        location_list: allLocations,
        admin: admin,
        errors: errors.array(),
      });
    } else {
      await itemInstance.save();
      res.redirect(itemInstance.url);
    }
  }),
];

exports.iteminstance_update_get = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({});
  const allLocations = await Location.find({});
  const itemInstance = await ItemInstance.findById(req.params.id)

  allItems.forEach((item) => {
    item.name = decodeURIComponent(item.name);
  });
  allLocations.forEach((location) => {
    location.name = decodeURIComponent(location.name);
  });

  res.render("iteminstance_form", {
    title: "Update product instance",
    item_list: allItems,
    selected_item: itemInstance.item._id,
    item_instance: itemInstance,
    location_list: allLocations,
    admin: admin,
    errors: [],
  });
});

exports.iteminstance_update_post = [
  // Validate and sanitize fields
  body("item", "Product must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("sku").trim().escape(),
  body("location", "Location must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock_at_location", "Stock must be a valid number")
    .exists()
    .isFloat({ min: 0 }),

  // Process request
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const itemInstance = new ItemInstance({
      item: req.body.item,
      sku: req.body.sku,
      location: req.body.location,
      stock_at_location: req.body.stock_at_location,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });
    
    if (!errors.isEmpty()) {
      const allItems = await Item.find({});
      const allLocations = await Location.find({});

      itemInstance.sku = decode(itemInstance.sku);
      allItems.forEach((item) => {
        item.name = decodeURIComponent(item.name);
      });
      allLocations.forEach((location) => {
        location.name = decodeURIComponent(location.name);
      });

      res.render("iteminstance_form", {
        title: "Update product instance",
        item_list: allItems,
        selected_item: itemInstance.item._id,
        item_instance: itemInstance,
        location_list: allLocations,
        admin: admin,
        errors: errors.array(),
      });
    } else {
      await ItemInstance.findByIdAndUpdate(req.params.id, itemInstance, {});
      res.redirect(itemInstance.url);
    }
  }),
];

exports.iteminstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item instance delete GET");
});

exports.iteminstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item instance delete POST");
});

exports.iteminstance_detail = asyncHandler(async (req, res, next) => {
  const iteminstanceDetails = await ItemInstance.findById(req.params.id)
    .populate("item")
    .populate("location");

  iteminstanceDetails.item.name = decodeURIComponent(
    iteminstanceDetails.item.name,
  );
  iteminstanceDetails.location.name = decodeURIComponent(
    iteminstanceDetails.location.name,
  );

  res.render("iteminstance_detail", {
    title: "Product instance detail",
    iteminstance_detail: iteminstanceDetails,
    admin: admin,
  });
});
