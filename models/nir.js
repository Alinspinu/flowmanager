const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("./counter");

const nirSchema = new Schema({
  furnizor: {
    type: Schema.Types.ObjectId,
    ref: "Furnizor",
  },
  nrDoc: {
    type: String,
    required: true,
  },
  data: {
    type: Date,
    default: Date.now(),
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  index: {
    type: Number,
    index: true,
  },
  produse: [
    {
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
      categorie: {
        type: String,
        required: true,
      },
      pretUmInt: {
        type: Number,
        required: true,
      },
      valoareInt: {
        type: Number,
        default: 0
      },
      gestiune: {
        type: Schema.Types.ObjectId,
        ref: "Gestiune",
      },
      cotaTva: {
        type: Number,
        default: 0
      },
      valTva: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true,
      },
      pretVanzareUm: {
        type: Number,
        default: 0,
      },
    },
  ],
});

nirSchema.pre("save", async function (next) {
  try {
    const doc = this;
    const counter = await Counter.findOneAndUpdate(
      { model: "Nir", locatie: doc.locatie },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    doc.index = counter.value;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Nir", nirSchema);
