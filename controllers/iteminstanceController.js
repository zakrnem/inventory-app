const ItemInstance = require("../models/iteminstance");
const Item = require("../models/item");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
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
  const allItems = await Item.find({})
  const allLocations = await Location.find({})
  allItems.forEach((item) => {
    item.name = decodeURIComponent(item.name)
  })
  allLocations.forEach((location) => {
    location.name = decodeURIComponent(location.name)
  })

  res.render("iteminstance_form", {
    title: "Create product instance",
    item_list: allItems,
    item_instance: false,
    location_list: allLocations,
    admin: admin,
  })
});

exports.iteminstance_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item instance create POST");
});

exports.iteminstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item instance update GET");
});

exports.iteminstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED, Item instance update POST");
});

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
