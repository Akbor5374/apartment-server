const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId
const MongoClient = require('mongodb').MongoClient;
const fs  = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('images'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqlyi.mongodb.net/Apartment-hunt?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

const bookingCollection = client.db("Apartment-hunt").collection("bookingCollection");
const houseCollection = client.db("Apartment-hunt").collection("houseCollection");
const adminCollection = client.db("Apartment-hunt").collection("adminCollection");

  //add booking request
  app.post('/addBooking', (req, res) => {
      const newBooking = req.body;
      bookingCollection.insertOne(newBooking)
      .then(result => {
          result.insertedCount > 0 &&
          res.send(true);
      })
  });

  //add admin user
  app.post('/addAdmin', (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin)
    .then(result => {
        result.insertedCount > 0 &&
        res.send(true);
    })
   });

   //get all house from database
   app.get('/getAllHouse', (req, res) => {
    houseCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
   });

   //get single house from database
   app.get('/house/:id', (req, res) => {
    const id = req.params.id;
    houseCollection.find({_id: ObjectId(id)})
    .toArray( (err, documents) => {
        res.send(documents[0]);
    })
   });

   app.get('/getAllBooking', (req, res) => {
    bookingCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
   });

   app.get('/getAllRent', (req, res) => {
    houseCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
   });

   app.post('/addHouse', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const location = req.body.location;
    const price = req.body.price;
    const bedroom = req.body.bedroom;
    const bathroom = req.body.bathroom;
    const description = req.body.description;
    const filePath = `${__dirname}/images/${file.name}`;

    file.mv(filePath, err => {
        if (err) {
            res.status(500).send({ msg: "Failed to uploaded image" });
        }
        const newImg = fs.readFileSync(filePath);
        const encodeImg = newImg.toString('base64');
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encodeImg, 'base64')
        };

        houseCollection.insertOne({ name, location, price, bedroom, bathroom, img:image })
        .then(result => {
            fs.remove(filePath, err => {
                if(err){
                 console.log(err);
                 res.status(500).send({ msg: "Failed to uploaded image" });
                }
                res.send(result.insertedCount > 0)
            });
        });
    });

});

});

app.get('/', (req, res) => {
    res.send("hello apartment-hunt");
});
app.listen(process.env.PORT ||5000)