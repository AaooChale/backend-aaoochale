var mongoose = require('mongoose');
var Testimonial = new mongoose.Schema({
    name        : { type : String, index:true},
    image       : { type : String, index:true},
    designation : { type : String, index:true},
    review      : { type : String, index:true},
    status      : { type : Boolean, index:true},
    added_by    : { type: String, index: true},
    created_at  : { type : Date, default:Date.now, index:true},
    updated_at  : { type : Date, default:Date.now},
});
module.exports = mongoose.model('testimonials',Testimonial);