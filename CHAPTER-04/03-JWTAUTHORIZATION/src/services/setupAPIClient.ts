import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next'
import { parseCookies } from 'nookies'
import { signOut } from '../context/AuthContext'
import { IUser } from '../context/types'
import { setUserRefreshToken, setUserToken, TOKEN_NAME } from '../context/utils'
import { AuthTokenError } from './errors/AuthTokenError'

export interface IAxiosErrorResponse {
  code?: string
}

let isRefreshing = false
let failedRequestsQueue: any[] = []

export function setupAPIClient(
  context: GetServerSidePropsContext | undefined = undefined
) {
  let cookies = parseCookies(context)

  const Api = axios.create({
    baseURL: 'http://localhost:3333',
  })

  Api.defaults.headers.common.Authorization = `Bearer ${cookies[TOKEN_NAME]}`

  Api.interceptors.response.use(
    (response) => {
      return response
    },
    (error: AxiosError<IAxiosErrorResponse>) => {
      if (error.response?.status === 401) {
        if (error.response?.data?.code === 'token.expired') {
          cookies = parseCookies()

          const { NEXT_AUTH_REFRESH_TOKEN: refreshToken } = cookies
          const originalConfig = error.config

          if (!isRefreshing) {
            isRefreshing = true

            console.log(`refresh`)

            Api.post<Pick<IUser, 'token' | 'refreshToken'>>('/refresh', {
              refreshToken,
            })
              .then((response) => {
                const { token } = response.data

                setUserToken(context, token)
                setUserRefreshToken(context, response.data.refreshToken)

                Api.defaults.headers.common.Authorization = `Bearer ${token}`
                failedRequestsQueue.forEach((request) =>
                  request.onSuccess(token)
                )
                failedRequestsQueue = []
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) => request.onError(err))
                failedRequestsQueue = []

                if (typeof window !== 'undefined') {
                  signOut()
                }
              })
              .finally(() => {
                isRefreshing = false
              })
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                if (!originalConfig?.headers) {
                  return
                }

                originalConfig.headers.Authorization = `Bearer ${token}`

                resolve(Api(originalConfig))
              },
              onError: (err: AxiosError) => {
                reject(err)
              },
            })
          })
        } else {
          if (typeof window !== 'undefined') {
            signOut()
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }

      return Promise.reject(error)
    }
  )

  return Api
}
