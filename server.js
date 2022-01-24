const path = require('path')
const express = require('express')
const app = express()

app.use(express.static(path.resolve(__dirname)))
app.get('/', function(req, res){
    res.sendfile(path.resolve(__dirname, 'index.html'))
})

const port = process.env.PORT || 9001

app.listen(port, function(){
    console.log('connected to port', port)
})