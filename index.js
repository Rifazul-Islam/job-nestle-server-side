const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000 ;

// middle wore

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwemj7d.mongodb.net/?retryWrites=true&w=majority`;

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
    const categoryCollection = client.db("jobNestleDB").collection("category");
    const jobsCollection = client.db("jobNestleDB").collection("jobs");

    // get the Category Jobs
    app.get("/api/v1/category",async(req,res)=>{
      const result = await categoryCollection.find().toArray();
      res.send(result)
    })

   // get deffince Items

   app.get("/api/v1/jobs",async(req,res)=>{
    const category = req?.query?.category;
    console.log(category);

   const result = await jobsCollection.find().toArray();
   res.send(result)
   })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res)=>{
    res.send("Job Nestle running ")
})
app.listen(port,()=>{
  console.log(`Job Nestle sever ${port}`);
})