const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
  nume: {
    type: String,
    required: true,
  },
  um: {
    type: String,
    required: true,
  },
  cantitate: {
    type: Number,
    required: true,
  },
  pret: {
    type: Number,
    required: true,
  },
  cotaTva: {
    type: Number,
    default: 0,
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  gestiune: {
    type: Schema.Types.ObjectId,
    ref: "Gestiune",
    required: true,
  },
});

module.exports = mongoose.model("Ingredient", ingredientSchema);
