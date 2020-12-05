import React, { useEffect, useState } from 'react'

import { Icon, IconButton, Slider } from '@material-ui/core'
import {
  PlayArrow,
  Stop,
  Pause,
  VolumeDown,
  VolumeUp,
  Info,
  Eject,
  SkipPrevious,
  SkipNext
} from '@material-ui/icons/'

import {
  eject,
  pause,
  play,
  setVolume,
  stop,
  getInfos,
  prev,
  next
} from '../domain/actions'
import TrackTitle from './TrackTitle'

const Player = () => {
  const [volume, setVolumeState] = useState(10)
  const [infos, setInfos] = useState(null)
  const [intervalRef, setIntervalRef] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const volumeChange = (event, newValue) => {
    setVolumeState(newValue)
    setVolume(newValue - volume)
  }

  const isPlayable = infos != null && infos.isPlayable && !isLoading
  const isPlaying = infos != null && infos.status === 'PLAY' && !isLoading
  const isStoppable = infos != null && infos.status !== 'STOP' && !isLoading
  const isStopped = infos != null && infos.status === 'STOP' && !isLoading

  useEffect(() => {
    getInfos()
      .then(storeInfos)
      .then((data) => setVolumeState(parseInt(data.volume)))
  }, [])

  useEffect(() => {
    console.log(infos)
  }, [infos])
  useEffect(() => {
    console.log('isPlayable', isPlayable)
  }, [isPlayable])

  const storeInfos = (data) => {
    setInfos(data)
    return data
  }

  const sendAction = (action) => {
    setIsLoading(true)
    action()
      .then(storeInfos)
      .then((_) => setIsLoading(false))
  }

  useEffect(() => {
    if (!isPlayable) {
      setIntervalRef(
        setInterval(
          () =>
            !isLoading &&
            getInfos()
              .then(storeInfos)
              .then((data) => setVolumeState(parseInt(data.volume))),
          5000
        )
      )
    } else if (intervalRef != null) {
      clearInterval(intervalRef)
    }
    return () => clearInterval(intervalRef)
  }, [isPlayable])

  return (
    <div>
      {infos != null && infos.file != null && (
        <TrackTitle filePath={infos.file} />
      )}
      <IconButton disabled={!isPlayable} onClick={() => sendAction(eject)}>
        <Eject color={!isPlayable ? 'disabled' : 'primary'} fontSize="large" />
      </IconButton>
      <IconButton
        disabled={isPlaying || !isPlayable}
        onClick={() => sendAction(play)}
      >
        <PlayArrow
          color={isPlaying || !isPlayable ? 'disabled' : 'primary'}
          fontSize="large"
        />
      </IconButton>
      <IconButton disabled={!isStoppable} onClick={() => sendAction(stop)}>
        <Stop
          color={!isStoppable ? 'disabled' : 'secondary'}
          fontSize="large"
        />
      </IconButton>
      <IconButton disabled={!isPlaying} onClick={() => sendAction(pause)}>
        <Pause color={!isPlaying ? 'disabled' : 'primary'} fontSize="large" />
      </IconButton>
      <IconButton
        disabled={!isPlayable || isStopped}
        onClick={() => sendAction(next)}
      >
        <SkipNext
          color={!isPlayable || isStopped ? 'disabled' : 'primary'}
          fontSize="large"
        />
      </IconButton>
      <div className="volume-slider">
        <VolumeDown
          color="primary"
          onClick={() => volumeChange(null, volume - 10)}
        />
        <Slider value={volume} onChange={volumeChange}></Slider>
        <VolumeUp
          color="primary"
          onClick={() => volumeChange(null, volume + 10)}
        />
      </div>
    </div>
  )
}

export default Player
