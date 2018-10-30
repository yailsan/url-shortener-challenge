const mongo = require('../../server/mongodb');
const mongoose = require('mongoose');

const URLSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },

  user: mongoose.Schema.Types.ObjectId,

  hash: {
    type: String,
    required: true,
    unique: true
  },
  isCustom: {
    type: Boolean,
    required: true
  },

  removeToken: {
    type: String,
    required: true
  },

  protocol: String,
  domain: String,
  path: String,

  createdAt: {
    type: Date,
    default: Date.now
  },
  removedAt: Date,

  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

// hide fields from public
URLSchema.set('toJSON', {
  transform: function (doc, ret) {
    return {
      _id: ret._id,
      url: ret.url,
      hash: ret.hash,
      removeToken: ret.removeToken
    };
  }
})

module.exports = mongo.model('Url', URLSchema);
