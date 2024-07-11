import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    page: 1,
    pages: 0
  }),
  actions: {
    updateProducts(payload: any) {
      this.products = payload
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
