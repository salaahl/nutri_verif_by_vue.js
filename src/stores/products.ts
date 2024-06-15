import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    product: {},
    page: 1,
    pages: 1
  }),
  actions: {
    updateProducts(payload: any) {
      this.products = payload
    },
    updateProduct(payload: any) {
      this.product = payload
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
    getProduct(state) {
      return state.product
    },
    getPage(state) {
      return state.page
    },
    getPages(state) {
      return state.pages
    }
  }
})
