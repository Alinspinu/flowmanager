const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sumaSchema = new Schema({
    locatie: {
        type: Schema.Types.ObjectId,
        ref: 'Locatie'
    },
    sum: {
        type: Number,
        default: 0
    },

});

module.exports = mongoose.model("Suma", sumaSchema);