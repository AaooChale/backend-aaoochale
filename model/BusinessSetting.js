var mongoose = require('mongoose');
var BusinessSetting = new mongoose.Schema({
    type            : { type: String, index: true },
    value           : { type: Array, index: true},
    added_by        : { type: String, index: true},
    created_at      : { type: Date, default: Date.now, index: true},
    updated_at      : { type: Date, default: Date.now },  
});
module.exports = mongoose.model('business_settings', BusinessSetting);