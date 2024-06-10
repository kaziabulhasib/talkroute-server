const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    const userCollection = client.db("TalkRouteDb").collection("users");
    const postsCollection = client.db("TalkRouteDb").collection("posts");
    const commentsCollection = client.db("TalkRouteDb").collection("comments");

    // user related Api
    // get all user
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // make admin with patch

    app.patch(
      "/users/admin/:id",

      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );

    //------------------------------------------------------------user related end

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

    // delete a post

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    });

    // Get a post by user emial

    app.get("/posts/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await postsCollection
          .find({
            authorEmail: email,
          })
          .sort({ postTime: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving posts for user");
      }
    });

    // post a post

    app.post("/posts", async (req, res) => {
      const PostCol = req.body;
      PostCol.postTime = Date.now();
      PostCol.commentCount = 0;
      const result = await postsCollection.insertOne(PostCol);
      res.send(result);
    });

    //------------------------------------------------------------comments routes

    // Get all comments

    app.get("/comments", async (req, res) => {
      const result = await commentsCollection.find().toArray();
      res.send(result);
    });

    // Get comments by post ID
    app.get("/comments/post/:postId", async (req, res) => {
      const postId = req.params.postId;
      if (!ObjectId.isValid(postId)) {
        return res.status(400).send("Invalid post ID format");
      }
      const query = { postId: postId };
      const result = await commentsCollection.find(query).toArray();
      res.send(result);
    });

    //send all comment to db

    app.post("/comments", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      if (result.insertedId) {
        await postsCollection.updateOne(
          { postTitle: comment.postTitle },
          { $inc: { commentCount: 1 } }
        );
      }
      res.send(result);
    });

    // upvote update

    app.post("/posts/:id/upvote", async (req, res) => {
      const { userId } = req.body;
      const postId = req.params.id;

      if (!ObjectId.isValid(postId)) {
        return res.status(400).send("Invalid post ID format");
      }

      try {
        const post = await postsCollection.findOne({
          _id: new ObjectId(postId),
        });

        if (!post) {
          return res.status(404).send("Post not found");
        }

        if (post.upvotedUsers && post.upvotedUsers.includes(userId)) {
          return res.status(400).send("User has already upvoted this post");
        }

        const result = await postsCollection.updateOne(
          { _id: new ObjectId(postId) },
          {
            $inc: { upVote: 1 },
            $push: { upvotedUsers: userId },
          }
        );

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error upvoting post");
      }
    });
    //
    // Downvote a post
    app.post("/posts/:id/downvote", async (req, res) => {
      const postId = req.params.id;
      const userId = req.body.userId;

      if (!ObjectId.isValid(postId)) {
        return res.status(400).send("Invalid post ID format");
      }

      try {
        const post = await postsCollection.findOne({
          _id: new ObjectId(postId),
        });
        if (!post) {
          return res.status(404).send("Post not found");
        }

        if (!post.downVoters) {
          post.downVoters = [];
        }

        if (post.downVoters.includes(userId)) {
          return res.status(400).send("User has already downvoted this post");
        }

        await postsCollection.updateOne(
          { _id: new ObjectId(postId) },
          {
            $inc: { downVote: 1 },
            $push: { downVoters: userId },
          }
        );

        res.status(200).send("Downvote added successfully");
      } catch (error) {
        console.error("Error handling downvote:", error);
        res.status(500).send("Internal server error");
      }
    });

    //------------------------------------------------------------
    // payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        description: "test",
        shipping: {
          name: "Jenny Rosen",
          address: {
            line1: "510 Townsend St",
            postal_code: "98140",
            city: "San Francisco",
            state: "CA",
            country: "US",
          },
        },
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
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
