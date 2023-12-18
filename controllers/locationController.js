const Item = require("../models/item");
const ItemInstance = require("../models/iteminstance");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const decode = require("html-entities").decode;
const admin = require("../app").admin;

exports.location_list = asyncHandler(async (req, res, next) => {
  const allLocations = await Location.find({}, "name");
  allLocations.forEach((location) => {
    location.name = decode(decodeURIComponent(location.name));
  });
  res.render("location_list", {
    title: "Locations list",
    location_list: allLocations,
    admin: req.app.locals.admin,
  });
});

exports.location_create_get = asyncHandler(async (req, res, next) => {
  res.render("location_form", {
    title: "Create location",
    location: false,
    errors: [],
    existing_error: false,
    admin: req.app.locals.admin,
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
      location.name = decode(decodeURIComponent(location.name));
      res.render("location_form", {
        title: "Create location",
        location: location,
        errors: errors.array(),
        existing_error: existingError,
        admin: req.app.locals.admin,
      });
      return;
    } else {
      await location.save();
      res.redirect(location.url);
    }
  }),
];

exports.location_update_get = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  location.name = decode(decodeURIComponent(location.name));

  res.render("location_form", {
    title: "Update location",
    location: location,
    errors: [],
    existing_error: false,
    admin: req.app.locals.admin,
  });
});

exports.location_update_post = [
  body("name", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    req.body.name = encodeURIComponent(req.body.name);
    const location = new Location({
      name: req.body.name,
      _id: req.params.id,
    });

    const [existingLocation, prevValue] = await Promise.all([
      Location.findOne({
        name: req.body.name,
      }),
      Location.findById(req.params.id),
    ]);
    const editPrevInstance = prevValue.name.toString() === req.body.name;
    const existingError = existingLocation !== null && !editPrevInstance;

    if (!errors.isEmpty() || existingError) {
      res.render("location_form", {
        title: "Update location",
        location: location,
        errors: errors.array(),
        existing_error: existingError,
        admin: req.app.locals.admin,
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
  location.name = decode(decodeURIComponent(location.name));
  itemInstanceList.forEach((itemInstance) => {
    itemInstance.name = decode(decodeURIComponent(itemInstance.name));
    itemInstance.description = decode(
      decodeURIComponent(itemInstance.description),
    );
  });

  res.render("location_delete", {
    title: "Delete location: ",
    location: location,
    item_instance_list: itemInstanceList,
    admin: req.app.locals.admin,
  });
});

exports.location_delete_post = asyncHandler(async (req, res, next) => {
  const [location, itemInstanceList] = await Promise.all([
    Location.findById(req.params.id).exec(),
    ItemInstance.find({ location: req.params.id }).populate("item").exec(),
  ]);

  if (itemList.length > 0) {
    res.render("location_delete", {
      title: "Delete location: ",
      location: location,
      item_instance_list: itemInstanceList,
      admin: req.app.locals.admin,
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
  location.name = decode(decodeURIComponent(location.name));
  itemInstanceList.forEach((itemInstance) => {
    itemInstance.name = decode(decodeURIComponent(itemInstance.name));
    itemInstance.description = decode(
      decodeURIComponent(itemInstance.description),
    );
  });

  res.render("location_detail", {
    title: "Location: ",
    location: location,
    item_instance_list: itemInstanceList,
    admin: req.app.locals.admin,
  });
});
