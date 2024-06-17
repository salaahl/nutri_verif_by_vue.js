import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    aboutMe: true
  }),
  actions: {
    showAboutMe(boolean: boolean) {
      this.aboutMe = boolean
    }
  },
  getters: {
    getAboutMe(state) {
      return state.aboutMe
    }
  }
})
