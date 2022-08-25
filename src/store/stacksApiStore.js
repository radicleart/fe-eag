
import axios from 'axios'
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'
import {
  uintCV,
  serializeCV,
  deserializeCV,
  cvToJSON,
  tupleCV,
  standardPrincipalCV
} from '@stacks/transactions'
import { DateTime } from 'luxon'

const setNftTupleKeys = function (events, stxAddress) {
  let mapped = []
  mapped = events.map(function (event) {
    const ep = utils.tokenIdOwnerFromRpr(event.value)
    return {
      asset_identifier: event.asset_identifier,
      recipient: event.recipient || stxAddress,
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

const setNftHistory = function (events, nftIndex, stxAddress) {
  let mapped = []
  mapped = events.map(function (event) {
    return {
      asset_identifier: event.asset_identifier,
      recipient: event.recipient,
      event_index: event.event_index,
      tx_id: event.tx_id,
      nftIndex: nftIndex,
      // owner: stxAddress,
      sender: event.sender,
      asset_event_type: event.asset_event_type
    }
  })
  return mapped
}

const getSerialisedNftTuple = function (data) {
  const tupCV = tupleCV({
    'token-id': uintCV(data.nftIndex),
    owner: standardPrincipalCV(data.stxAddress)
  })
  return `0x${serializeCV(tupCV).toString('hex')}`
}

const stacksApiStore = {
  namespaced: true,
  state: {
    currentCollection: null,
    gaiaAsset: null,
    mintEvents: null,
    nftEvents: null,
    myHoldings: null,
    loopRuns: [],
    loopRun: null
  },
  getters: {
    getMintEvents: (state) => {
      return state.mintEvents
    },
    getLoopRun: (state) => {
      return state.loopRun
    },
    getLoopRuns: (state) => {
      return state.loopRuns
    },
    getMyHoldings: (state) => {
      return state.myHoldings
    },
    getMyHoldingsForContract: (state) => contractId => {
      return state.myHoldings?.filter((o) => o.contractId === contractId)
    },
    getCurrentCollection: (state) => {
      return state.currentCollection
    },
    getGaiaAsset: (state) => nftIndex => {
      return state.gaiaAsset // .find((a) => a.contractAsset.nftIndex === nftIndex)
    },
    getMintEventsForToken: (state) => nftIndex => {
      if (!state.mintEvents) return
      return state.mintEvents.filter((o) => o.nftIndex === nftIndex)
    },
    getNftEventsForToken: (state) => nftIndex => {
      if (!state.nftEvents) return
      return state.nftEvents.filter((o) => o.nftIndex === nftIndex)
    }
  },
  mutations: {
    setLoopRuns (state, loopRuns) {
      state.loopRuns = loopRuns
    },
    setLoopRun (state, loopRun) {
      state.loopRun = loopRun
    },
    setMintEvents (state, data) {
      state.mintEvents = data
    },
    setNftEvents (state, data) {
      state.nftEvents = data
    },
    setMyHoldings (state, data) {
      state.myHoldings = data
    },
    addResult (state, result) {
      state.result = result
    },
    setCurrentCollection (state, currentCollection) {
      state.currentCollection = currentCollection
    },
    setGaiaAssets (state, gaiaAssets) {
      state.gaiaAssets = gaiaAssets
    },
    setGaiaAsset (state, gaiaAsset) {
      state.gaiaAsset = gaiaAsset
    }
  },
  actions: {
    fetchLoopRun ({ state, dispatch, rootGetters, commit }, currentRunKey) {
      return new Promise(resolve => {
        const loopRun = state.loopRuns.find((o) => o.currentRunKey === currentRunKey)
        if (loopRun) {
          commit('setLoopRun', loopRun)
          resolve(loopRun)
          return
        }
        const profile = rootGetters['stacksAuthStore/getMyProfile']
        if (profile.loggedIn) {
          dispatch('fetchLatestLoopRunForStxAddress', { currentRunKey: currentRunKey, stxAddress: profile.stxAddress }).then((loopRun) => {
            commit('setLoopRun', loopRun)
            resolve(loopRun)
          })
        } else {
          dispatch('fetchLatestLoopRunForAnon', { currentRunKey: currentRunKey, stxAddress: null }).then((loopRun) => {
            commit('setLoopRun', loopRun)
            resolve(loopRun)
          })
        }
      })
    },
    fetchLatestLoopRunForStxAddress ({ state, commit }, data) {
      return new Promise(resolve => {
        const loopRun = state.loopRuns.find((o) => o.currentRunKey === data.currentRunKey)
        if (loopRun) {
          resolve(loopRun)
          return
        }
        let url = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/lastLoopRun/' + data.currentRunKey
        const dt = DateTime.local()
        url += '/' + data.stxAddress + '/' + dt.ordinal + '/' + dt.year
        axios.get(url).then((response) => {
          const loopRun = response.data.loopRun
          loopRun.spinsToday = response.data.loopSpinsToday
          commit('setLoopRun', loopRun)
          resolve(loopRun)
        }).catch(() => {
          resolve(null)
        })
      })
    },
    fetchLatestLoopRunForAnon ({ state, commit }, data) {
      return new Promise(resolve => {
        const loopRun = state.loopRuns.find((o) => o.currentRunKey === data.currentRunKey)
        if (loopRun) {
          resolve(loopRun)
          return
        }
        const url = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/lastLoopRun/' + data.currentRunKey
        axios.get(url).then((response) => {
          commit('setLoopRun', response.data.loopRun)
          resolve(response.data.loopRun)
        }).catch(() => {
          resolve(null)
        })
      })
    },
    fetchLoopRuns ({ state, commit }) {
      return new Promise(resolve => {
        if (state.loopRuns && state.loopRuns.length > 0) {
          resolve(state.loopRuns)
          return
        }
        axios.get(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/loopRuns').then((response) => {
          commit('setLoopRuns', response.data)
          resolve(response.data)
        }).catch(() => {
          resolve(null)
        })
      })
    },
    fetchLoopRunByContractId ({ state, commit, rootGetters }, contractId) {
      return new Promise(resolve => {
        const loopRun = state.loopRuns.find((o) => o.contractId === contractId)
        if (loopRun) {
          resolve(loopRun)
          return
        }
        axios.get(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/loopRuns/' + contractId).then((response) => {
          const loopRuns = response.data
          if (loopRuns && loopRuns.length > 0) {
            resolve(loopRuns[0])
          }
          resolve(null)
        }).catch(() => {
          resolve(null)
        })
      })
    },
    initSingleAsset ({ dispatch, commit }, data) {
      return new Promise((resolve) => {
        dispatch('fetchLoopRunByContractId', data.contractId).then((currentCollection) => {
          commit('setCurrentCollection', currentCollection)
          const asset = {
            contractAsset: {
              contractId: currentCollection.contractId,
              nftIndex: data.nftIndex,
              tokenInfo: { metaDataUrl: currentCollection.punkImageIPFSUrl.replace(/\{id\}/, data.nftIndex) }
            }
          }
          dispatch('fetchMetaData', asset).then((gaiaAsset) => {
            gaiaAsset.contractAsset = asset.contractAsset
            data.asset_identifier = data.contractId + '::' + currentCollection.assetName
            dispatch('fetchNftTokenHistory', data).then((result) => {
              commit('setGaiaAsset', gaiaAsset)
              data.unanchored = true
              dispatch('fetchTotalSupply', data).then((val) => {
                gaiaAsset.totalSupply = val
                if (data.stxAddress) {
                  dispatch('fetchBalance', data).then((val) => {
                    gaiaAsset.balance = val
                    if (val > 0) gaiaAsset.contractAsset.owner = data.stxAddress
                    commit('setGaiaAsset', gaiaAsset)
                    resolve(gaiaAsset)
                  })
                } else {
                  commit('setGaiaAsset', gaiaAsset)
                  resolve(gaiaAsset)
                }
              })
            })
          })
        })
      })
    },
    initAssetDetails ({ dispatch, commit }, data) {
      return new Promise((resolve) => {
        dispatch('fetchLoopRunByContractId', data.contractId).then((currentCollection) => {
          commit('setCurrentCollection', currentCollection)
          const gaiaAssets = []
          const ipfsUrl = currentCollection.punkImageIPFSUrl
          for (let i = 1; i <= currentCollection.versionLimit; i++) {
            const asset = {
              contractAsset: {
                contractId: currentCollection.contractId,
                nftIndex: i,
                tokenInfo: { metaDataUrl: ipfsUrl.replace(/\{id\}/, i) }
              }
            }
            gaiaAssets.push(asset)
          }
          commit('setGaiaAssets', gaiaAssets)
          const initAsset = (data.nftIndex) ? gaiaAssets[data.nftIndex - 1] : gaiaAssets[0]
          dispatch('fetchMetaData', initAsset).then(() => {
            // this.tokenCount = currentCollection.versionLimit
            dispatch('fetchTokensByContractId', { contractId: data.contractId, page: 0, pageSize: 200 }).then((results) => {
              if (results && results.gaiaAssets) {
                results.gaiaAssets.forEach((a) => {
                  // const asset = gaiaAssets.find((ass) => ass.contractAsset.nftIndex === a.contractAddress.nftIndex)
                  gaiaAssets[a.contractAsset.nftIndex - 1] = a
                })
              }
              commit('setGaiaAssets', gaiaAssets)
              data.asset_identifier = data.contractId + '::' + currentCollection.assetName
              data.unanchored = true
              dispatch('fetchMintEvents', data).then((mintEvents) => {
                commit('setMintEvents', mintEvents)
                if (data.nftIndex) {
                  dispatch('fetchTotalSupply', data).then(() => {
                    resolve(true)
                  })
                }
              })
            })
          })
        })
      })
    },
    fetchTokenByContractIdAndNftIndex ({ dispatch, commit }, data) {
      return new Promise((resolve, reject) => {
        const uri = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/token-by-index/' + data.contractId + '/' + data.nftIndex
        axios.get(uri).then((response) => {
          dispatch('sipTenTokenFindBy').then((sipTenTokens) => {
            const gaiaAsset = utils.resolvePrincipalsGaiaToken(process.env.VUE_APP_NETWORK, response.data, sipTenTokens)
            commit('setGaiaAsset', gaiaAsset)
            resolve(gaiaAsset)
          })
        }).catch((error) => {
          reject(error)
        })
      })
    },
    fetchTokensByContractId ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        let uri = process.env.VUE_APP_RISIDIO_API
        uri += '/mesh/v2/tokens'
        uri += '/' + data.contractId
        uri += '/' + data.page
        uri += '/' + data.pageSize
        if (data.query) uri += data.query
        axios.get(uri).then((response) => {
          dispatch('sipTenTokenFindBy').then((sipTenTokens) => {
            const gaiaAssets = utils.resolvePrincipalsGaiaTokens(process.env.VUE_APP_NETWORK, response.data.tokens, sipTenTokens)
            const result = {
              gaiaAssets: gaiaAssets,
              tokenCount: response.data.tokenCount
            }
            resolve(result)
          })
        }).catch((error) => {
          reject(error)
        })
      })
    },
    sipTenTokenFindBy: function ({ commit }, data) {
      return new Promise(function (resolve) {
        let path = '/mesh/v2/sip-ten-tokens'
        if (data) {
          if (data.field === 'name') {
            path = '/mesh/v2/sip-ten-token-by-name/' + data.value
          } else if (data.field === 'symbol') {
            path = '/mesh/v2/sip-ten-token-by-symbol/' + data.value
          } else if (data.field === 'contractId') {
            path = '/mesh/v2/sip-ten-token-by-contract/' + data.value
          }
        }
        axios.get(process.env.VUE_APP_RISIDIO_API + path).then((response) => {
          // commit('setSipTenTokens', response.data)
          resolve(response.data)
        }).catch(() => {
          resolve()
        })
      })
    },
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
        dispatch('callApiDirect', txOptions).then((result) => {
          resolve(result)
        })
      })
    },
    fetchNftTokenHistory ({ dispatch, commit }, data) {
      return new Promise((resolve) => {
        let path = '/extended/v1/tokens/nft/history?asset_identifier=' + data.asset_identifier
        path += '&value=' + getSerialisedNftTuple(data)
        if (data.limit) path += '&limit=' + data.limit
        if (data.offset) path += '&offset=' + data.offset
        if (data.unanchored) path += '&unanchored=' + data.unanchored
        if (data.tx_metadata) path += '&tx_metadata=' + data.tx_metadata
        const txOptions = {
          path: path,
          httpMethod: 'GET',
          postData: {
            arguments: [],
            sender: null
          }
        }
        dispatch('stacksApiStore/callApiDirect', txOptions, { root: true }).then((result) => {
          if (result.results && result.results.length > 0) {
            const nftEvents = setNftHistory(result.results, data.nftIndex, data.stxAddress)
            commit('setNftEvents', nftEvents)
            resolve(nftEvents)
          } else {
            resolve([])
          }
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
        dispatch('stacksApiStore/callApiDirect', txOptions, { root: true }).then((result) => {
          if (result.results && result.results.length > 0) {
            const mintEvents = setNftTupleKeys(result.results)
            // commit('setMintEvents', mintEvents)
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
                commit('setMintEvents', events)
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
        dispatch('callApiDirect', txOptions).then((result) => {
          resolve(result.results)
        }).catch(() => {
          resolve()
        })
      })
    },
    fetchMyHoldings ({ state, dispatch, commit }, data) {
      return new Promise((resolve) => {
        // if (state.myHoldings && state.myHoldings.length > 0) return state.myHoldings
        let path = '/extended/v1/tokens/nft/holdings?principal=' + data.stxAddress
        if (data.contractId) path += '&asset_identifiers=' + data.contractId + '::' + data.assetName
        if (data.tx_metadata) path += '&tx_metadata=' + data.tx_metadata
        if (data.offset) path += '&offset=' + data.offset
        if (data.limit) path += '&limit=' + data.limit
        const txOptions = {
          path: path,
          httpMethod: 'GET',
          postData: {
            arguments: [],
            sender: null // this.profile.stxAddress
          }
        }
        dispatch('callApiDirect', txOptions).then((result) => {
          const mintEvents = setNftTupleKeys(result.results, data.stxAddress)
          const events = []
          resolve({ gaiaAssets: mintEvents, tokenCount: result.total })
          mintEvents.forEach((event) => {
            dispatch('fetchLoopRunByContractId', event.asset_identifier.split('::')[0]).then((currentCollection) => {
              const asset = {
                contractAsset: {
                  contractId: event.asset_identifier.split('::')[0],
                  nftIndex: event.nftIndex,
                  tokenInfo: { metaDataUrl: currentCollection.punkImageIPFSUrl.replace(/\{id\}/, event.nftIndex) }
                }
              }
              dispatch('fetchMetaData', asset).then((metaData) => {
                event.image = metaData.image
                event.properties = metaData.properties
                event.name = metaData.name
                event.balance = result
                event.contractAsset = asset.contractAsset
                event.contractAsset.owner = event.owner
                if (event.owner) {
                  dispatch('fetchBalance', { contractId: event.asset_identifier.split('::')[0], stxAddress: event.owner, nftIndex: event.nftIndex }).then((result) => {
                    event.balance = result
                    events.push(event)
                    commit('setMyHoldings', events)
                  })
                } else {
                  events.push(event)
                  commit('setMyHoldings', events)
                }
              })
            })
          })
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
        dispatch('callContractReadOnly', txOptions).then((result) => {
          try {
            if (result.value) resolve(Number(result.value.value))
            else resolve(Number(result.result.value.value))
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
        dispatch('callApiDirect', txOptions).then((result) => {
          resolve(result)
        }).catch(() => {
          resolve()
        })
      })
    },
    fetchTotalSupply ({ state, dispatch }, data) {
      return new Promise((resolve) => {
        const functionArgs = [`0x${serializeCV(uintCV(data.nftIndex)).toString('hex')}`]
        const txOptions = {
          contractAddress: data.contractId.split('.')[0],
          contractName: data.contractId.split('.')[1],
          functionName: 'get-total-supply',
          functionArgs: functionArgs
        }
        dispatch('callContractReadOnly', txOptions).then((result) => {
          try {
            const ga = state.gaiaAssets.find((a) => a.contractAsset.nftIndex === data.nftIndex)
            if (ga) ga.totalSupply = Number(result.result.value.value)
            // commit('setGaiaAssets', gaiaAssets)
            resolve(Number(result.result.value.value))
          } catch (e) {
            resolve(0)
          }
        })
      })
    },
    fetchMetaData ({ state, rootGetters }, asset) {
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
          if (state.gaiaAssets) state.gaiaAssets.find((a) => a.contractAsset.nftIndex === asset.contractAsset.nftIndex).image = metaData.image
          resolve(metaData)
        }).catch(() => {
          const md = { image: rootGetters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](asset) }
          resolve(md)
        })
      })
    },
    callApiDirect ({ commit }, txOptions) {
      return new Promise((resolve, reject) => {
        const url = process.env.VUE_APP_STACKS_API + txOptions.path
        if (txOptions.httpMethod === 'GET') {
          axios.get(url).then(response => {
            const result = response.data
            commit('addResult', result)
            resolve(result)
          }).catch((error) => {
            reject(error)
          })
        } else {
          axios.post(url, txOptions).then(response => {
            const result = response.data
            resolve(result)
          }).catch((error) => {
            reject(error)
          })
        }
      })
    },
    callApi ({ rootGetters }, txOptions) {
      return new Promise((resolve, reject) => {
        axios.post(process.env.VUE_APP_RISIDIO_API + '/mesh' + '/v2/accounts', txOptions).then(response => {
          // const result = utils.jsonFromTxResult(response.data)
          resolve(response.data)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    callContractReadOnly ({ rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const path = '/v2/contracts/call-read/' + data.contractAddress + '/' + data.contractName + '/' + data.functionName
        const txOptions = {
          path: path,
          httpMethod: 'POST',
          postData: {
            arguments: (data.functionArgs) ? data.functionArgs : [],
            sender: data.contractAddress
          }
        }
        const headers = {
          'Content-Type': 'application/json'
        }
        axios.post(process.env.VUE_APP_RISIDIO_API + '/mesh' + '/v2/accounts', txOptions).then(response => {
          // data.result = utils.jsonFromTxResult(response.data.result)
          const result = cvToJSON(deserializeCV(response.data.result))
          resolve(result)
        }).catch(() => {
          const profile = rootGetters['stacksAuthStore/getMyProfile']
          const txOptions = {
            sender: profile.stxAddress, // data.contractAddress
            arguments: (data.functionArgs) ? data.functionArgs : []
          }
          axios.post(process.env.VUE_APP_STACKS_API + path, txOptions, { headers: headers }).then(response => {
            // data.result = utils.jsonFromTxResult(response.data.result)
            if (!response.data.okay) {
              resolve()
            } else {
              const result = cvToJSON(deserializeCV(response.data.result))
              resolve(result)
            }
          }).catch((error) => {
            reject(error)
          })
        })
      })
    }
  }
}
export default stacksApiStore
