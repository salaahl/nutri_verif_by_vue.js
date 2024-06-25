import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    aboutMe: true
  }),
  actions: {
    setAboutMeStatus(boolean: boolean) {
      this.aboutMe = boolean
    }
  },
  getters: {
    getAboutMeStatus(state) {
      return state.aboutMe
    }
  }
})
