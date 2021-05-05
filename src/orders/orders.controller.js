const { stat } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next){
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next()
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`,
  });
}

function orderIdAbsentOrMatches(req, res, next) {
  const {data: { id } } = req.body;

  const {orderId} = req.params;

  if (!id || orderId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

function bodyHasStatus(req, res, next){
    const {data: {status} = {} } = req.body;
    if(status && status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered"){
        res.locals.status = status;
        return next();
    }
    next({
        status: 400,
        message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
    })
}

function statusIsPending(req, res, next){
    const {order} = res.locals;
    if(order.status === "pending"){
        next();
    }
    next({
        status: 400,
        message: "An order cannot be deleted unless it is pending"
    })
}

function dishHasQuantity(req, res, next){
    const dishes = res.locals.dishes;
    dishes.forEach((dish, index) => {
        if(!dish.quantity || !(dish.quantity > 0) || !Number.isInteger(dish.quantity)){
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            });
        }
    })
    return next();
}



function bodyHasDeliver(req, res, next){
    const {data: {deliverTo} = {} } = req.body;
    if(deliverTo){
        return next();
    }
    next({
        status: 400,
        message: "Order must include a deliverTo"
    })
}

function bodyHasPhone(req, res, next){
    const {data: {mobileNumber} = {} } = req.body;
    if(mobileNumber){
        return next();
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber"
    })
}

function bodyHasDishes(req, res, next){
    const {data: {dishes} = {} } = req.body;
    if(dishes && dishes.length > 0 && Array.isArray(dishes)){
        res.locals.dishes = dishes;
        return next();
    }
    next({
        status: 400,
        message: "Order must include a dish"
    })
}



function list(req, res, next){
    res.json({data: orders});
}

function read(req, res, next){
    const {orderId} = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if(foundOrder){
        res.json({data: foundOrder })
    } 
    next({
        status: 404,
        message: `Order id not found: ${orderId}`
    })
}

function create(req, res, next){
    const { data: {deliverTo, mobileNumber, status, dishes: {name, description, image_url, price, quantity} } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        id: nextId(),
        name,
        description,
        image_url,
        price,
        quantity
    }
    orders.push(newOrder);
    res.status(201).json({data: newOrder})
}


function update(req, res, next){
    const order = res.locals.order;
    const { data: {deliverTo, mobileNumber, status, dishes: { name, description, image_url, price, quantity} } = {} } = req.body;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes.name = name;
    order.dishes.description = description;
    order.dishes.image_url = image_url;
    order.dishes.price = price;
    order.dishes.quantity = quantity;
    res.json({data: order});
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const orderToDelete = orders.find((order) => order.id === orderId);
  if(orderToDelete > -1){
     orders.splice(orderToDelete, 1);
  }
    return res.sendStatus(204);
}



module.exports = {
    list, 
    read,
    delete: [orderExists, statusIsPending, destroy],
    create: [bodyHasDeliver, bodyHasPhone, bodyHasDishes, dishHasQuantity, create],
    update: [orderExists, orderIdAbsentOrMatches, bodyHasDeliver, bodyHasPhone, bodyHasStatus, bodyHasDishes, dishHasQuantity, update]
}