// dependencies
const Rita = require("rita");
const Jimp = require("jimp");
const Twit = require("twit");
const axios = require("axios");
const fs = require("fs");
const unsplashConfig = require("./config/unsplashConfig.js")
let globals = require("./secret/globals.js")

loadText =()=>{
    globals.markov = Rita.RiMarkov(2, true, false)
    globals.markov.loadText(globals.sourceText)
}
exports.loadText = loadText

generateText =()=>{
    globals.text = globals.markov.generateSentence()
}
exports.generateText = generateText

generateGlobals = async()=>{
    const config = {
        headers : {"Authorization" : "Bearer " + unsplashConfig.token}
    }
    try {
        let response = await axios.get("https://api.unsplash.com/search/photos/?query=" + globals.searchTerm, config)
        if (response.data.total == 0) {
            await getRandomPhoto()
        }
        else {
          var rI = Math.floor(Math.random() * response.data.results.length)
          for(var i=0; i < response.data.results.length; ++i){
              if(response.data.results[rI % 10].height > response.data.results[rI % 10].width)
                rI++ 
              else
                break    
          }
          globals.height = response.data.results[rI % 10].height
          globals.width = response.data.results[rI % 10].width
          globals.url = response.data.results[rI % 10].urls.regular
          globals.photographer = response.data.results[rI % 10].user.name
        }
      }
    catch (error){
          console.log(error)
      }
  }
exports.generateGlobals = generateGlobals

getRandomPhoto = async()=>{
    try{
        let response = await axios.get("https://api.unsplash.com/photos/random/?client_id=" + unsplashConfig.application_ID)
        globals.height = response.data.height
        globals.width = response.data.width
        globals.url = response.data.urls.raw

    }
    catch (error){
        console.log(error)
    }
}
exports.getRandomPhoto = getRandomPhoto

getRandomName=()=>{
    var rI = Math.floor(Math.random() * globals.nameArray.length)
    return globals.nameArray[rI]
}
exports.getRandomName = getRandomName

setSearchTerm =()=>{
    var wordString = Rita.RiString(globals.text)
    var posArray = wordString.pos()
    for(i = 0; i < posArray.length; ++i ){
        if(posArray[i] != "pps" || posArray[i] != "prp")
        {
            if(posArray[i] == "nn" || posArray[i] == "nns")
            {
                globals.searchTerm = wordString.wordAt(i)
            }
        }				
    }
}
exports.setSearchTerm = setSearchTerm

