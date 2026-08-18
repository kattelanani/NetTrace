const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({

    ipAddress: {
        type: String
    },

    userAgent: {
        type: String
    },

    method: {
        type: String
    },

    protocol: {
        type: String
    },

    host: {
        type: String
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Visitor", visitorSchema);