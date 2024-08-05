import { defineStore } from 'pinia'

export const useNavBarStore = defineStore('navbar', {
  state: () => ({
    // title: '안키챔피언',
    hidden: false,
    target: null,
    right_bar_button: null
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2,
    showNavbar: (state) => !state.hidden,
  },
  actions: {
    setTitle(title) {
      this.title = title
      document.title = title
      // if (title?.length > 0) {
      //   this.hidden = false
      // }
    },
    setTarget(url) {
      this.target = url
    },
    show() {
      this.hidden = false
    },
    hide() {
      this.hidden = true
    },
  },
})
