const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// add handlers and middleware functions to create, read, update, and list dishes. Note that dishes cannot be deleted.
function list(req, res) {
  res.json({ data: dishes });
}
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  //returns 400 if name is missing
  //returns 400 if description is missing
  //returns 400 if image_url is empty
  if (!name) {
    res.status(400).json({ error: "name is missing" });
  }
  else if (!description) {
    res.status(400).json({ error: "description is missing" });
  }
  else if (!image_url) {
    res.status(400).json({ error: "image_url is empty" });
  }
  //returns 400 if price is missing
  else if (!price) {
    res.status(400).json({ error: "price is missing" });
  }
  //returns 400 if price is not a number
  else if (isNaN(price)) {
    res.status(400).json({ error: "price is not a number" });
  }
  //returns 400 if price is less than 0
  else if (price < 0) {
    res.status(400).json({ error: "price is less than 0" });
  }
  //returns 400 if price is greater than 1000
  else {
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }
}

// function listDishes(req, res) {
//   const { dishId } = req.params;
//   const foundDish = dishes.find((dish) => dish.id === dishId);
//   if (foundDish) {
//     res.json({ data: dishes });
//   } else {
//     res.status(404).json({ error: `Dish id not found: ${dishId}` });
//   }
// }

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}
function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  //returns 400 if data.id does not match :dishId in the route
  if (res.locals.dish.id !== req.body.data.id &&(req.body.data.id)) {
    res.status(400).json({ error: "data.id "+req.body.data.id +" does not match :dishId "+res.locals.dish.id+" in the route" });
  }
  // if (res.locals.dish.id===null||res.locals.dish.id ===""||res.locals.dish.id ===undefined) {
  //   res.status(400).json({ error: "data.id is missing" });
  // }
  if (!name) {
    res.status(400).json({ error: "name is missing" });
  }

  if (!description) {
    res.status(400).json({ error: "description is missing" });
  }

  if (!image_url) {
    res.status(400).json({ error: "image_url is empty" });
  }

  if (!price) {
    res.status(400).json({ error: "price is missing" });
  }

  //returns 400 if price is not an integer
  if(!Number.isInteger(price)) {
    res.status(400).json({ error: "price is not a number" });
  }

  if (price < 0) {
    res.status(400).json({ error: "price is less than 0" });
  }

  //else
  res.locals.dish.name = name;
  res.locals.dish.description = description;
  res.locals.dish.price = price;
  res.locals.dish.image_url = image_url;
  res.json({ data: res.locals.dish });
}

// function deleteDish(req, res) {
//   const { dishId } = req.params;
//   const index = dishes.findIndex((dish) => dish.id === dishId);
//   if (index > -1) {
//     dishes.splice(index, 1);
//     res.sendStatus(204);
//   } else {
//     res.status(404).json({ error: `Dish id not found: ${dishId}` });
//   }
// }

module.exports = {
  list,
  create: [create],
  read: [dishExists, read],
  update: [dishExists, update],
  //delete: [dishExists, deleteDish]
};