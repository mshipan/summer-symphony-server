const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

//mongodb_start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1oh7p7d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const popuplarClassesCollection = client
      .db("summerDB")
      .collection("popuplarClasses");
    const popuplarInstructorsCollection = client
      .db("summerDB")
      .collection("popularInstructors");
    const selectClassCollection = client
      .db("summerDB")
      .collection("selectClass");

    // Classes Apis
    app.get("/classes", async (req, res) => {
      const result = await popuplarClassesCollection
        .find()
        .sort({ Students: -1 })
        .toArray();
      res.send(result);
    });
    // Instructors Apis
    app.get("/instructors", async (req, res) => {
      const result = await popuplarInstructorsCollection
        .find()
        .sort({ Students: -1 })
        .toArray();
      res.send(result);
    });

    // selectClass apis
    app.get("/selectClass", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await selectClassCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/selectClass", async (req, res) => {
      const item = req.body;
      const result = await selectClassCollection.insertOne(item);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//mongodb_end

// basic setup
app.get("/", (req, res) => {
  res.send("Summer Symphony Server is Running");
});

app.listen(port, () => {
  console.log(`Summer Symphony Server is Running on Port: ${port}`);
});
