var mongoose = require("mongoose");
var Faq = new mongoose.Schema({
    question        : { type: String, index: true},
    answer          : { type: String, index: true},
    added_by        : { type: String, index: true},
    status          : { type: Boolean, index: true},
    created_at      : { type: Date, default: Date.now, index: true},
    updated_at      : { type: Date, default: Date.now },  
});
module.exports = mongoose.model("faqs",Faq);