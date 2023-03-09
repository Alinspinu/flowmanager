const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("./counter");

const bonSchema = new Schema({
  data: {
    type: Date,
    required: true,
  },
  gestSend: {
    type: Schema.Types.ObjectId,
    ref: "Gestiune",
  },
  gestRecive: {
    type: Schema.Types.ObjectId,
    ref: "Gestiune",
  },
  locatie: {
    type: Schema.Types.ObjectId,
    ref: "Locatie",
  },
  valoare: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    index: true,
  },
  ingredient: [
    {
      nume: {
        type: String,
        required: true,
      },
      um: {
        type: String,
        required: true,
      },
      pret: {
        type: String,
        required: true,
      },
      cantitate: {
        type: Number,
        required: true,
      },
    },
  ],
});

bonSchema.pre("save", function (next) {
  const doc = this;
  Counter.findOneAndUpdate(
    { model: "Bon", locatie: doc.locatie },
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

module.exports = mongoose.model("Bon", bonSchema);
