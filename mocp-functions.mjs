import fs from 'fs'
import { execShellCommand } from './exec-shell-command.mjs'

const handleError = async (req, res, next) => {
  const isCmusRunning = await execShellCommand(`mocp -i`).then(
    async (infos) => {
      return !infos.includes('The server is not running!')
    }
  )
  console.log('isMocpRunning', isCmusRunning)
  if (!isCmusRunning) {
    await execShellCommand(`mocp -S`)
    console.log('run mocp')
  }
  next()
}

const play = () => execShellCommand(`mocp -p`)
const stop = () => execShellCommand(`mocp -s`)
const pause = () => execShellCommand(`mocp -G`)
const next = () => execShellCommand(`mocp -f`)
const prev = () => execShellCommand(`mocp -r`)
const setVolume = (value) => execShellCommand(`mocp -v ${value}`)
const shuffle = () => execShellCommand(`mocp -t shuffle`)
const getInfos = () =>
  execShellCommand(`mocp -i`)
    .then((infos) => {
      console.log(infos)
      console.log(
        `amixer sget ${process.env.SOUND_INTERFACE} | grep 'Mono:' | awk -F'[][]' '{ print $2 }'`
      )
      return infos
    })
    .then((infos) => infos.split('\n'))
    .then(async (infos) => ({
      status: infos[0].replace('State: ', ''),
      file: infos[1] != null ? infos[1].replace('File ', '') : null,
      duration: infos[2] != null ? infos[2].replace('TotalSec: ', '') : null,
      position: infos[3] != null ? infos[3].replace('CurrentSec: ', '') : null,
      // shuffle:
      //   infos[13] != null
      //     ? infos[13].replace('set shuffle ', '')
      //     : infos[10].replace('set shuffle ', ''),
      volume: await getVolumeFromAmixer(),
      volumeLimits: await getVolumeLimitsFromAmixer(),
      isPlayable: fs.existsSync(process.env.CD_FOLDER)
    }))

const clearQueue = () => execShellCommand(`mocp -c`)
const setQueue = (path) => execShellCommand(`mocp -a ${path}`)
const startMusicPlayer = () => execShellCommand(`mocp -SF`)

const getVolumeFromAmixer = () => {
  return execShellCommand(
    `amixer sget ${process.env.SOUND_INTERFACE} | grep 'Mono:' | awk -F' ' '{ print $3 }'`
  ).then((volume) => volume.trim())
}

const getVolumeLimitsFromAmixer = () => {
  return execShellCommand(
    `amixer sget ${process.env.SOUND_INTERFACE} | grep 'Limits:' | awk -F' ' '{ print $3, $5 }'`
  ).then((limits) => limits.trim().split(' '))
}

export {
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
}
