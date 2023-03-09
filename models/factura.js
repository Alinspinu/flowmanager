const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require('./counter')

const facturaSchema = new Schema({
    nr: {
        type: Number,
        index: true
    },
    serie: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    locatie: {
        type: Schema.Types.ObjectId,
        ref: 'Locatie'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    produse:
        [
            {
                type: Schema.Types.ObjectId,
                ref: 'Produs'
            }
        ]

})


facturaSchema.pre("save", function (next) {
    const doc = this;
    Counter.findOneAndUpdate(
        { model: "Factura", locatie: doc.locatie },
        { $inc: { value: 1 } },
        { upsert: true, new: true },
        function (error, counter) {
            if (error) {
                return next(error);
            }
            doc.nr = counter.value;
            next();
        }
    );
});

module.exports = mongoose.model('Factura', facturaSchema)