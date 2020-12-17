import express from 'express'
import dotenv from 'dotenv'
import fs from 'fs'
import cors from 'cors'
import path, { dirname } from 'path'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'

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
} from './mocp-functions.mjs'
import { execShellCommand } from './exec-shell-command.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config()

const init = async () => {
  await startMusicPlayer()
  let folderExists = false
  setInterval(() => {
    if (fs.existsSync(process.env.CD_FOLDER) && !folderExists) {
      folderExists = true
      playDisc()
      console.log('start disque')
    } else if (!fs.existsSync(process.env.CD_FOLDER) && folderExists) {
      folderExists = false
    }
  }, 5000)
}

init()

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(handleError)

const sortFiles = function (a, b) {
  return Number(a.match(/(\d+)/g)[0]) - Number(b.match(/(\d+)/g)[0])
}

const playDisc = async () => {
  clearQueue()
  const files = fs.readdirSync(process.env.CD_FOLDER)

  const sortedFiles = files.sort(sortFiles)
  for (const file in sortedFiles) {
    const filePath = `${process.env.CD_FOLDER}/${sortedFiles[file]}`.replace(
      ' ',
      '\\ '
    )
    await setQueue(filePath)
  }

  return play()
}

app.put('/eject', async (req, res) => {
  stop()
  clearQueue()
  await execShellCommand('eject cdrom')
  res.json({ ...(await getInfos()), isPlayable: false })
})

app.put('/play', async (req, res) => {
  console.log('start play')
  const infos = await getInfos()
  console.log('[play]', infos.status)
  if (infos.status === 'PAUSE') {
    console.log('play')
    await pause()
  } else {
    console.log('play disc')
    await playDisc()
  }

  console.log('return play')
  return res.json({ ...(await getInfos()), status: 'PLAY' })
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
  res.json({ ...(await getInfos()), status: 'PLAY' })
})

app.put('/prev', async (req, res) => {
  await prev()
  res.json({ ...(await getInfos()), status: 'PLAY' })
})

app.put('/shuffle', async (req, res) => {
  await shuffle()
  res.json(await getInfos())
})

app.put('/volume', async (req, res) => {
  const value = req.body.value
  const strValue = value >= 0 ? `+${value}` : `${value}`
  await setVolume(value)
  res.json(await getInfos())
})

app.get('/infos', async (req, res) => {
  res.json(await getInfos())
})

app.use(express.static(path.join(__dirname, 'client/build')))
app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})

app.get('/env', (req, res) => {
  res.json(process.env)
})

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
)
