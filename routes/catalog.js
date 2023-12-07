const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");
const iteminstance_controller = require("../controllers/iteminstanceController");

// ITEM ROUTES

router.get("/", item_controller.item_list);

router.get("/item/create", item_controller.item_create_get);

router.post("/item/create", item_controller.item_create_post);

router.get("/item/:id/delete", item_controller.item_delete_get);

router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/item/:id/update", item_controller.item_update_get);

router.post("/item/:id/update", item_controller.item_update_post);

router.get("/item/:id", item_controller.item_detail);

// ITEM INSTANCE ROUTES

router.get("/iteminstances", iteminstance_controller.iteminstance_list);

router.get(
  "/iteminstance/create",
  iteminstance_controller.iteminstance_create_get,
);

router.post(
  "/iteminstance/create",
  iteminstance_controller.iteminstance_create_post,
);

router.get(
  "/iteminstance/:id/delete",
  iteminstance_controller.iteminstance_delete_get,
);

router.post(
  "/iteminstance/:id/delete",
  iteminstance_controller.iteminstance_delete_post,
);

router.get(
  "/iteminstance/:id/update",
  iteminstance_controller.iteminstance_update_get,
);

router.post(
  "/iteminstance/:id/update",
  iteminstance_controller.iteminstance_update_post,
);

router.get("/iteminstance/:id", iteminstance_controller.iteminstance_detail);

module.exports = router;
