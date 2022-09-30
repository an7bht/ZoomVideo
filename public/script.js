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
const videos = []
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) 
  peers[userId].close()
  if(videos.some(v => v.id == userId)){
    var video = videos.find(v => v.id == userId)
    video.control.remove()
    videos.remove(video)
  }
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
    videos.push({ id: userId, control: video })
  })
//   call.on('close', () => {
//     video.remove()
//   })

   peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}