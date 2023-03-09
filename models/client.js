const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    nume: {
        type: String,
        required: true
    },
    adresa: {
        type: String,
    },
    cif: {
        type: String,
        required: true
    },
    rc: {
        type: String,
        required: true
    },
    telefon: {
        type: String,
    },
    email: {
        type: String
    },
    locatie: {
        type: Schema.Types.ObjectId,
        ref: 'Locatie'
    },
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
})

module.exports = mongoose.model('Client', clientSchema)