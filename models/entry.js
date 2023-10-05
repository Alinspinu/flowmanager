const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('../models/counter')


const entrySchema = new Schema({
    locatie: {
        type: Schema.Types.ObjectId,
        ref: 'Locatie'
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    tip: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    index: {
        type: Number,
        index: true
    }
})

entrySchema.pre("save", async function (next) {
    try {
        const doc = this;
        const counter = await Counter.findOneAndUpdate(
            { model: "Entry", locatie: doc.locatie },
            { $inc: { value: 1 } },
            { upsert: true, new: true }
        ).exec();

        doc.index = counter.value;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Entry', entrySchema)