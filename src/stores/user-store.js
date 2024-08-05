import { defineStore } from 'pinia'
import { $api } from 'boot/axios'
import { LocalStorage } from 'quasar'

export const useUserStore = defineStore('user', {
  state: () => {
    // 처음 부팅할 때 LocalStorage에 있는 토큰 정보로 가져와서 세팅하는 부분
    const loginData = LocalStorage.getItem('cm_loginData')
    if (loginData != null) {
      $api.setAuth(loginData.token)
    }
    return {
      loginData: loginData,
    }
  },
  getters: {
    // doubleCount: (state) => state.counter * 2,
    photo: (state) => {
      if (state.loginData == null) return null
      return state.loginData.photo
    },
    name: (state) => {
      if (state.loginData == null) return null
      return state.loginData.name
    },
    nickname: (state) => {
      if (state.loginData == null) return null
      return state.loginData.nickname
    },
    token: (state) => {
      if (state.loginData == null) return null
      return state.loginData.token
    },
    role: (state) => {
      if (state.loginData == null) return null
      return state.loginData.role
    },
    user_id: (state) => {
      if (state.loginData == null) return null
      return state.loginData.user_id
    },
    isLoggedIn(state) {
      console.log('isLoggedIn')
      if (state.loginData != null) return true
      return false
    },
    is_admin(state) {
      if (state.loginData == null || state.loginData.role !== 'admin') return false
      return true
    }
  },
  actions: {
    logout() {
      this.setLoginData(null)
    },
    setLoginData(data) {
      this.loginData = data
      if (data != null) {
        $api.setAuth(data.token)
        LocalStorage.set('cm_loginData', data)
      }
      else {
        LocalStorage.remove('cm_loginData')
      }
    },
    setNickname(nickname) {
      if (this.loginData != null) {
        this.loginData.nickname = nickname
      }
    },
    setRole(role) {
      if (this.loginData != null) {
        this.loginData.role = role
      }
    },
    setPlan(plan) {
      if (this.loginData != null) {
        this.loginData.plan = plan
      }
    },
    setPreviewLevel(preview_level) {
      if (this.loginData != null) {
        this.loginData.preview_level = preview_level
      }
    },
    setLimit(limit) {
      if (this.loginData != null) {
        this.loginData.limit = limit
      }
    },
    updateLoginData(key, value) {
      if (this.loginData != null) {
        this.loginData[key] = value
      }
    }
  },
})
