import Http from '../common/Http'

const play = () => Http.put('/play')
const pause = () => Http.put('/pause')
const stop = () => Http.put('/stop')
const next = () => Http.put('/next')
const prev = () => Http.put('/prev')
const eject = () => Http.put('/eject')
const setVolume = (value) => Http.put('/volume', { value })
const getInfos = () => Http.get('/infos')

export { play, pause, stop, next, prev, eject, setVolume, getInfos }
