const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("./counter");
const Locatie = require("./locatie");

const notaSchema = new Schema({
  produse: [
    {
      nume: {
        type: String,
        required: true,
      },
      pret: {
        type: Number,
        required: true,
      },
      cantitate: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    nume: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  index: {
    type: Number,
    index: true,
  },
  data: {
    type: Date,
    default: Date.now(),
  },
  cash: {
    type: Number,
    default: 0,
  },
  card: {
    type: Number,
    default: 0,
  },
  reducere: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
});

notaSchema.pre("save", function (next) {
  const doc = this;
  Counter.findOneAndUpdate(
    { model: "Nota", locatie: doc.locatie },
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

module.exports = mongoose.model("Nota", notaSchema);
