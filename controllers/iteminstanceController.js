const mongoose = require("mongoose");
const ItemInstance = require("../models/iteminstance");
const Item = require("../models/item");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const decode = require("html-entities").decode;

exports.iteminstance_list = asyncHandler(async (req, res, next) => {
  const allIteminstances = await ItemInstance.find({})
    .populate("item")
    .populate("location");
  allIteminstances.forEach((instance) => {
    instance.item.name = decode(decodeURIComponent(instance.item.name));
    instance.location.name = decode(decodeURIComponent(instance.location.name));
  });

  res.render("iteminstance_list", {
    title: "Product instance list",
    iteminstance_list: allIteminstances,
    admin: req.app.locals.admin,
  });
});

exports.iteminstance_create_get = asyncHandler(async (req, res, next) => {
  const [allItems, allLocations] = await Promise.all([
    Item.find({}),
    Location.find({}),
  ]);
  allItems.forEach((item) => {
    item.name = decode(decodeURIComponent(item.name));
  });
  allLocations.forEach((location) => {
    location.name = decode(decodeURIComponent(location.name));
  });

  res.render("iteminstance_form", {
    title: "Create product instance",
    item_list: allItems,
    item_instance: false,
    location_list: allLocations,
    admin: req.app.locals.admin,
    errors: [],
    existing_error: false,
  });
});

exports.iteminstance_create_post = [
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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    req.body.sku = encodeURIComponent(req.body.sku);

    const itemInstance = new ItemInstance({
      item: req.body.item,
      sku: req.body.sku,
      location: req.body.location,
      stock_at_location: req.body.stock_at_location,
    });

    const existingInstance = await ItemInstance.findOne({
      item: new mongoose.Types.ObjectId(req.body.item),
      location: new mongoose.Types.ObjectId(req.body.location),
    });
    const existingError = existingInstance !== null;

    if (!errors.isEmpty() || existingError) {
      const [allItems, allLocations] = await Promise.all([
        Item.find({}),
        Location.find({}),
      ]);

      itemInstance.sku = decode(decodeURIComponent(itemInstance.sku));
      allItems.forEach((item) => {
        item.name = decode(decodeURIComponent(item.name));
      });
      allLocations.forEach((location) => {
        location.name = decode(decodeURIComponent(location.name));
      });

      res.render("iteminstance_form", {
        title: "Create product instance",
        item_list: allItems,
        selected_item: itemInstance.item._id,
        item_instance: itemInstance,
        location_list: allLocations,
        admin: req.app.locals.admin,
        errors: errors.array(),
        existing_error: existingError,
      });
    } else {
      await itemInstance.save();
      res.redirect(itemInstance.url);
    }
  }),
];

exports.iteminstance_update_get = asyncHandler(async (req, res, next) => {
  const [allItems, allLocations, itemInstance] = await Promise.all([
    Item.find({}),
    Location.find({}),
    ItemInstance.findById(req.params.id),
  ]);

  allItems.forEach((item) => {
    item.name = decode(decodeURIComponent(item.name));
  });
  allLocations.forEach((location) => {
    location.name = decode(decodeURIComponent(location.name));
  });
  itemInstance.sku = decode(decodeURIComponent(itemInstance.sku));

  res.render("iteminstance_form", {
    title: "Update product instance",
    item_list: allItems,
    selected_item: itemInstance.item._id,
    item_instance: itemInstance,
    location_list: allLocations,
    admin: req.app.locals.admin,
    errors: [],
    existing_error: false,
  });
});

exports.iteminstance_update_post = [
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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const itemInstance = new ItemInstance({
      item: req.body.item,
      sku: req.body.sku,
      location: req.body.location,
      stock_at_location: req.body.stock_at_location,
      _id: req.params.id,
    });

    const existingInstance = await ItemInstance.find({
      item: new mongoose.Types.ObjectId(req.body.item),
      location: new mongoose.Types.ObjectId(req.body.location),
    });
    const prevValue = await ItemInstance.findById(req.params.id);
    const editPrevInstance =
      prevValue.item.toString() === req.body.item &&
      prevValue.location.toString() === req.body.location;
    const existingError = existingInstance.length > 0 && !editPrevInstance;

    if (!errors.isEmpty() || existingError) {
      const [allItems, allLocations] = await Promise.all([
        Item.find({}),
        Location.find({}),
      ]);

      itemInstance.sku = decode(itemInstance.sku);
      allItems.forEach((item) => {
        item.name = decode(decodeURIComponent(item.name));
      });
      allLocations.forEach((location) => {
        location.name = decode(decodeURIComponent(location.name));
      });

      res.render("iteminstance_form", {
        title: "Update product instance",
        item_list: allItems,
        selected_item: itemInstance.item._id,
        item_instance: itemInstance,
        location_list: allLocations,
        admin: req.app.locals.admin,
        errors: errors.array(),
        existing_error: existingError,
      });
    } else {
      await ItemInstance.findByIdAndUpdate(req.params.id, itemInstance, {});
      res.redirect(itemInstance.url);
    }
  }),
];

exports.iteminstance_delete_get = asyncHandler(async (req, res, next) => {
  const itemInstance = await ItemInstance.findById(req.params.id)
    .populate("item")
    .populate("location");

  itemInstance.item.name = decode(decodeURIComponent(itemInstance.item.name));
  itemInstance.location.name = decode(
    decodeURIComponent(itemInstance.location.name),
  );

  res.render("iteminstance_delete", {
    title: "Delete product instance: ",
    item_instance: itemInstance,
    admin: req.app.locals.admin,
  });
});

exports.iteminstance_delete_post = asyncHandler(async (req, res, next) => {
  await ItemInstance.findByIdAndDelete(req.body.iteminstanceid);
  res.redirect("/catalog/iteminstances");
});

exports.iteminstance_detail = asyncHandler(async (req, res, next) => {
  const iteminstanceDetails = await ItemInstance.findById(req.params.id)
    .populate("item")
    .populate("location");

  iteminstanceDetails.item.name = decode(
    decodeURIComponent(iteminstanceDetails.item.name),
  );
  iteminstanceDetails.location.name = decode(
    decodeURIComponent(iteminstanceDetails.location.name),
  );
  iteminstanceDetails.sku = decode(decodeURIComponent(iteminstanceDetails.sku));

  res.render("iteminstance_detail", {
    title: "Id: ",
    iteminstance_detail: iteminstanceDetails,
    admin: req.app.locals.admin,
  });
});
