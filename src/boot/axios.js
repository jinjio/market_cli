import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Loading, Notify, QSpinnerGrid, LocalStorage } from 'quasar'
import { $jkutil, $t } from './jkutil'
import { nanoid } from 'nanoid'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

let host
let port = 9099
let baseURL
let force_live = false
if (process.env.DEV && force_live === false) {
  host = 'localhost'
  baseURL = `http://${host}:${port}`
} else {
  // host = 'api.ankichampion.com'
  host = 'reviewral.com'
  baseURL = `https://${host}:${port}`
  // baseURL = `http://${host}:${port}`
}

let udid = LocalStorage.getItem('udid')
if (udid == null) {
  udid = nanoid()
  LocalStorage.set('udid', udid)
}


console.log('>>> udid', udid)

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'x-udid': udid
  }
})

axiosInstance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // handle error
    if (error.response == null) {
      let url = error.config.url
      console.error('axios error url', error.config.url, url.indexOf('/user/check_in'))
      if (url.indexOf('/user/check_in') == -1) {
        // 이 부분이 api 쪽 연결일 경우 문제가 있다.
        $router.push(`/error503?origin=${window.location.hash.replace('#', '')}`)
      }
    } else {
      console.log('axios error', error.response)
      console.log('responseURL', error.request.responseURL)
      if (error.response != null && error.response.status == 403) {
        console.log('user', $jkutil.user)
        $jkutil.user?.logout()
        // 이게 구글 로그인에 문제를 일으킴
        $router.replace('/register')
      } else {
        error.message = error.response.data?.message
        if (error.message != null) {
          console.error('Error', error.request.responseURL, error.message)
          Notify.create({
            caption: $t(error.message),
            icon: 'error',
            type: 'negative',
            timeout: 2000 // default 5000
          })
        }
      }
    }
    return Promise.reject(error)
  }
)

let websocket_url = baseURL.replace('http', 'ws')
let websocket

const connect_websocket = (url) => {
  console.log('connect_websocket===> ', `${websocket_url}${url}?token=${$jkutil.user.token}`)
  websocket = new WebSocket(`${websocket_url}${url}?token=${$jkutil.user.token}`, 'chatomta-protocol')
  websocket.onopen = (event) => {
    console.log('websocket.connected')
    websocket.connected_ok = true
  }
  websocket.onclose = async (event) => {
    console.log('websocket.onclose', event)
    // setTimeout(connect_websocket, 1000)
    if (websocket.connected_ok == true) {
      setTimeout(() => {
        connect_websocket(url)
      }, 1000)
    }
    if (websocket_message_handler != null) {
      websocket_message_handler.forEach(async (handler) => await handler({
        command: 'ws_close'
      }))
    }
  }
  websocket.onerror = async (event) => {
    console.error('websocket.onerror', event)

    $jkutil.showError($t('websocket_error'))
    // if (websocket.connected_ok != true) {
    //   $jkutil.showError($t('not_joined'))
    //   if (websocket_message_handler != null) {
    //     websocket_message_handler.forEach(async (handler) => await handler({
    //       command: 'error',
    //       options: {
    //         error_message: 'not_joined'
    //       }
    //     }))
    //   }
    // } else {
    //   $jkutil.showError($t('websocket_error'))
    // }
  }
  websocket.onmessage = async (event) => {
    let message = JSON.parse(event.data)
    if (message.command == 'ping') {
      websocket.sendCommand('pong')
    } else if (message.command == 'error') {
      if (message.options.message == 'already_joined') {
        $jkutil.showError($t(message.options.message))
        $router.replace('/playground')
      } else if (message.options.message == 'kickout_user') {
        $jkutil.showLoading($t(message.options.message))
      } else if (message.options.message == 'closed') {
        $jkutil.shoError($t(message.options.message))
        $router.replace('/playground')
      } else {
        $jkutil.showError($t(message.options.message))
      }
    } else {
      console.log('<- receive message', message.command, message.options)
      if (websocket_message_handler != null) {
        websocket_message_handler.forEach(async (handler) => await handler(message))
      }
    }
  }
}

const disconnect_websocket = () => {
  // 자동 재접속을 막는다.
  websocket.onclose = null
  websocket.close()
  websocket = null
}

