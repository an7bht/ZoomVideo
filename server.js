//const fs = require('fs')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var rooms = []

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
        if(!rooms.includes(roomId)) { rooms.push(roomId) }
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        console.log('Online room list: ',rooms)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
            if(!io.sockets.adapter.rooms[roomId]){
                rooms = rooms.filter(r => r != roomId)
                console.log('Online room list: ',rooms)
            }
          })
    })
   
})


module.exports = app;
    server.listen(process.env.PORT || 3000,()=> {
    console.log('Server listening on port ' + server.address().port);
  });

