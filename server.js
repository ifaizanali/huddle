const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const fs = require('fs')

const file = fs.readFileSync('./46640605E7F3C4E26FA9165A2B6BF589.txt')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/.well-known/pki-validation/46640605E7F3C4E26FA9165A2B6BF589.txt', (req, res) => {
  res.sendFile('/home/ec2-user/huddle/46640605E7F3C4E26FA9165A2B6BF589.txt')
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)