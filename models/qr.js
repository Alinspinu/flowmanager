const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const qrSchema = new Schema ({
    total:
    {
        type: Number,
        required: true
    },
    nota:
    {
        type: Schema.Types.ObjectId,
        ref: 'nota'
    }
})


module.exports = mongoose.model('Qr', qrSchema)
