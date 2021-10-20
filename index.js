require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require("mongoose");
const {userModel} = require("./models");
const {pokedexModel} = require("./models");
const PORT = process.env.PORT || 3001;

mongoose.connect(
  process.env.MONGO
).catch(()=>console.log("Oh no"));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

// Returns a list of 5 random elements from given list
function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Checks if a user exists in the DB
app.get("/mongo", async (req,res)=>{
  const users = await userModel.find({"email":"felixluciano.a@gmail.com"});
  try {
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Returns 5 random pokemon
app.get("/getPoke", async (req,res)=>{
  const pokedex = await pokedexModel.find({"gen":"sinnoh"})
  var m = []
  for (let i = 0;i<5;i++){
    m.push(sample(pokedex[0]["pokemon"]));
  }
  res.send(m);
});

// Handles any not specified get request
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
});