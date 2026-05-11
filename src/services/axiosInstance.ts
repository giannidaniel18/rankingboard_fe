import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'apps',
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[axiosInstance] response error:', error)
    return Promise.reject(error)
  },
)

export default axiosInstance
