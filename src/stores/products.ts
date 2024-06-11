import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    page: 1,
    pages: 1
  }),
  actions: {
    updateProducts(payload: any) {
      this.products = payload
    },
    incrementPage() {
      this.page++
    },
    updatePage(payload: number) {
      this.page = payload
    },
    updatePages(payload: number) {
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
