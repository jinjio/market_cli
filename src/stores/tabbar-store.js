import { defineStore } from 'pinia'

export const useTabBarStore = defineStore('tabbar', {
  state: () => ({
    hidden: false,
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2,
    is_showing: (state) => !state.hidden,
  },
  actions: {
    show() {
      this.hidden = false
    },
    hide() {
      this.hidden = true
    },
  },
})
