const Category = require("../models/category");
const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const decode = require("html-entities").decode;
const admin = true;

exports.location_list = asyncHandler(async (req, res, next) => {
  const allLocations = await Location.find({}, "name");
  allLocations.forEach((location) => {
    location.name = decode(decodeURIComponent(location.name));
  });
  res.render("location_list", {
    title: "Locations list",
    location_list: allLocations,
    admin: admin,
  });
});

exports.location_create_get = asyncHandler(async (req, res, next) => {
  res.render("location_form", {
    title: "Create location",
    location: false,
    errors: [],
    existing_error: false,
    admin: admin,
  });
});

exports.location_create_post = [
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    req.body.name = encodeURIComponent(req.body.name);
    next();
  },

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const location = new Location({ name: req.body.name });

    const existingLocation = await Location.findOne({
      name: req.body.name,
    });
    const existingError = existingLocation !== null;

    if (!errors.isEmpty() || existingError) {
      res.render("location_form", {
        title: "Create location",
        location: location,
        errors: errors.array(),
        existing_error: existingError,
        admin: admin,
      });
      return;
    } else {
      await location.save();
      res.redirect(location.url);
    }
  }),
];

exports.location_update_get = asyncHandler(async (req, res, next) => {
  const category = await Location.findById(req.params.id);
  category.name = decode(decodeURIComponent(category.name));

  res.render("category_form", {
    title: "Update category",
    category: category,
    errors: [],
    existing_error: false,
    admin: admin,
  });
});

exports.location_update_post = [
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    req.body.name = encodeURIComponent(req.body.name);
    next();
  },

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const location = new Location({
      name: req.body.name,
      _id: req.params.id,
    });

    // Prevent instance duplication
    const [existingLocation, prevValue] = await Promise.all([
      Location.findOne({
        name: req.body.name,
      }),
      Location.findById(req.params.id),
    ]);
    const existingError = existingLocation !== null;
    const editPrevInstance = prevValue.name.toString() === req.body.name;

    if (!errors.isEmpty() || (existingError && !editPrevInstance)) {
      res.render("location_form", {
        title: "Update location",
        location: location,
        errors: errors.array(),
        existing_error: existingError,
        admin: admin,
      });
      return;
    } else {
      await Location.findByIdAndUpdate(req.params.id, location, {});
      res.redirect(location.url);
    }
  }),
];

exports.location_delete_get = asyncHandler(async (req, res, next) => {
  const [location, itemInstanceList] = await Promise.all([
    Location.findById(req.params.id).exec(),
    ItemInstance.find({ location: req.params.id }).populate("item").exec(),
  ]);
  location.name = decodeURIComponent(location.name);
  console.log("itemInstanceList");
  console.log(itemInstanceList);
  itemInstanceList.forEach((itemInstance) => {
    itemInstance.name = decodeURIComponent(itemInstance.name);
    itemInstance.description = decodeURIComponent(itemInstance.description);
  });

  res.render("location_delete", {
    title: "Delete location: ",
    location: location,
    item_instance_list: itemInstanceList,
    admin: admin,
  });
});

exports.location_delete_post = asyncHandler(async (req, res, next) => {
  const [location, itemList] = await Promise.all([
    Location.findById(req.params.id).exec(),
    ItemInstance.find({ location: req.params.id }).populate("item").exec(),
  ]);

  if (itemList.length > 0) {
    res.render("location_delete", {
      title: "Delete location: ",
      location: location,
      item_instance_list: itemInstanceList,
      admin: admin,
    });
    return;
  } else {
    await Location.findByIdAndDelete(req.body.locationid);
    res.redirect("/catalog/locations");
  }
});

exports.location_detail = asyncHandler(async (req, res, next) => {
  const [location, itemInstanceList] = await Promise.all([
    Location.findById(req.params.id).exec(),
    ItemInstance.find({ location: req.params.id })
      .populate("item")
      .populate("stock_at_location")
      .exec(),
  ]);
  location.name = decodeURIComponent(location.name);
  location.name = decode(location.name);
  itemInstanceList.forEach((itemInstance) => {
    itemInstance.name = decodeURIComponent(itemInstance.name);
    itemInstance.description = decodeURIComponent(itemInstance.description);
  });

  res.render("location_detail", {
    title: "Location: ",
    location: location,
    item_instance_list: itemInstanceList,
    admin: admin,
  });
});
