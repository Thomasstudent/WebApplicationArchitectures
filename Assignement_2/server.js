const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
const express = require('express')
const app = express()
const bodyParser=require("body-parser");
const jsonParser=bodyParser.json();

//Part MongoDB
const { MongoClient } = require('mongodb');
const DB_URI = "mongodb://mongows:27017";
const client = new MongoClient(DB_URI);
async function main(){
    try {
        // Connect to the MongoDB cluster
        await client.connect();
    } catch (e) {
        console.error(e);
    }
}
main().catch(console.error);

//Part Server
const port = process.env.PORT || 3001
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('public'))

//I listen for socket connection
io.on('connect', (socket) => {
  //Once a user is connected I wait for him to send me figure on the event 'send_figure' or line with the event 'send_line'
  console.log('New connection')
  socket.on('send_figure', (figure_specs) => {
    //Here I received the figure specs, all I do is send back the specs to all other client with the event share figure
    socket.broadcast.emit('share_figure', figure_specs)
  })

  socket.on('send_line', (line_specs) => {
    //Here I received the line specs, all I do is send back the specs to all other client with the event share line
    socket.broadcast.emit('share_line', line_specs)
  })
})

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//Receive images and store them
app.post("/push",jsonParser,function(req,res){
      const body=req.body;
      var img=body["image"];
      var myimage = img.replace(/^data:image\/\w+;base64,/, "");
      var buffer = new Buffer.from(myimage, 'base64');
      fs.writeFileSync(`./Upload/image_${body["date"]}.png`, buffer);
      let adminDb = client.db("WebApp");
      var collection=adminDb.collection("Whiteboard");
      collection.insertOne(body,function(err,result){
        console.log(`Document id:${result.insertedId}`)
      })
  });


async function Retrieve(req,res){
  var username = req.query["user"];
  let adminDb = client.db("WebApp");
  var collection=adminDb.collection("Whiteboard");
  const results=await collection.find({"username":username}).toArray();
  res.send(results);
}

app.get("/get",jsonParser,Retrieve)
