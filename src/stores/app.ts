import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    aboutMe: true,
    searchInput: ''
  }),
  actions: {
    setAboutMeStatus(boolean: boolean) {
      this.aboutMe = boolean
    },
    setSearchInput(input: string) {
      this.searchInput = input
    }
  },
  getters: {
    getAboutMeStatus(state) {
      return state.aboutMe
    },
    getSearchInput(state) {
      return state.searchInput
    }
  }
})
