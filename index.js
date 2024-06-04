const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggulbwq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //------------------------------------------------------------
    const postsCollection = client.db("TalkRouteDb").collection("posts");

    // Get all posts
    app.get("/posts", async (req, res) => {
      const result = await postsCollection
        .find()
        .sort({ postTime: -1 })
        .toArray();
      res.send(result);
    });

    // Search posts by tag
    app.get("/posts/search", async (req, res) => {
      const query = req.query.query;
      const result = await postsCollection
        .find({ tags: { $regex: query, $options: "i" } })
        .sort({ postTime: -1 })
        .toArray();
      res.send(result);
    });

    // Get a post by ID
    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format");
      }
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.findOne(query);
      if (!result) {
        return res.status(404).send("Post not found");
      }
      res.send(result);
    });

    // post a post

    app.post("/posts", async (req, res) => {
      const PostCol = req.body;
      const result = await postsCollection.insertOne(PostCol);
      res.send(result);
    });

    //------------------------------------------------------------
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TalkRoute server is running...");
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
