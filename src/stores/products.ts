import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    input: '',
    page: 1,
    pages: 1
  }),
  actions: {
    updateProducts(payload: any) {
      this.products = payload
    },
    updateInput(payload: string) {
      this.input = payload
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
    getInput(state) {
      return state.input
    },
    getPage(state) {
      return state.page
    },
    getPages(state) {
      return state.pages
    }
  }
})
