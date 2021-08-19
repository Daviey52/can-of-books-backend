'use strict';
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  description: { type: String },
  status: { type: String, required: true },
  email: { type: String }

});

const BookModel = mongoose.model('books', bookSchema);

module.exports = BookModel
