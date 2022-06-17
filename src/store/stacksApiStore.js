
import axios from 'axios'
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'
import {
  uintCV,
  serializeCV,
  standardPrincipalCV
} from '@stacks/transactions'

const setNftTupleKeys = function (events) {
  let mapped = []
  mapped = events.map(function (event) {
    const ep = utils.tokenIdOwnerFromRpr(event.value)
    return {
      recipient: event.recipient,
      event_index: event.event_index,
      tx_id: event.tx_id,
      nftIndex: ep.nftIndex,
      owner: ep.owner,
      sender: 'eag',
      asset_event_type: 'mint'
    }
  })
  return mapped
}

const stacksApiStore = {
  namespaced: true,
  state: {
    mintEvents: null
  },
  getters: {
    getMintEvents: (state) => {
      return state.mintEvents
    },
    getMintEventsForToken: (state) => nftIndex => {
      if (!state.mintEvents) return
      return state.mintEvents.filter((o) => o.nftIndex === nftIndex)
    }
  },
  mutations: {
    saveMintEvents (state, data) {
      state.mintEvents = data
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
    fetchMintEvents ({ commit, dispatch }, data) {
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
          if (result.results && result.results.length > 0) {
            const mintEvents = setNftTupleKeys(result.results)
            // commit('saveMintEvents', mintEvents)
            const events = []
            const fbData = {
              contractId: data.contractId
            }
            resolve(mintEvents)
            mintEvents.forEach((event) => {
              fbData.stxAddress = event.owner
              fbData.nftIndex = event.nftIndex
              dispatch('fetchBalance', fbData).then((result) => {
                event.balance = result
                events.push(event)
                commit('saveMintEvents', events)
              })
            })
          } else {
            resolve([])
          }
        })
      })
    },
    fetchMempoolTransactions ({ dispatch }, data) {
      return new Promise((resolve) => {
        const path = '/extended/v1/tx/mempool?sender_address=' + data.sender_address
        // if (data.unanchored) path += '&unanchored=' + data.unanchored
        const txOptions = {
          path: path,
          httpMethod: 'GET',
          postData: {
            arguments: [],
            sender: null // this.profile.stxAddress
          }
        }
        dispatch('rpayStacksStore/callApi', txOptions, { root: true }).then((result) => {
          resolve(result.results)
        }).catch(() => {
          resolve()
        })
      })
    },
    fetchBalance ({ dispatch }, data) {
      return new Promise((resolve) => {
        if (!data.nftIndex || !data.stxAddress) return
        const functionArgs = [`0x${serializeCV(uintCV(data.nftIndex)).toString('hex')}`, `0x${serializeCV(standardPrincipalCV(data.stxAddress)).toString('hex')}`]
        const txOptions = {
          contractAddress: data.contractId.split('.')[0],
          contractName: data.contractId.split('.')[1],
          functionName: 'get-balance',
          functionArgs: functionArgs
        }
        dispatch('rpayStacksStore/callContractReadOnly', txOptions, { root: true }).then((result) => {
          try {
            resolve(Number(result.result.value.value))
          } catch (e) {
            resolve(0)
          }
        })
      })
    },
    fetchTransaction ({ dispatch }, data) {
      return new Promise((resolve) => {
        const path = '/extended/v1/tx/' + data.txId
        // if (data.unanchored) path += '&unanchored=' + data.unanchored
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
        }).catch(() => {
          resolve()
        })
      })
    },
    fetchTotalSupply ({ dispatch }, data) {
      return new Promise((resolve) => {
        const functionArgs = [`0x${serializeCV(uintCV(data.nftIndex)).toString('hex')}`]
        const txOptions = {
          contractAddress: data.contractId.split('.')[0],
          contractName: data.contractId.split('.')[1],
          functionName: 'get-total-supply',
          functionArgs: functionArgs
        }
        dispatch('rpayStacksStore/callContractReadOnly', txOptions, { root: true }).then((result) => {
          try {
            resolve(Number(result.result.value.value))
          } catch (e) {
            resolve(0)
          }
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
