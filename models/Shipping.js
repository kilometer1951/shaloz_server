const mongoose = require("mongoose");

const { Schema } = mongoose;

let shippingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "users" },
    country:{ type: String, default: "" },
    full_name:{ type: String, default: "" },
    street_address:{ type: String, default: "" },
    zipe_code:{ type: String, default: "" },
    city:{ type: String, default: "" },
    state:{ type: String, default: "" }, 
});

mongoose.model("shippings", shippingSchema);
