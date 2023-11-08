const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000 ;

// Some middle ware used
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials : true 
}));
app.use(express.json());
app.use(cookieParser())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwemj7d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// middle Ware token verify  Function

 const verifyToken = async(req,res,next)=>{
  const token = req?.cookies?.token;
  if(!token){
    return res.status(401).send({message: "unauthorized Access"})
  }
  jwt.verify(token , process.env.ACCESS_SECRET_TOKEN , (err,decoded)=>{
    if(err){
      return res.status(401).send({message: "unauthorized Access"})
    }

     req.user = decoded ;
   next()
  })
 }







async function run() {
  try {

   // MongoDB All Collection 
    const categoryCollection = client.db("jobNestleDB").collection("category");
    const jobsCollection = client.db("jobNestleDB").collection("jobs");
    const appliedCollection = client.db("jobNestleDB").collection("applies")
    const companyLogoCollection = client.db("jobNestleDB").collection("companyLogo")


  // jwt token Make post api 
  app.post("/api/v1/jwt",async(req,res)=>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '7h' });
    res.cookie("token",token,{
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    }).send({success: true})
  })


 // jwt token post api and User if null then signOut 
  app.post("/api/v1/singOut",async(req,res)=>{
   const user = req.body;
   res.clearCookie("token",{maxAge: 0}).send(user)
    
  })




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
    
   app.get("/api/v1/jobs-title",  async(req,res)=>{
    
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



    // get difference Name Filter 
    
    app.get("/api/v1/jobs-UserName",verifyToken, async(req,res)=>{
    
      let query = { };
      const name = req?.query?.name;
     if(name){
      query.name = name ;
     }
     const result = await jobsCollection.find(query).toArray();
     res.send(result)
     })



   // Specific ID Through Data Load
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



// Update the specific jobs 

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


 // get the some company logo 
 app.get("/api/v1/company-logo",async(req,res)=>{
  const cursor = companyLogoCollection.find();
  const result = await cursor.toArray();
  res.send(result)
 })

 

 // Patch Method use increment job Applied
 app.patch("/api/v1/appliedCount/:id",async(req,res)=>{
   const count = req.body;
   const defaultNum = Number(count.defaultNum)
   const id = req.params.id;
  
   const filter = {_id : new ObjectId(id)};
   const update = {
    $set: {
      defaultNum :defaultNum + 1
    }
   }
  const result = await jobsCollection.updateOne(filter,update);
  res.send(result)
 })


 // email Applied data get 
 app.get("/api/v1/applied",verifyToken, async(req,res)=>{
  if(req?.query?.email !== req?.user?.email){
    return res.status(403).send({message: "forbidden Access"})
  }
  let query = {};
  const email = req.query.email;
  if(email){
    query.email = email;
  }
  const result = await appliedCollection.find(query).toArray();
  res.send(result)
 })


// post Applied Method use 
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