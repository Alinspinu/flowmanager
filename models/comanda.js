const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("../models/counter");

const comandaSchema = new Schema({
  produse: [
    {
      nume: {
        type: String,
        required: true,
      },
      cantitate: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    default: "open",
  },
  nrMasa: {
    type: Number,
  },
  creataLa: {
    type: Date,
    default: Date.now(),
  },
  index: {
    type: Number,
    index: true,
  },
  userId: String,
  mainCat: {
    type: Schema.Types.ObjectId,
    ref: "MainCat",
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
});

comandaSchema.pre("save", function (next) {
  const doc = this;
  Counter.findOneAndUpdate(
    { model: "Comanda", locatie: doc.locatie },
    { $inc: { value: 1 } },
    { upsert: true, new: true },
    function (error, counter) {
      if (error) {
        return next(error);
      }
      doc.index = counter.value;
      next();
    }
  );
});

module.exports = mongoose.model("Comanda", comandaSchema);
