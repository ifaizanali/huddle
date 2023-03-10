const express = require('express')
const app = express()
const https = require('https')
const { v4: uuidV4 } = require('uuid')
const fs = require('fs')

const cert = fs.readFileSync('certificate.crt')
const key = fs.readFileSync('private.key')


const cred = {
  key,
  cert
}



app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

const httpsServer = https.createServer(cred, app)

const io = require('socket.io')(httpsServer);

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

app.listen(3000, () => {console.log('running on 3000')})
httpsServer.listen(8443)