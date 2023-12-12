const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");
const iteminstance_controller = require("../controllers/iteminstanceController");
const category_controller = require("../controllers/categoryController");

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

// CATEGORY ROUTES

router.get("/categories", category_controller.category_list);

router.get("/category/create", category_controller.category_create_get);

router.post("/category/create", category_controller.category_create_post);

router.get("/category/:id/delete", category_controller.category_delete_get);

router.post("/category/:id/delete", category_controller.category_delete_post);

router.get("/category/:id/update", category_controller.category_update_get);

router.post("/category/:id/update", category_controller.category_update_post);

router.get("/category/:id", category_controller.category_detail);

module.exports = router;
