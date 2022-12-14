const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
// const myPeer = require(server, {
//     debug: true,
//     path: '/myapp'
//   });
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video:{ width: 1920, height: 1080 },
  audio: true
}).then(stream => {
  myVideo.id = myPeer.id
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    video.id = call.peer
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) { peers[userId].close() }
  try { document.getElementById(userId).remove() } catch(e) { }
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  video.id = userId
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

   peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}