import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    page: 1,
    pages: 1
  }),
  actions: {
    updateProducts(payload) {
      this.products = payload
    },
    incrementPage() {
      this.page++
    },
    decrementPage() {
      this.page--
    },
    updatePage(payload) {
      this.page = payload
    },
    updatePages(payload) {
      this.pages = payload
    }
  },
  getters: {
    getProducts(state) {
      return state.products
    },
    getPage(state) {
      return state.page
    },
    getPages(state) {
      return state.pages
    }
  }
})
