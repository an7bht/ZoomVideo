const fs = require('fs')
const express = require('express')
const app = express()
const https = require('https')

const key = fs.readFileSync('key.pem','utf-8')
const cert = fs.readFileSync('cert.pem','utf-8')
const options = {
  key: key,
  cert: cert,
  passphrase: '123456'
}
const server = https.Server(options,app)
//const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) =>{
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) =>{
    res.render('room', { roomId:req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room',(roomId, userId)=>    {
        console.log(userId)
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connection', userId)
       
    })
   
})

    server = app.listen(process.env.PORT || 3000,()=> {
    console.log('Server listening on port ' + server.address().port);
  });

