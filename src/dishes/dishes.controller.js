const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");



function dishExists(req, res, next){
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next()
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`,
  });
}

function dishIdAbsentOrMatches(req, res, next) {
  const {data: { id } } = req.body;

  const {dishId} = req.params;

  if (!id || dishId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}


function bodyHasName(req, res, next){
    const {data: {name} = {} } = req.body;
    if(name){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include name"
    })
}

function bodyHasPrice(req, res, next){
    const {data: {price} = {} } = req.body;
    if(Number.isInteger(price) && price > 0){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include price"
    })
}


function bodyHasImage(req, res, next){
    const {data: {image_url} = {} } = req.body;
    if(image_url){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include image_url"
    })
}

function bodyHasDescription(req, res, next){
    const {data: {description} = {} } = req.body;
    if(description){
        return next();
    }
    next({
        status: 400,
        message: "Dish must include description"
    })
}


function read(req, res, next){
    const {dishId} = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish){
        res.json({data: foundDish })
    } 
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`
    })
}


function create(req, res, next){
    const {data: {name, description, price, image_url} = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish})
}

function update(req, res, next){
    const dish = res.locals.dish;
    const {data: {name, description, price, image_url} = {} } = req.body;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({data: dish});
}




function list(req, res, next){
    res.json({data: dishes})
}







module.exports = {
    list,
    read,
    update: [dishExists, dishIdAbsentOrMatches, bodyHasName, bodyHasPrice, bodyHasDescription, bodyHasImage, update],
    create: [bodyHasName, bodyHasPrice, bodyHasImage, bodyHasDescription, create],
}
