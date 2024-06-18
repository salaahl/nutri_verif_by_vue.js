import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    aboutMe: true,
    bgColor: 'rgb(255, 255, 255, 1)'
  }),
  actions: {
    showAboutMe(boolean: boolean) {
      this.aboutMe = boolean
    },
    updateBgColor(color: string) {
      this.bgColor = color
    }
  },
  getters: {
    getAboutMe(state) {
      return state.aboutMe
    },
    getBgColor(state) {
      return state.bgColor
    }
  }
})
