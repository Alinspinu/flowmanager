const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const furnizorSchema = new Schema({
  nume: {
    type: String,
    required: true,
  },
  cif: {
    type: String,
    required: true,
  },
  cont: {
    type: String,
    required: true,
  },
  banca: {
    type: String,
    required: true,
  },
  adresa: {
    type: String,
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
    required: true,
  },
});

module.exports = mongoose.model("Furnizor", furnizorSchema);
