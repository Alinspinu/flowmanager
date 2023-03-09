const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const gestiuneSchema = new Schema({
    nume:
    {
        type: String,
        required: true
    },
    locatie:
    {
        type: Schema.Types.ObjectId,
        ref: 'Locatie',
        required: true
    },
    ingrediente:
        [
            {
                type: Schema.Types.ObjectId,
                ref: 'Ingredient'
            }
        ]



})



module.exports = mongoose.model('Gestiune', gestiuneSchema);