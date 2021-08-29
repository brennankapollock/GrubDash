require('dotenv').config();


const PORT = process.env.API_PATH

const app = require("./app")

const listener = () => console.log(`Listening on Port ${PORT}!`);
app.listen(PORT, listener);
