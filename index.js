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