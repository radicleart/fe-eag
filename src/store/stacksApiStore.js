
import axios from 'axios'
import { APP_CONSTANTS } from '@/app-constants'

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
    },
    fetchMetaData ({ dispatch, rootGetters }, asset) {
      return new Promise((resolve) => {
        const data = {
          tokenUri: asset.contractAsset.tokenInfo.metaDataUrl
        }
        const HTTPS_HASHONE_MYPINATA_CLOUD_IPFS = 'https://hashone.mypinata.cloud/ipfs/'
        const uri = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/meta-data-json'
        axios.post(uri, data).then(response => {
          const metaData = response.data
          if (metaData.image.startsWith('ipfs://')) {
            metaData.image = metaData.image.replace('ipfs://', HTTPS_HASHONE_MYPINATA_CLOUD_IPFS)
          } else {
            metaData.image = rootGetters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](metaData)
          }
          if (metaData.properties && metaData.properties.full_size_image && metaData.properties.full_size_image.startsWith('ipfs://')) {
            metaData.properties.full_size_image = metaData.properties.full_size_image.replace('ipfs://', HTTPS_HASHONE_MYPINATA_CLOUD_IPFS)
          }
          resolve(metaData)
        }).catch(() => {
          const md = { image: rootGetters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](asset) }
          resolve(md)
        })
      })
    }
  }
}
export default stacksApiStore
