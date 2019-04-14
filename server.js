const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const Methods = require("./functions.js");
const fs = require("fs");
let globals = require("./config/globals.js");

//server config
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
server.listen(32000, () => {
    console.log("Server running on port 32000")
})

//load enviornment variables

globals.nameArray = fs.readFileSync('./config/nameList.txt',"UTF-8")
globals.nameArray = globals.nameArray.split(",")
globals.sourceText = fs.readFileSync('./config/sourceText.txt',"UTF-8")


//endpoints
server.get("/quotation", (req, res) =>{
    getQuote()
    res.send(globals.text)
})
server.get("/name", (req, res) =>{
    res.send(Methods.getRandomName())
})
server.get("/getImage", (req, res) =>{
    
    getImage() 
    res.send(globals.fileName)
})
server.post("/name", (req, res, next) => {  
    addName(req.body.name)
    res.send({"status": 200, "data" : "awwwYEAH!"})
    res.end("yes")
})

//functions
getQuote=()=>{
    Methods.loadText()
    Methods.generateText()
    Methods.cleanText() 
}
addName=(name)=>{
    globals.nameArray.push(name)
    var newNameList = globals.nameArray.toString()
    fs.writeFile('./config/nameList.txt', newNameList, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}
async function getImage() {
    Methods.setSearchTerm()
    await Methods.generateGlobals()
    Methods.setJimpParams()
    Methods.writeOnPicture() 
}


