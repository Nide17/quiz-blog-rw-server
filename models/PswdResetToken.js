const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PswdResetTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900
        // expires in 900 secs
    },
});

// module.exports = mongoose.model("Token", PswdResetToken);
//PswdResetToken: the name of this model - using the db connection
const db = require('../server').db
const PswdResetToken = db.model('pswdResetToken', PswdResetTokenSchema)

module.exports = PswdResetToken