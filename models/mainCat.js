const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mainCatSchema = new Schema({
  nume: {
    type: String,
    required: true,
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  imagine: {
    path: String,
    filename: String
  },
  categorie: [
    {
      type: Schema.Types.ObjectId,
      ref: "Categorie",
    },
  ],
});

module.exports = mongoose.model("MainCat", mainCatSchema);
