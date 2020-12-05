import axios from 'axios'

import { queryStringBuild } from './QueryStringBuilder'

class Http {
  static get = (url, params = null) =>
    axios.get(queryStringBuild(url, params)).then((res) => res.data)

  static post = (url, body, params = null) => {
    return axios
      .post(queryStringBuild(url, params), JSON.stringify(body), {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => res.data)
  }

  static delete = (url, params = null) => {
    return axios.delete(queryStringBuild(url, params)).then((res) => res.data)
  }

  static put = (url, body, params = null) => {
    return axios
      .put(queryStringBuild(url, params), JSON.stringify(body), {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => res.data)
  }
}

export default Http