let websocket_message_handler = []
const $api = {
  'udid': udid,
  upload_url: `${baseURL}/file/upload_image`,
  // google_redirect_url: `https://api.ankichampion.com:${port}/user/oauth/google/${host.split('.')[0]}`,
  // google_redirect_url: `https://api.ankichampion.com:${port}/user/oauth/google`,
  google_redirect_url: `${baseURL}/user/oauth/google/${host.split('.')[0]}`,
  addWebsocketListner: (message_handler, url, connect = true) => {
    console.log('$api addWebsocketListner', url)
    if (message_handler == null) return
    let found_index = websocket_message_handler.findIndex(handler => handler == message_handler)
    if (found_index >= 0) {
      console.error('exising handler')
      return
    }
    websocket_message_handler.push(message_handler)
    // Chat.vue가 먼저 열면서 다른 친구들한테 기회를 안주기때문에 이걸로 막음.
    if (websocket == null && connect == true) {
      connect_websocket(url)
    }
    console.log('# of handler', websocket_message_handler.length)
  },
  removeWebsocketListner: (message_handler) => {
    let found_index = websocket_message_handler.findIndex(handler => handler == message_handler)
    if (found_index >= 0) {
      websocket_message_handler.splice(found_index, 1)
    }
    // 리소스 절약을 위서 안 쓰는 경우 닫는다.
    if (websocket_message_handler.length == 0 && websocket != null) {
      console.log('removeWebsocketListner clsoe websocket')
      disconnect_websocket()
    }
  },
  // 웹소켓 메시지 전송
  sendCommand: (command, options) => {
    websocket.sendCommand(command, options)
  },
  translate: async (text, src_language = 'EN', target_language = 'KO') => {
    try {
      let response = await axiosInstance.request({
        method: 'POST',
        url: 'https://deepl-translator.p.rapidapi.com/translate',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': 'er8baJLrGYmshLwcNt9WwDLYFOTop1CVSaIjsnpFiHFdRWERJQ',
          'X-RapidAPI-Host': 'deepl-translator.p.rapidapi.com'
        },
        data: {
          text: text,
          source: src_language,
          target: target_language,
        }
      })
      return response.data.text
    } catch (e) {
      console.error('translate', e.message)
    } finally {
    }
  },

  checkIn: async () => {
    try {
      let response = await axiosInstance.get('/user/check_in', {
        params: {}
      })

      // gtag('event', 'check_in', {
      //   click_text: response.data.nickname
      // })
      return response.data
    } catch (e) {
      console.error('checkIn', e.message)
    } finally {
    }
  },

  requestLoginCode: async email => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/user/request_login_code', {
        email
      })
      return response.data
    } catch (e) {
      console.error('requestLoginCode', e.message)
    } finally {
      Loading.hide()
    }
  },
  login: async ({ temp_token, email, login_code, type, host, agree_terms_and_privacy, agree_push }) => {
    try {
      Loading.show({ spinner: QSpinnerGrid, message: $t('login') })
      let response = await axiosInstance.get('/user/login', {
        params: {
          temp_token,
          email,
          login_code,
          type,
          host,
          agree_terms_and_privacy,
          agree_push,
        }
      })
      return response.data
    } catch (e) {
      throw e
    } finally {
      Loading.hide()
    }
  },

  logout: async () => {
    try {
      Loading.show({ spinner: QSpinnerGrid, message: $t('login') })
      let response = await axiosInstance.post('/user/logout', {
        params: {
        }
      })
      return response.data
    } catch (e) {
      throw e
    } finally {
      Loading.hide()
    }
  },

  agreeTerms: async (user_id, agree_terms_and_privacy, agree_push) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/user/agree_terms', {
        user_id,
        agree_terms_and_privacy,
        agree_push
      })
      return response.data
    } catch (e) {
      console.error('agreeTerms', e.message)
    } finally {
      Loading.hide()
    }
  },

  getMe: async () => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.get('/user/me', {
        params: {
        }
      })
      return response.data
    } catch (e) {
      throw e
    } finally {
      Loading.hide()
    }
  },

  updateMe: async (key, value) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/user/me', {
        key,
        value,
      })
      return response.data
    } catch (e) {
      throw e
    } finally {
      Loading.hide()
    }
  },

  // Chats
  createChatRoom: async (name) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/chat_room', {
        name,
      })
      return response.data
    } catch (e) {
      console.error('createGroup', e.message)
    } finally {
      Loading.hide()
    }
  },

  updateChatRoom: async (chat_room_id, key, value) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.put('/chat_room', {
        chat_room_id,
        key,
        value
      })
      return response.data
    } catch (e) {
      console.error('createGroup', e.message)
    } finally {
      Loading.hide()
    }
  },


  listChats: async ({ page, rowsPerPage, descending, sortBy, filter, type }) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.get('/chat_room/list', {
        params: {
          page: page,
          rowsPerPage: rowsPerPage,
          descending: descending,
          sortBy: sortBy,
          filter: filter,
          type: type,
        }
      })
      return response.data
    } catch (e) {
      console.error('listChats', e.message)
    } finally {
      Loading.hide()
    }
  },

  deleteChatRoom: async (chat_room_id) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.delete('/chat_member', {
        data: {
          chat_room_id
        }
      })
      return response.data
    } catch (e) {
      console.error('deleteChatRoom', e.message)
    } finally {
      Loading.hide()
    }
  },

  deleteChatRoomMember: async (chat_room_id, member_user_id) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.delete('/chat_room/member', {
        data: {
          chat_room_id,
          member_user_id,
        }
      })
      return response.data
    } catch (e) {
      console.error('deleteChatRoomMember', e.message)
    } finally {
      Loading.hide()
    }
  },

  deleteChatRoomInvitee: async (chat_room_id, invitee_id) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.delete('/chat_room/invitee', {
        data: {
          chat_room_id,
          invitee_id,
        }
      })
      return response.data
    } catch (e) {
      console.error('deleteChatRoomInvitee', e.message)
    } finally {
      Loading.hide()
    }
  },

  getChat: async (chat_room_id) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      if (chat_room_id == null) return
      let response = await axiosInstance.get(`/chat_room`, {
        params: {
          chat_room_id,
        }
      })
      return response.data
    } catch (e) {
      console.error('getChat error', e.message)
      return e.message
    } finally {
      Loading.hide()
    }
  },

  joinChatRoom: async (chat_room_id, password) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/chat_room/join', {
        chat_room_id,
        password
      })
      return response.data
    } catch (e) {
      console.error('joinRoom', e.message)
    } finally {
      Loading.hide()
    }
  },

  inviteChatRoom: async (chat_room_id, invitee_email_address) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/chat_room/invite', {
        chat_room_id,
        invitee_email_address,
      })
      return response.data
    } catch (e) {
      console.error('inviteChatRoom', e.message)
    } finally {
      Loading.hide()
    }
  },

  deleteAccount: async () => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.delete('/user', {
        data: {
        }
      })
      return response.data
    } catch (e) {
      console.error('deleteAccount', e.message)
    } finally {
      Loading.hide()
    }
  },

  setAPIKey: async (provider, api_key) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/api_key', {
        provider,
        api_key,
      })
      return response.data
    } catch (e) {
      console.error('joinRoom', e.message)
    } finally {
      Loading.hide()
    }
  },

  deleteAPIKey: async (provider, api_key) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.delete('/api_key', {
        data: {
          provider,
          api_key,
        }
      })
      return response.data
    } catch (e) {
      console.error('deleteAPIKey', e.message)
    } finally {
      Loading.hide()
    }
  },

  setAuth(token) {
    console.log('setAuth', token)
    document.cookie = 'X-Authorization=' + token + '; path=/'
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },

  setWebPush: async () => {
    console.log('setWebPush')
    if ('serviceWorker' in navigator == false)
      return
    try {
      Loading.show({ spinner: QSpinnerGrid })

      let registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (subscription == null) {
        console.log('no subscription')
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: "BCDWMVmVVLDHCn3ZjyzeFuh4M2Qn_njrmItPWU4Kwihd1WJXMJ6wmfJIzWmYT04R0g24NxyH1m0FYcXpZMsar3g"
        })
        console.log('new subscription', JSON.stringify(subscription, null, 4))


      } else {
        console.log('existing subscription', JSON.stringify(subscription, null, 4))
      }
      let response = await axiosInstance.post('/user/web_push', {
        subscription,
        udid: $jkutil.udid,
      })
      return response.data
    } catch (e) {
      console.error('setWebPush:', e.message)
    } finally {
      Loading.hide()
    }
  },

  deleteWebPush: async () => {
    if ('serviceWorker' in navigator == false)
      return
    try {
      // 서버에서 삭제가 되면 삭제를 한다.
      let response = await axiosInstance.delete('/user/web_push', {
        data: {
        }
      })

      let registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (subscription != null) {
        subscription.unsubscribe()
      }
      Loading.show({ spinner: QSpinnerGrid })

      return response.data
    } catch (e) {
      console.error('deleteWebPush', e.message)
    } finally {
      Loading.hide()
    }
  },

  createPaymentIntent: async (amount, currency) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/payment/create-payment-intent', {
        amount,
        currency
      })
      return response.data
    } catch (e) {
      console.error('createPaymentIntent', e.message)
      throw e
    } finally {
      Loading.hide()
    }
  },

  confirmPayment: async (paymentIntentId) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.post('/payment/confirm-payment', {
        paymentIntentId
      })
      return response.data
    } catch (e) {
      console.error('confirmPayment', e.message)
      throw e
    } finally {
      Loading.hide()
    }
  },

  getPaymentHistory: async (page, rowsPerPage) => {
    try {
      Loading.show({ spinner: QSpinnerGrid })
      let response = await axiosInstance.get('/payment/history', {
        params: {
          page,
          rowsPerPage
        }
      })
      return response.data
    } catch (e) {
      console.error('getPaymentHistory', e.message)
      throw e
    } finally {
      Loading.hide()
    }
  },
}

let $router
export default boot(({ app, router, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = $api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  $router = router

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('/service-worker.js')
  // }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('서비스 워커 등록 성공:', registration)
      })
      .catch(function (error) {
        console.log('서비스 워커 등록 실패:', error)
      })
  }
})

export { $api }

WebSocket.prototype.sendCommand = function (command, options) {
  try {
    let data = {
      command,
      options,
    }
    // this.send(JSON.stringify(data))
    if (command != 'pong')
      console.log('-> sendCommand', command, options)
    this.send(JSON.stringify(data))
    // this.send(encode(data))
  } catch (e) {
    console.error('sendCommand Error : ', e)
  }
}
