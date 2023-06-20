var mongoose = require("mongoose");
var Blog = new mongoose.Schema({
    title           : { type: String, index: true},
    thumbnail       : { type: String, index: true},
    description     : { type: String, index: true},
    shortDescription: { type: String, index: true},
    added_by        : { type: String, index: true},
    status          : { type: Boolean, index: true},
    created_at      : { type: Date, default: Date.now, index: true},
    updated_at      : { type: Date, default: Date.now },  
});
module.exports = mongoose.model("blogs",Blog);