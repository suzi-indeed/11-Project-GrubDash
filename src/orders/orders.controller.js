const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
//add handlers and middleware functions to create, read, update, delete, and list orders.
function list(req, res) {
  res.json({ data: orders });
}
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  //returns 400 if dishes is not an array
  if (!Array.isArray(dishes)) {
    return res.status(400).json({ error: "dishes is not an array" });
  }

  //returns 400 if a dish is missing quantity or it is not an integer
  if (dishes.length > 0) {
    //check the quantities for each dish
    for (const dish of dishes) {
      if (!dish.quantity ||!Number.isInteger(dish.quantity)) {
        return res.status(400).json({ error: "quantity is missing for dish " + dish.name + " position in list: " + dishes.indexOf(dish) });
      }
    }
  }

  //returns 400 if mobileNumber is missing
  if (!mobileNumber) {
    return res.status(400).json({ error: "mobileNumber is missing" });
  }

  //returns 400 if dishes is missing or empty
  if (!dishes || dishes.length == 0) {
    return res.status(400).json({ error: "dishes is missing or empty" });
  }

  //returns 400 if deliverTo is missing
  if (deliverTo) {
    const newOrder = {
      id: nextId(),
      deliverTo,
      mobileNumber,
      status,
      dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }
  else {
    res.status(400).json({ error: "deliverTo is missing" });
  }

}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  //returns 400 if status is empty or invalid
  if (!req.body.data.status || !["pending", "delivered"].includes(req.body.data.status)) {
    return res.status(400).json({ error: "status is missing or invalid" });
  }

  //updates the order if data.id is missing,empty,null or undefined 
  //even though it does not match :orderId in the route
  //if dataid is not missing,empty,null or undefined and does not match :orderId in the route:
  if (!(!req.body.data.id || req.body.data.id === "")) {
    //returns 400 if data.id does not match :orderId in the route
    if (req.body.data.id !== res.locals.order.id) {
      return res.status(400).json({ error: "data.id " + req.body.data.id + "does not match :orderId " + res.locals.order.id + " in the route" });
    }
  }

  const { data: { dishes } = {} } = req.body;

  //returns 400 if dishes is empty
  if (!dishes||dishes.length===0) {
    return res.status(400).json({ error: "dishes is missing" });
  }

  //returns 400 if a dish quantity is not an integer or zero
  if (dishes) {
    for (const dish of dishes) {
      if (!dish.quantity || dish.quantity < 1 || !Number.isInteger(dish.quantity)) {
        return res.status(400).json({ error: "dish quantity is not an integer/0/less then 1. got: "+dish.quantity+" for dish: "+dish.name+" at index: "+dishes.indexOf(dish) });
      }
    }
  }

  const { data: { deliverTo, mobileNumber, status } = {} } = req.body;
  const updatedOrder = {
    id: res.locals.order.id,
    deliverTo: deliverTo || res.locals.order.deliverTo,
    mobileNumber: mobileNumber || res.locals.order.mobileNumber,
    status: status || res.locals.order.status,
    dishes: dishes || res.locals.order.dishes,
  };
  res.locals.order = updatedOrder;
  return res.status(200).json({ data: updatedOrder });

}

function destroy(req, res) {
  //returns 400 if order.status !== 'pending'
  if (res.locals.order.status !== "pending") {
    return res.status(400).json({ error: "order.status must be 'pending'" });
  }

  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function hasOnlyValidProperties(req, res, next) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const validProperties = ["id", "deliverTo", "mobileNumber", "status", "dishes"];
  //returns 400 if a dish quantity is zero or not an integer
  const hasInvalidProperty = Object.keys(req.body.data).some(
    (property) => !validProperties.includes(property)
  );
  if (hasInvalidProperty) {
    return next({
      status: 400,
      message: `Invalid field(s): ${Object.keys(req.body.data)
        .filter((property) => !validProperties.includes(property))
        .join(", ")}`,
    });
  }
  next();
}

function hasRequiredProperties(req, res, next) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (!deliverTo || !mobileNumber || !status || !dishes) {
    return next({
      status: 400,
      message: "Missing required fields. received: id: " + id + " deliverTo: " + deliverTo + " mobileNumber: " + mobileNumber + " status: " + status + " dishes: " + dishes,
    });
  }
  next();
}

module.exports = {
  list,
  create: [create],
  read: [orderExists, read],
  update: [orderExists, hasOnlyValidProperties, hasRequiredProperties, update],
  delete: [orderExists, destroy]
}
