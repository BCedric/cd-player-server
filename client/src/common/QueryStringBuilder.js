const completeServerURL = process.env.REACT_APP_SERVER_URL

export const queryStringBuild = (url, params = null) => {
  if (params == null) {
    return `${completeServerURL}${url}`
  }
  return `${completeServerURL}${url}?${Object.keys(params)
    .map((paramKey) => `${paramKey}=${params[paramKey]}`)
    .join('&')}`
}
