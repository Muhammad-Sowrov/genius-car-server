const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());


// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xz3kocr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db('carDB').collection('services');
    const checkOutCollection = client.db('carDB').collection('checkout');


    app.get('/services', async(req, res)=> {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            projection: { title: 1, price: 1, service_id: 1, img: 1 },
          };
        const result = await serviceCollection.findOne(query, options);
        res.send(result)
    })

    // checkout
    app.get('/checkout', async(req, res)=>{
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = {email: req.query.email}
      }
      // console.log(query);
      const result = await checkOutCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/checkout', async(req, res)=> {
      const checkout = req.body;
      // console.log(checkout);
      const result = await checkOutCollection.insertOne(checkout);
      res.send(result)
    });

    // delete
    app.delete('/checkout/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await checkOutCollection.deleteOne(query);
      res.send(result);
    })

    // Update
    app.patch('/checkout/:id', async(req, res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const update = req.body;
      console.log(update);

      const updateDoc = {
        $set: {
          status: update.status
        },
      };
      const result = await checkOutCollection.updateOne(filter, updateDoc);
      res.send(result)
  
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res)=>{
    res.send('Server is Running')
})
app.listen(port, ()=> {
    console.log(`Server in running on: ${port}`);
})

