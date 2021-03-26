const express = require('express')
const bodyParser = require('body-parser')
const cors= require('cors')
const admin = require("firebase-admin");
const port = 5000;
const password = 'HyDhd9!ncWBn_Ta';

const serviceAccount = require("./burj-al-arab-after-auth-2304e-firebase-adminsdk-uhno0-19a49cff74.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https:burj-al-arab-after-auth.firebaseio.com'
});

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://hotelbooking:HyDhd9!ncWBn_Ta@cluster0.taqt5.mongodb.net/burjhAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Hello World!')
})


client.connect(err => {
  const BookingCollection = client.db("burjhAlArab").collection("Bookings");
  app.post('/addBooked', (req, res) => {
      const newBooking=req.body
      BookingCollection.insertOne(newBooking)
       .then(res=>res.json())
       .then(result =>{
           res.send(result.insertedCount > 0);
       })
  })
  app.get('/booking', (req, res)=>{
  const bearer=req.headers.authorization;
  if(bearer && bearer.startsWith('Bearer ')){
    const idToken=bearer.split(' ')[1];
    admin.auth().verifyIdToken(idToken)
   .then((decodedToken) => {
    const tokenEmail = decodedToken.email;
    const userEmail=req.query.email
    if(tokenEmail && req.query.email){
      BookingCollection.find({email:req.query.email})
    .toArray((err,documents) =>{
      res.send(documents)
    })
    }
     
  })
  .catch((error) => {
    res.status(401).send('unauthorized access')
  });
  }
  else{
    res.status(401).send('unauthorized access')
  }
   
  })
})

app.listen(port)
 