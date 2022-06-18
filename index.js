const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express()
const port = process.env.PORT || 5000
const cors = require("cors")
const dotenv = require("dotenv").config()
const jwt = require('jsonwebtoken');
app.use(cors())
app.use(express.json())
app.get("/", (req, res) => {
    res.send("server Running Well")

})
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized" })
    }
    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden" })
        }
        req.decoded = decoded;
        next()
    })
}

// tasks
// 9QUq9BDJmiVv4SwJ

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.gkjuf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        console.log("connected");
        const behaviorsCollection = client.db("behaviors").collection("behaviors")
        const toDoCollection = client.db("behaviors").collection("todo")

        app.put("/user/:email", async (req, res) => {
            const email = req.params.email
            const token = jwt.sign({ email: email }, process.env.PRIVATE_KEY, { expiresIn: "1d" })
            res.send({ token })
        })
        app.get("/behaviors", async (req, res) => {
            const result = await behaviorsCollection.find({}).toArray()
            res.send(result)
        })
        app.post("/todo/:email",verifyJWT, async (req, res) => {
            const email = req.params.email
            const toDo = req.body
            const result = await toDoCollection.insertOne(toDo)
            res.send(result)
        })
        app.get("/todo", async(req, res) => {
            const email = req.query.email
            const behavior = req.query.behavior
            const query = { email: email, name: behavior }
            const result = await toDoCollection.find(query).toArray()
            res.send(result)

        })
        app.delete("/todo/:id",verifyJWT, async(req, res) => {
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result = await toDoCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)


app.listen(port, () => {
    console.log("Also well");
})