cleanText =()=>{
    var sentence = Rita.RiString(globals.text)
    var wordArray = sentence.words()
    var posArray = sentence.pos()
    var quoteFlag = true
    
    if (sentence.length > 100){
        Methods.generateText()
        Methods.setSearchTerm()
        Methods.cleanText()
    }

    console.log("cleanText in: " + globals.text)

    //truncate sentences with commas or semi-colons
    for(i = 0; i < sentence.length(); ++i){
        if(sentence.charAt(i) == `,` || sentence.charAt(i) == `;`){
            if(sentence.charAt(i) == `;`){
                sentence.replaceChar(i ,`.`)
                sentence = Rita.RiString(sentence.slice(0, i+1))
            } else {
                //TODO: deal with commas seperately here.
            }
            break
        }
    }
    //if sentence ends with a space in the elipses, remove the space.
    if(sentence.charAt(sentence.length()-1) == sentence.charAt(sentence.length()-2))
        sentence.removeChar(sentence.length()-3)

    //check for appropriate punctuation
    if( wordArray[0] == "Who"  ||
        wordArray[0] == "What" ||
        wordArray[0] == "Where"||
        wordArray[0] == "When" ||
        wordArray[0] == "Why"  ||
        wordArray[0] == "How"  ||
        wordArray[0] == "Did"  ||
        wordArray[0] == "Does" ||
        wordArray[0] == "Is"   ||
        wordArray[0] == "Which"||
        wordArray[0] == "Should"||
        wordArray[0] == "Would"||
        wordArray[0] == "Who"  ||
        wordArray[0] == "Whose"||
        wordArray[0] == "Whom" ){
        if(sentence.charAt(sentence.length()-1) == `.`)
            sentence.replaceChar((sentence.length()-1),`?`)
    }else if((posArray[1] == "prp" || posArray[1] == "prp$") && posArray[0] == "md"){
        if(sentence.charAt(sentence.length()-1) == `.`)
            sentence.replaceChar((sentence.length()-1),`?`)
    }else if(sentence.charAt(sentence.length()-1) == `?`){
        sentence.replaceChar((sentence.length()-1),`.`)
    }
    //replace names with other names or create a quotation
    for(i=0; i < wordArray.length; ++i){
        if (wordArray[i] == "K" || wordArray[i] == "Leni" || wordArray[i] == "Huld" || wordArray[i] == "Bürstner" || wordArray[i] == "Franz"){
            sentence.replaceWord(i, getRandomName())
            quoteFlag = false
        }
            
        if (wordArray[i] == "K's" || wordArray[i] == "Leni's" || wordArray[i] == "Huld's" || wordArray[i] == "Bürstner's" || wordArray[i] == "Franz's"){
            sentence.replaceWord(i, getRandomName() + "'s")
            quoteFlag = false
        }
    }
    //remove all quotations
    for(i = 0; i < sentence.length; ++i){
        if(sentence.charAt(i) == `"`)
            sentence.removeChar(i)
    }

    //remove numerals, complete quotations, check for incomplete parentheticals, and convert from RiString to string
    var quoteMarks = 0
    var parentheses = 0
    for(i = 0; i < sentence.length(); ++i){
        if(sentence.charAt(i) == "0" ||
           sentence.charAt(i) == "1" ||
           sentence.charAt(i) == "2" ||
           sentence.charAt(i) == "3" ||
           sentence.charAt(i) == "4" ||
           sentence.charAt(i) == "5" ||
           sentence.charAt(i) == "6" ||
           sentence.charAt(i) == "7" ||
           sentence.charAt(i) == "8" ||
           sentence.charAt(i) == "9" ){                
            sentence.removeChar(i)
             --i
           }
        if(sentence.charAt(i) == `"`)
            ++ quoteMarks
        if(sentence.charAt(i) == `(` || sentence.charAt(i) == `)`){
            ++ parentheses
            var parIndex = i   
        }       
    } 
    if(parentheses == 1)
        sentence.removeChar(parIndex)
    if(quoteMarks == 1){
        sentence = sentence.text()
        sentence += `"`
    } else {
        sentence = sentence.text()
    }
       //if a name hasn't been replaced, create a quotation
    if (quoteFlag == true){
        globals.text = `"` + sentence + `"` + " -" + " " + getRandomName()
    } else {
        globals.text = sentence
    }
    
    console.log("cleanText out: " + globals.text)
}
exports.cleanText = cleanText

setResizeHeight = ()=> {
    var ratio = globals.resizeWidth / globals.width
    globals.resizeHeight = Math.round(globals.height * ratio)
}
exports.setResizeHeight = setResizeHeight

setJimpParams = ()=>{  
    if(globals.text.length < 25)
        if(Math.random() > .5){
            globals.resizeWidth = 1080
            globals.ystart = 25
        }else{
            globals.resizeWidth = 1080 
            setResizeHeight()
            globals.ystart = (globals.resizeHeight - 100)
        }
    if(globals.text.length > 25 && globals.text.length <= 50)
        if(Math.random() > .5){
            globals.resizeWidth = 1080
            globals.ystart = 25
        }else{
            globals.resizeWidth = 1080
            setResizeHeight()
            globals.ystart = (globals.resizeHeight - 200)
    }
    if(globals.text.length > 50 && globals.text.length <= 75)
        if(Math.random() > .5){
            globals.resizeWidth = 1600
            globals.ystart = 25
        }else{
            globals.resizeWidth = 1600
            setResizeHeight()
            globals.ystart = (globals.resizeHeight - 200)
    }
    if(globals.text.length > 75)
        if(Math.random() > .5){
            globals.ystart = 25
            globals.resizeWidth = 1600
        }else{
            globals.resizeWidth = 1600
            setResizeHeight()
            globals.ystart = (globals.resizeHeight - 300)
    }
    globals.xwrap = globals.resizeWidth - 25
}
exports.setJimpParams = setJimpParams

writeOnPicture =()=>{
    var fileName = "./img" + Date.now() + ".png"
    globals.fileName = fileName
    var loadedImage
    Jimp.read(globals.url)
        .then(function (image) {
            loadedImage = image
            return Jimp.loadFont(globals.font)
        })
        .then(function (font) {
            loadedImage.resize(globals.resizeWidth, Jimp.AUTO)
                       .print(font, globals.xstart, globals.ystart, globals.text, globals.xwrap)
                       .write(fileName)
        })
        .catch(function (err) {
            console.error(err)
        })
}
exports.writeOnPicture = writeOnPicture