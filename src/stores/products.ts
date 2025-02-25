import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    input: '',
    filter: '',
    page: 1,
    pages: 1,
    ajrSelected: 'women'
  }),
  actions: {
    updateProducts(payload: any) {
      this.products = payload
    },
    updateInput(payload: string) {
      this.input = payload
    },
    updateFilter(payload: string) {
      this.filter = payload
    },
    updatePage(payload: number) {
      this.page = payload
    },
    updatePages(payload: number) {
      this.pages = payload
    },
    updateAjrSelected(payload: string) {
      this.ajrSelected = payload
    }
  },
  getters: {
    getProducts(state) {
      return state.products
    },
    getInput(state) {
      return state.input
    },
    getFilter(state) {
      return state.filter
    },
    getPage(state) {
      return state.page
    },
    getPages(state) {
      return state.pages
    },
    getAjrSelected(state) {
      return state.ajrSelected
    }
  }
})
