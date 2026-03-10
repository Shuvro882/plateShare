const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json())




const uri = "mongodb+srv://plate-share:QQRnlL6irEwPcb8U@db-first-server.9dfabil.mongodb.net/?appName=Db-first-server";

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
    await client.connect();
    
    const db = client.db('food_db')
    const foodCollection = db.collection('food')
    const foodRequestCollection = db.collection('foodRequests')
    //find
    //findOne

    app.get('/food', async(req,res) => {
      
      const result = await
      foodCollection.find().toArray();
     

      res.send(result)
    })


    app.get('/food/:id', async(req,res) => {
       const {id} = req.params
       console.log(id)

       const result = await foodCollection.findOne({_id: new ObjectId(id)})
       res.send({
          success: true,
          result
       })
    })

    //post method
    // insertOne
    //insertMany

    app.post('/food', async(req,res) => {
       const data = req.body
      //  console.log(data)
       const result = await foodCollection.insertOne(data)
       res.send({
        success: true,
        result

       })
    })
   
    
app.get("/my-foods", async (req, res) => {

 const email = req.query.email;

 if(!email){
   return res.send([]);
 }

 const query = { "donator.email": email };

 const result = await foodCollection.find(query).toArray();

 res.send(result);

});

 //put
 //updateOne
 //updateMany

 app.put("/food/:id", async (req, res)  => {

 const id = req.params.id;

 const updatedFood = req.body;

 const query = { _id: new ObjectId(id) };

 const updateDoc = {
  $set: updatedFood
 };

 const result = await foodCollection.updateOne(query, updateDoc);

 res.send(result);

});


app.delete("/food/:id", async (req, res) => {

 const id = req.params.id;

 const query = { _id: new ObjectId(id) };

 const result = await foodCollection.deleteOne(query);

 res.send(result);

});
      
// --------- Food Requests Routes ---------
    // Submit a food request
    app.post('/foodRequests', async (req, res) => {
      const requestData = req.body;
      try {
        const result = await foodRequestCollection.insertOne(requestData);
        res.send({ success: true, result });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Get all requests for a food (owner view)
    app.get('/foodRequests/:foodId', async (req, res) => {
      const { foodId } = req.params;
      try {
        const requests = await foodRequestCollection.find({ foodId }).toArray();
        res.send({ success: true, requests });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Accept or Reject a request
    app.patch('/foodRequests/:requestId', async (req, res) => {
      const { requestId } = req.params;
      const { status } = req.body; 

      try {
        
        const result = await foodRequestCollection.updateOne(
          { _id: new ObjectId(requestId) },
          { $set: { status } }
        );

        
        if (status === "accepted") {
          const request = await foodRequestCollection.findOne({ _id: new ObjectId(requestId) });
          await foodCollection.updateOne(
            { _id: new ObjectId(request.foodId) },
            { $set: { status: "donated" } }
          );
        }

        res.send({ success: true, result });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

     // Get all requests made by a user
app.get("/my-food-requests", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.send([]);

  try {
    const requests = await foodRequestCollection
      .find({ userEmail: email })
      .toArray();

    // Include some food info if needed
    const result = await Promise.all(
      requests.map(async (r) => {
        const food = await foodCollection.findOne({ _id: new ObjectId(r.foodId) });
        return {
          ...r,
          foodName: food?.food_name,
          foodQuantity: food?.food_quantity,
          foodLocation: food?.pickup_location,
        };
      })
    );

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

    // Get requests received for user's donated foods
    app.get('/my-donated-requests', async (req, res) => {
      const email = req.query.email;
      if (!email) return res.send([]);
      // First get all foods donated by user
      const donatedFoods = await foodCollection.find({ "donator.email": email }).toArray();
      const donatedFoodIds = donatedFoods.map(f => f._id.toString());
      // Then get requests for those foods
      const requests = await foodRequestCollection.find({ foodId: { $in: donatedFoodIds } }).toArray();
      res.send(requests);
    });

  


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/',(req, res) =>{
    res.send('Plate share server is running')
})

app.listen(port, () => {
    console.log(`Smart server is running on port:${port}`)
})