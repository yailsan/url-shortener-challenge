const mongo = require('../../server/mongodb');
const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Url'
    },
    userAgent: String,
    ip: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongo.model('Visit', VisitSchema);