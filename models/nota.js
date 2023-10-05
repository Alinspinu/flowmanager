const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("./counter");
const Locatie = require("./locatie");

const notaSchema = new Schema({
  produse: [
    {
      produs:
      {
        type: Schema.Types.ObjectId,
        ref: 'Produs'
      },
      cantitate: Number
    }
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
  unregistred: {
    type: Boolean,
    default: false
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

notaSchema.pre("save", async function (next) {
  try {
    const doc = this;
    const counter = await Counter.findOneAndUpdate(
      { model: "Nota", locatie: doc.locatie },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    ).exec();

    doc.index = counter.value;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Nota", notaSchema);
