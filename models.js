const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    "email": {
        "type": "String"
      },
      "lists": {
        "type": [
          "Array"
        ]
      },
      "counts": {
        "type": [
          "Number"
        ]
      }
});

const PokedexSchema = new mongoose.Schema({
      "gen":{
        "type": "String"
      },
      "pokemon":{
        "type": [
          "Mixed"
        ]
      }
});

const User = mongoose.model("users",UserSchema);
const Pokedex = mongoose.model("pokedex",PokedexSchema);

module.exports = { 
  userModel: User,
  pokedexModel: Pokedex
}