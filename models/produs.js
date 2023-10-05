const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const produsSchema = new Schema({
  nume: {
    type: String,
    required: true,
  },
  pret: {
    type: Number,
    required: true,
  },
  cantitate: String,
  departament: {
    type: String,
    required: true,
  },
  pretInt: {
    type: Number,
    required: true,
  },
  cotaTva: {
    type: Number,
    default: 0
  },
  categorie: {
    type: Schema.Types.ObjectId,
    ref: "Categorie",
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  mainCat: {
    type: Schema.Types.ObjectId,
    ref: "MainCat",
  },
  imagine: {
    path: String,
    filename: String
  },

  ingrediente: [
    {
      nume: {
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
    },
  ],
});

module.exports = mongoose.model("Produs", produsSchema);
