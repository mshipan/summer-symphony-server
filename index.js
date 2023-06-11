const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .send(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

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

    const usersCollection = client.db("summerDB").collection("users");
    const popuplarClassesCollection = client
      .db("summerDB")
      .collection("popuplarClasses");
    const popuplarInstructorsCollection = client
      .db("summerDB")
      .collection("popularInstructors");
    const selectClassCollection = client
      .db("summerDB")
      .collection("selectClass");

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // users Apis
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const alreadyUser = await usersCollection.findOne(query);
      if (alreadyUser) {
        return res.send({ message: "User Already Exist" });
      }
      user.role = "Student";
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        res.send({ role: null });
        return;
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const role = user?.role;
      const isAdmin = role === "Admin";
      const isInstructor = role === "Instructor";
      const isStudent = role === "Student";
      const result = { isAdmin, isInstructor, isStudent };
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: role,
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

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
    app.get("/selectClass", verifyJWT, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "forbidden access" });
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

    app.delete("/selectClass/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectClassCollection.deleteOne(query);
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
