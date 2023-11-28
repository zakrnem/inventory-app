#! /usr/bin/env node

console.log(
  'This script populates some test items, categories, locations and iteminstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"',
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");
const Location = require("./models/location");
const ItemInstance = require("./models/iteminstance");
require("dotenv").config();

const locations = [];
const categories = [];
const items = [];
const itemInstances = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@${process.env.URL}/inventory?retryWrites=true&w=majority`;

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createLocations();
  await createCategories();
  await createItems();
  await createItemInstances();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// location[0] will always be the Fantasy location, regardless of the order
// in which the elements of promise.all's argument complete.
async function locationCreate(index, name) {
  const location = new Location({ name: name });
  await location.save();
  locations[index] = location;
  console.log(`Added location: ${name}`);
}

async function itemCreate(
  index,
  name,
  description,
  category,
  specifications,
  price,
) {
  const itemsdetail = {
    name: name,
    price: price,
  };
  if (category != false) itemsdetail.category = category;
  if (specifications != false) itemsdetail.specifications = specifications;
  if (description != false) itemsdetail.description = description;

  const item = new Item(itemsdetail);

  await item.save();x
  items[index] = item;
  console.log(`Added items: ${name} ${price}`);
}

async function itemInstanceCreate(
  index,
  item,
  sku,
  location,
  stock_at_location,
) {
  const itemInstancedetail = {
    item: item,
    stock_at_location: stock_at_location,
  };

  if (sku != false) itemInstancedetail.sku = sku;
  if (location != false) itemInstancedetail.location = location;

  const itemInstance = new ItemInstance(itemInstancedetail);
  await itemInstance.save();
  itemInstances[index] = itemInstance;
  console.log(`Added itemInstance: ${sku} ${location.name}`);
}

async function categoryCreate(index, name) {
  const categorydetail = {
    name: name,
  };

  const category = new Category(categorydetail);
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function createLocations() {
  console.log("Adding locations");
  await Promise.all([
    locationCreate(0, "Alabama"),
    locationCreate(1, "Ohio"),
    locationCreate(2, "Illinois"),
    locationCreate(3, "Oregon"),
    locationCreate(4, "Nebraska"),
    locationCreate(5, "Iowa"),
  ]);
}

async function createItems() {
  console.log("Adding items");
  await Promise.all([
    itemCreate(
      0,
      "Lenovo Thinkpad P14",
      "A great laptop",
      categories[0],
      ["RAM: 32GB", "SSD: 1TB", "Display size: 14 in"],
      504,
    ),
    itemCreate(
      1,
      "Lenovo Thinkpad X220",
      "A ultraportable computer",
      categories[0],
      ["RAM: 2GB", "HDD: 120GB", "Display size: 12.5 in"],
      102,
    ),
    itemCreate(
      2,
      "Lenovo Thinkpad T410",
      "A classic laptop",
      categories[0],
      ["RAM: 4GB", "HDD: 250GB", "Display size: 14 in"],
      505,
    ),
    itemCreate(
      3,
      "Lenovo Thinkpad X1 Carbon (2nd gen)",
      "Constructed with satellite grade carbon fiber",
      categories[0],
      ["RAM: 8GB", "SSD: 120GB", "Display size: 14 in"],
      120,
    ),
    itemCreate(
      4,
      "IBM Lenovo Thinkpad T60p",
      "A corporate dream machine",
      categories[0],
      ["RAM: 512MB", "HDD: 80GB", "Display size: 14.1 in"],
      66,
    ),
    itemCreate(
      5,
      "Lenovo T420 Keyboard",
      "The classic beveled keyboard",
      categories[3],
      [
        "Brand: Genuine Lenovo",
        "Aplications: For IBM T410 T410I T420 T510 W510T520 X220 X220i W520  US layout",
        "Key travel: 2.5 mm",
      ],
      25,
    ),
    itemCreate(
      6,
      "Lenovo T430 9 cell battery",
      "More battery life for your Thinkpad",
      categories[2],
      [
        "Brand: Genuine Lenovo",
        "Capacity: 6600mAh",
        "Voltage: 10.8V",
        "Battery type: Li-ion",
      ],
      30,
    ),
    itemCreate(
      7,
      "T430 IPS Kit",
      "Improve your display and reduce eye strain",
      categories[1],
      [
        "Display Part Number: AUO B140HAN01.0",
        "Resolution: 1920x1080",
        "Luminance: 300 nit",
        "Contrast ratio: 800:1",
        "Comes with LCD controller",
      ],
      90,
    ),
    itemCreate(
      8,
      "Samsung 8gb Pc3-12800 Ddr3-1600mhz So-Dimm Memory",
      "More memory for multitasking",
      categories[4],
      ["Part Number: M471B1G73DB0-YK0", "DDR3-1600MHz", "8GB"],
      15,
    ),
  ]);
}

async function createItemInstances() {
  console.log("Adding item instances");
  await Promise.all([
    itemInstanceCreate(0, items[0], "Lap-Thi-P14", locations[0], 5),
    itemInstanceCreate(1, items[1], "Lap-Thi-X22", locations[3], 20),
    itemInstanceCreate(3, items[4], "Lap-Thi-T60", locations[1], 80),
    itemInstanceCreate(4, items[3], "Lap-Thi-X1C", locations[2], 13),
    itemInstanceCreate(5, items[4], "Lap-Thi-T60", locations[0], 66),
  ]);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "Laptops"),
    categoryCreate(1, "LCD Screens"),
    categoryCreate(2, "Batteries"),
    categoryCreate(3, "Keyboards"),
    categoryCreate(4, "RAMs"),
    categoryCreate(5, "SSDs"),
    categoryCreate(6, "Mouse & keyboards"),
  ]);
}
