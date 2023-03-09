const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//nested
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true
  },
  email: String,

  nume: {
    type: String,
    // required: true
  },
  parola: {
    type: String,
    // required: true
  },
  functie: {
    type: String,
    // required: true
  },
  admin: {
    type: Number,
    default: 0,
  },
});
//parent
const locatieSchema = new Schema({
  nestedUsers: [userSchema],
  produse: {
    type: Schema.Types.ObjectId,
    ref: "Produs",
  },

  ingrediente: {
    type: Schema.Types.ObjectId,
    ref: "Ingredient",
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Nota",
  },
  mainCat: {
    type: Schema.Types.ObjectId,
    ref: "MainCat"
  },
  platitorTva: {
    type: Boolean,
    required: true
  },
  categorii: {
    type: Schema.Types.ObjectId,
    ref: "Categorie",
  },
  counter: {
    type: Schema.Types.ObjectId,
    ref: "Counter",
  },
  dateFirma: {
    nume: String,
    adresa: String,
    cif: String,
    rc: String,
    telefon: String,
    email: String,
    banca: [
      {
        nume: {
          type: String,
        },
        cont: {
          type: String,
        },
      },
    ],
  },
});

locatieSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Locatie", locatieSchema);
