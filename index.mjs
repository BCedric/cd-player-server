import express from 'express'
import dotenv from 'dotenv'
import fs from 'fs'
import cors from 'cors'
import path, { dirname } from 'path'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'
import socketIo from 'socket.io'
import http from 'http'

import {
  play,
  stop,
  pause,
  next,
  prev,
  setVolume,
  shuffle,
  getInfos,
  clearQueue,
  setQueue,
  startMusicPlayer,
  handleError
} from './cmus-functions.mjs'
import { execShellCommand } from './exec-shell-command.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config()

const app = express()
const server = http.Server(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(bodyParser.json())
app.use(handleError)

const sortFiles = function (a, b) {
  return Number(a.match(/(\d+)/g)[0]) - Number(b.match(/(\d+)/g)[0])
}

const playDisc = async () => {
  await clearQueue()
  const files = fs.readdirSync(process.env.CD_FOLDER)
  await Promise.all(
    files.sort(sortFiles).map(async (file) => {
      const filePath = `${process.env.CD_FOLDER}/${file}`.replace(' ', '\\ ')
      return setQueue(filePath)
    })
  )
  await next()
  return play()
}

let folderExists = false
setInterval(async () => {
  const infos = await getInfos()
  io.sockets.emit('FromApi', { infos })
  if (fs.existsSync(process.env.CD_FOLDER) && !folderExists) {
    folderExists = true
    playDisc()
    console.log('start disque')
  } else if (!fs.existsSync(process.env.CD_FOLDER) && folderExists) {
    folderExists = false
  }
}, 5000)

io.sockets.on('connection', function (socket) {
  socket.on('hello', function (data) {
    console.log('new client connected')
  })
  socket.on('news', function (data) {
    socket.emit('news_by_server', 1)
  })
})

app.put('/eject', async (req, res) => {
  stop()
  clearQueue()
  await execShellCommand('eject cdrom', (error) => {
    console.log(error)
  })
  res.json({ ...(await getInfos()), isPlayable: false })
})

app.put('/play', async (req, res) => {
  console.log('start play')
  const infos = await getInfos()
  console.log(infos, infos.status === 'stopped')
  if (infos.status === 'stopped') {
    await playDisc()
  } else {
    await play()
  }

  console.log('return play')
  return res.json({ ...(await getInfos()), status: 'playing' })
})

app.put('/stop', async (req, res) => {
  await stop()
  await clearQueue()
  res.json(await getInfos())
})

app.put('/pause', async (req, res) => {
  await pause()
  res.json(await getInfos())
})

app.put('/next', async (req, res) => {
  await next()
  res.json({ ...(await getInfos()), status: 'playing' })
})

app.put('/prev', async (req, res) => {
  await prev()
  res.json({ ...(await getInfos()), status: 'playing' })
})

app.put('/shuffle', async (req, res) => {
  await shuffle()
  res.json(await getInfos())
})

app.put('/volume', async (req, res) => {
  const value = req.body.value
  const strValue = value >= 0 ? `+${value}` : `${value}`
  await setVolume(strValue)
  res.json(await getInfos())
})

app.get('/infos', async (req, res) => {
  res.json(await getInfos())
})

app.use(express.static(path.join(__dirname, 'client/build')))
app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})

server.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
)
startMusicPlayer()
