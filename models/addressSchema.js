const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User collection
        required: true,
    },
    address: [
        {
            addressType: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            landMark: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: Number,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            altPhone: {
                type: String,
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model("Address", addressSchema);
