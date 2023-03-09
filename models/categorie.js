const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorieSchema = new Schema({
  nume: {
    type: String,
    required: true,
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  mainCat: {
    type: Schema.Types.ObjectId,
    ref: "MainCat",
  },
  produs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Produs",
    },
  ],
});

module.exports = mongoose.model("Categorie", categorieSchema);
