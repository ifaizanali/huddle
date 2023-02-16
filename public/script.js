const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')

const peers = {}

const config = {
  audio: true,
  video: true
}

var myStream;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myStream = stream
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
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
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

document.getElementById('control-audio').addEventListener('click', (event) => {
  myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
  if(myStream.getAudioTracks()[0].enabled){
    document.getElementById('control-audio').innerHTML = "Mute"
  }
  else {
    document.getElementById('control-audio').innerHTML = "Un Mute"
  }
})

document.getElementById('control-video').addEventListener('click', (event) => {
  myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
  if(myStream.getVideoTracks()[0].enabled){
    document.getElementById('control-video').innerHTML = "Stop Video"
  }
  else {
    document.getElementById('control-video').innerHTML = "Start Video"
  }
})