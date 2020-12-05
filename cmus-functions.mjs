import fs from 'fs'
import { execShellCommand } from './exec-shell-command.mjs'

const handleError = async (req, res, next) => {
  const isCmusRunning = await execShellCommand(`cmus-remote -Q`).then(
    async (infos) => {
      return !infos.includes('cmus-remote: cmus is not running')
    }
  )
  console.log('isCmusRunning', isCmusRunning)
  if (!isCmusRunning) {
    execShellCommand(`cmus`)
    console.log('run cmus')
    next()
  } else {
    next()
  }
}

const play = () => execShellCommand(`cmus-remote -p`)
const stop = () => execShellCommand(`cmus-remote -s`)
const pause = () => execShellCommand(`cmus-remote -u`)
const next = () => execShellCommand(`cmus-remote -n`)
const prev = () => execShellCommand(`cmus-remote -p`)
const setVolume = (value) => execShellCommand(`cmus-remote -v ${value}%`)
const shuffle = () => execShellCommand(`cmus-remote -S`)
const getInfos = () =>
  execShellCommand(`cmus-remote -Q`)
    .then((infos) => infos.split('\n'))

    .then((infos) => ({
      status: infos[0].replace('status ', ''),
      file:
        infos[1] != null && infos[1].includes('file')
          ? infos[1].replace('file ', '')
          : null,
      duration:
        infos[2] != null && infos[2].includes('duration')
          ? infos[2].replace('duration ', '')
          : null,
      position:
        infos[3] != null && infos[3].includes('duration')
          ? infos[3].replace('position ', '')
          : null,
      shuffle:
        infos[13] != null && infos[13].includes('shuffle')
          ? infos[13].replace('set shuffle ', '')
          : infos[10].replace('set shuffle ', ''),
      volume:
        infos[15] != null && infos[15].includes('set vol_left')
          ? infos[15].replace('set vol_left ', '')
          : infos[12].replace('set vol_left ', ''),
      isPlayable: fs.existsSync(process.env.CD_FOLDER)
    }))

const clearQueue = () => execShellCommand(`cmus-remote -c -q`)
const setQueue = (path) => execShellCommand(`cmus-remote -q ${path}`)
const startMusicPlayer = () => execShellCommand(`cmus`)

export {
  handleError,
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
  startMusicPlayer
}
