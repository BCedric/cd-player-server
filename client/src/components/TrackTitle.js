import React from 'react'

const TrackTitle = ({ filePath }) => {
  const trackName = filePath.substring(
    filePath.lastIndexOf('/') + 1,
    filePath.lastIndexOf('.')
  )
  return (
    <div>
      <h1>{trackName}</h1>
    </div>
  )
}
export default TrackTitle
