
const stacksApiStore = {
  namespaced: true,
  state: {
  },
  getters: {
    getDisplayCard: (state) => {
      return state.displayCard
    }
  },
  mutations: {
    setConfiguration (state, data) {
      state.configuration = data
    }
  },
  actions: {
    fetchMempoolTxsByAddress ({ dispatch }, data) {
      return new Promise((resolve) => {
        const path = '/extended/v1/tx/mempool?sender_address=' + data.stxAddress
        const txOptions = {
          path: path,
          httpMethod: 'GET',
          postData: {
            arguments: [],
            sender: null // this.profile.stxAddress
          }
        }
        dispatch('rpayStacksStore/callApi', txOptions, { root: true }).then((result) => {
          resolve(result)
        })
      })
    },
    fetchMintEvents ({ dispatch }, data) {
      return new Promise((resolve) => {
        let path = '/extended/v1/tokens/nft/mints?asset_identifier=' + data.asset_identifier
        if (data.limit) path += '&limit=' + data.limit
        if (data.offset) path += '&offset=' + data.offset
        if (data.unanchored) path += '&unanchored=' + data.unanchored
        if (data.tx_metadata) path += '&tx_metadata=' + data.tx_metadata
        const txOptions = {
          path: path,
          httpMethod: 'GET',
          postData: {
            arguments: [],
            sender: null // this.profile.stxAddress
          }
        }
        dispatch('rpayStacksStore/callApi', txOptions, { root: true }).then((result) => {
          resolve(result)
        })
      })
    }
  }
}
export default stacksApiStore
