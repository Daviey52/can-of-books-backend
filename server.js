'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const mongoose = require('mongoose');
const BookModel = require('./models/books');
app.use(express.json());



const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { response } = require('express');
const client = jwksClient({
  jwksUri: 'https://dev-nk1d4djb.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    console.log(key);
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const PORT = process.env.PORT || 3001;
app.get('/test', (request, response) => {
  const token = request.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function (err, user) {

    console.log(user);
    if (err) {
      response.status(500).send('invalid token');
    }
    response.status(200).send(user);
  });
})

//

app.get('/books', async (request, response) => {
  try {
    let booksdb = await BookModel.find({});
    // let booksArray = booksdb.data.data.map(() => {

    // })
    response.status(200).send(booksdb);
  }
  catch (err) {
    response.status(500).send('database error')
  }
})

mongoose.connect('mongodb://127.0.0.1:27017/books', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('Connected to DB');

    let books = await BookModel.find({});
    if (books.length < 3) {
      await addNewbook({
        title: 'Half of a Yellow Sun',
        author: 'Chimamanda Ngozi Adichie',
        description: 'A haunting story of love and war',
        status: 'Available',
        email: 'notavailable@gmail.com'
      });
      await addNewbook({
        title: 'Purple Hibiscus',
        author: 'Chimamanda Ngozi Adiche',
        description: 'blurred lines between childhood and adulthood, between love and hate,between the old gods and the new',
        status: 'Available',
        email: 'notavailable@yahoo.com'
      })
    }
  })

app.listen(PORT, () => console.log(`listening on ${PORT}`));


async function addNewbook(obj) {
  let newBook = new BookModel(obj);
  return await newBook.save();
};
addNewbook({
  title: 'Americanah',
  author: 'Chimamanda Ngozi Adiche',
  status: 'Available',
  description: 'An Immigration story',
  email: 'notavailable@outlook.com'
})

async function clear() {
  try {
    await BookModel.deleteMany({})
    console.log('db deleted');
  }
  catch (err) {
    console.log('did not delete db')
  }
}
// clear();

app.post('/books', (req, res) => {
  try {

    let { title, author, status, description, email } = req.body;
    let newBook = new BookModel({ title, author, status, description, email });
    newBook.save();
    res.send(newBook);
  } catch (err) {
    console.log('post failed')
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    let myId = req.params.id;
    await BookModel.findByIdAndDelete(myId);
    res.send(`sucessfully deleted`);
  } catch (err) {
    console.log('book deleted')
  }

});
app.put('/books/:id', async (req, res) => {
  try {
    let myId = req.params.id;
    let { title, author, status, description, email } = req.body;
    const updateBook = await BookModel.findByIdAndUpdate(myId, { title, author, status, description, email }, { new: true, overwrite: true });

    res.status(200).send(updateBook);
  } catch (error) {
    res.status(500).send('unable to update the databse')
  }
})
