import axios from 'axios'

export function request(config){
  //创建axios实例
  const instance = axios.create({
    baseURL:'http://123.207.32.32:8000/api/x6',
    timeout:10000
  })

  //请求拦截
  instance.interceptors.request.use(config=>{
    return config
  },error => {
    return error
  })
  //响应拦截
  instance.interceptors.response.use(config=>{
    return config
  },error => {
    return error
  })

  //返回promise
  return instance(config)
}
