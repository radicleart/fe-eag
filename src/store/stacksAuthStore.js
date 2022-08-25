/**
 * The auth store represents the state of the (session scoped) user in the Vue
 * application. This includes logged in state, profile and other state pertaining
 * directly to the user.
 */
import { AppConfig, UserSession, authenticate, showConnect } from '@stacks/connect'
import { AccountsApi, Configuration } from '@stacks/blockchain-api-client'
import axios from 'axios'
import utils from '@/services/utils'

const setupAccountApi = function (commit, stacksApi) {
  const apiConfig = new Configuration({
    fetchApi: fetch,
    // for mainnet, replace `testnet` with `mainnet`
    basePath: stacksApi
  })
  const accountApi = new AccountsApi(apiConfig)
  commit('setAccountApi', accountApi)
}

const network = process.env.VUE_APP_NETWORK
const origin = window.location.origin
const defDetails = {
  name: 'Clarity Smart Contracts for #Bitcoin',
  icon: origin + '/img/logo.png'
}

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })
// const storage = new Storage({ userSession })

const defAuthHeaders = function (profile) {
  // let publicKey = null
  let token = 'v1:no-token' // note: not all requests require auth token - e.g. getPaymentAddress
  if (userSession.isUserSignedIn()) {
    const account = userSession.loadUserData()
    if (account) {
      token = 'v1:' + profile.stxAddress
    }
  }
  const headers = {
    headers: {
      STX_ADDRESS: profile.stxAddress,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  }
  return headers
}

const BLOCKSTACK_LOGIN = Number(process.env.VUE_APP_BLOCKSTACK_LOGIN)

const getProfile = function (network) {
  let myProfile = {}
  myProfile.authorisation = {}
  try {
    const account = userSession.loadUserData()
    if (account) {
      const uname = account.username
      let name = account.profile.name
      if (uname && !name) {
        name = uname.substring(0, uname.indexOf('.'))
      }
      const stxAddress = (network === 'mainnet') ? account.profile.stxAddress.mainnet : account.profile.stxAddress.testnet
      myProfile = {
        gaiaHubConfig: account.gaiaHubConfig,
        identityAddress: account.identityAddress,
        hubUrl: account.hubUrl,
        loggedIn: true,
        stxAddress: stxAddress,
        name: name,
        description: account.profile.description,
        avatarUrl: account.profile.avatarUrl,
        username: account.username || stxAddress
      }
    }
    return myProfile
  } catch (err) {
    return myProfile
  }
}

const stacksAuthStore = {
  namespaced: true,
  state: {
    myProfile: {
      username: null,
      loggedIn: false,
      userData: null,
      authResponse: null,
      appPrivateKey: null
    },
    accountApi: null,
    accountInfo: null,
    bnsNames: null,
    authHeaders: null,
    accounts: [],
    webWalletNeeded: false
  },
  getters: {
    getWebWalletNeeded: state => {
      return state.webWalletNeeded
    },
    getMyProfile: state => {
      if (!state.myProfile) {
        return {
          loggedIn: false
        }
      }
      return state.myProfile
    },
    getAuthHeaders: state => {
      return (state.authHeaders) ? state.authHeaders : { headers: {} }
    },
    getAccountInfo: state => {
      return state.accountInfo
    },
    getBnsNames: state => {
      return state.bnsNames
    },
    getAccounts: state => {
      return state.accounts
    }
  },
  mutations: {
    setWebWalletNeeded (state) {
      state.webWalletNeeded = true
    },
    myProfile (state, myProfile) {
      state.myProfile = myProfile
    },
    accountInfo (state, accountInfo) {
      state.accountInfo = accountInfo
    },
    setAuthHeaders (state, authHeaders) {
      state.authHeaders = authHeaders
    },
    setAccountApi (state, accountApi) {
      state.accountApi = accountApi
    },
    setAuthResponse (state, session) {
      state.session = session
    },
    setAccountInfo (state, accountInfo) {
      state.accountInfo = accountInfo
    },
    setBnsNames (state, bnsNames) {
      state.bnsNames = bnsNames
    }
  },
  actions: {
    fetchBnsNames ({ commit }, stxAddresses) {
      return new Promise((resolve, reject) => {
        const path = process.env.VUE_APP_CLARITYLAB_API + '/mesh/v2/nft-events/bns'
        axios.post(path, stxAddresses).then((response) => {
          const bnsNames = response.data
          commit('setBnsNames', bnsNames)
          resolve(bnsNames)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    fetchUserAuthorisation ({ commit }, data) {
      return new Promise((resolve, reject) => {
        const authHeaders = defAuthHeaders()
        axios.get(process.env.VUE_APP_CLARITYLAB_API + '/mesh/v2/auth/getAuthorisation/' + data.stxAddress, authHeaders).then((result) => {
          commit('setAuthorisation', result.data)
          resolve(result.data)
        }).catch((error) => {
          reject(new Error('Unable index record: ' + error))
        })
      })
    },
    fetchMyNonces ({ commit }) {
      return new Promise(resolve => {
        const profile = getProfile(network)
        const url = process.env.VUE_APP_STACKS_API_EXTENDED + '/extended/v1/address/' + profile.stxAddress + '/nonces'
        axios.get(url).then((response) => {
          profile.nonces = response.data
          commit('myProfile', profile)
          resolve(profile)
        }).catch(() => {
          resolve()
        })
      })
    },
    fetchMyAccount ({ state, commit, dispatch }) {
      return new Promise(resolve => {
        if (!state.accountApi) {
          setupAccountApi(commit, process.env.VUE_APP_STACKS_API)
        }
        if (userSession.isUserSignedIn()) {
          const profile = getProfile(network)
          commit('myProfile', profile)
          dispatch('stacksAuthStore/fetchAccountInfo', { stxAddress: profile.stxAddress, force: true }, { root: true })
          resolve(profile)
        } else if (userSession.isSignInPending()) {
          userSession.handlePendingSignIn().then(() => {
            const profile = getProfile(network)
            commit('myProfile', profile)
            dispatch('stacksAuthStore/fetchAccountInfo', { stxAddress: profile.stxAddress, force: true }, { root: true })
            resolve(profile)
          })
        } else {
          const profile = getProfile(network)
          commit('myProfile', profile)
          resolve(profile)
        }
      })
    },
    startLogin ({ state, dispatch, commit }) {
      return new Promise((resolve, reject) => {
        const authOptions = {
          sendToSignIn: false,
          userSession: userSession,
          redirectTo: '/create',
          manifestPath: '/manifest.json',
          onFinish: ({ userSession }) => {
            state.userData = userSession.loadUserData()
            const profile = getProfile(network)
            commit('myProfile', profile)
            dispatch('stacksAuthStore/fetchAccountInfo', { stxAddress: profile.stxAddress, force: true }, { root: true })
            resolve(profile)
          },
          appDetails: defDetails
        }
        try {
          if (BLOCKSTACK_LOGIN === 1) {
            showConnect(authOptions).catch((err) => {
              reject(err)
            })
          } else {
            authenticate(authOptions).catch((err) => {
              reject(err)
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    },
    fetchNoncesFor ({ commit }, stxAddress) {
      return new Promise(resolve => {
        const url = process.env.VUE_APP_STACKS_API_EXTENDED + '/extended/v1/address/' + stxAddress + '/nonces'
        axios.get(url).then((response) => {
          commit('setNonce', response.data)
          resolve(response.data)
        }).catch(() => {
          resolve()
        })
      })
    },
    startLogout ({ state, commit }) {
      return new Promise((resolve) => {
        if (userSession.isUserSignedIn()) {
          userSession.signUserOut()
          state.userData = null
          commit('myProfile', getProfile(network))
          commit('setAuthHeaders', null)
        }
        resolve(getProfile(network))
      })
    },
    fetchAccountInfo ({ state, commit }, data) {
      return new Promise((resolve) => {
        if (!data || !data.stxAddress || !state.accountApi) {
          resolve()
          return
        }
        state.accountApi.getAccountInfo({ principal: data.stxAddress }).then((accountInfo) => {
          if (accountInfo) accountInfo.balance = utils.fromMicroAmount(accountInfo.balance)
          commit('setAccountInfo', accountInfo)
          resolve(accountInfo)
        }).catch(() => {
          const callData = {
            path: '/v2/accounts/' + data.stxAddress,
            httpMethod: 'get',
            postData: null
          }
          if (process.env.VUE_APP_STACKS_API.indexOf('localhost') > -1) {
            const authHeaders = defAuthHeaders()
            const url = process.env.VUE_APP_CLARITYLAB_API + '/mesh/v2/accounts'
            axios.post(url, callData, authHeaders).then(response => {
              const accountInfo = response.data
              if (accountInfo) accountInfo.balance = utils.fromMicroAmount(accountInfo.balance)
              commit('setAccountInfo', accountInfo)
              resolve(accountInfo)
            }).catch(() => {
              resolve()
            })
          } else {
            const url = process.env.VUE_APP_STACKS_API_EXTENDED + '/extended/v1/address/' + data.stxAddress + '/balances'
            axios.get(url).then((response) => {
              const accountInfo = response.data
              if (accountInfo && accountInfo.stx) accountInfo.balance = utils.fromMicroAmount(accountInfo.stx.balance)
              commit('setAccountInfo', accountInfo)
              resolve(accountInfo)
            }).catch(() => {
              resolve()
            })
          }
        })
      })
    }
  }
}
export default stacksAuthStore
