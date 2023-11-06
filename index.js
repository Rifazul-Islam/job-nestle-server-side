const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000 ;

// middle wore

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const appliedCollection = client.db("jobNestleDB").collection("applies")

    // get the Category Jobs
    app.get("/api/v1/category",async(req,res)=>{
      const result = await categoryCollection.find().toArray();
      res.send(result)
    })

   // get difference Items

   app.get("/api/v1/jobs",async(req,res)=>{

    let categoryItems = {} ;
    const category = req?.query?.category;
    if(category){
       categoryItems.category = category
    }
   const result = await jobsCollection.find(categoryItems).toArray();
   
   res.send(result)
   })


    // get difference Title Filter 
    
   app.get("/api/v1/jobs-title",async(req,res)=>{
    let query = { };
    const title = req?.query?.title;
    const name = req?.query?.name;
   if(title){
    query.title = title ;
   }
   if(name){
    query.name = name ;
   }
   const result = await jobsCollection.find(query).toArray();
   res.send(result)
   })


   // Specific ID dara Data Load
   app.get("/api/v1/jobs/:id", async(req,res)=>{
       const id = req.params.id;
       const query = {_id : new ObjectId(id)};
       const result = await jobsCollection.findOne(query);
       res.send(result)
   })

   // post method in jobs collection
  app.post("/api/v1/insert-jobs", async(req,res)=>{
    const job = req.body;
    const result  = await jobsCollection.insertOne(job);
    res.send(result)
  })


 app.put("/api/v1/update-job/:id",async(req,res)=>{
  const id = req.params.id;
  const updateJob = req.body;
  const filter = {_id : new ObjectId(id)}
  const options = { upsert: true };
  const update = {
    $set :{
      name: updateJob?.name,
      photo: updateJob?.photo,
      category: updateJob?.category,
      title: updateJob?.title,
      salary: updateJob?.salary,
      description: updateJob?.description,
      postDate: updateJob?.postDate,
      deadline: updateJob?.deadline,
      defaultNum: updateJob?.defaultNum
    }
  }

  const result = await jobsCollection.updateMany(filter,update,options)
 res.send(result)

 })


 // patch Method use 

 app.post("/api/v1/job-applies",async(req,res)=>{
  const jobApply = req.body;
  const result = await appliedCollection.insertOne(jobApply);
  res.send(result)
 })




 // delete Method used 

app.delete("/api/v1/jobs-title/:id",async(req,res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)};
  const result = await jobsCollection.deleteOne(query);
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