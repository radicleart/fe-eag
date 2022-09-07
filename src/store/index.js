import Vue from 'vue'
import Vuex from 'vuex'
import stacksAuthStore from './stacksAuthStore'
import storeUtils from './storeUtils'
import contentStore from './contentStore'
import merchantStore from './merchantStore'
import stacksApiStore from './stacksApiStore'
import stacksPurchaseStore from './stacksPurchaseStore'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    contentStore,
    merchantStore,
    stacksApiStore,
    stacksPurchaseStore,
    stacksAuthStore
  },
  state: {
    configuration: {}
  },
  getters: {
    getPixelBackground: state => {
      if (!state.content.homepage) return
      return state.content.homepage.pixelbackground.url
    },
    getWebWalletLinkChrome: state => {
      return state.chromeLink
    },
    getWebWalletLinkFirefox: state => {
      return state.firefoxLink
    },
    getRpayConfiguration: state => {
      return state.configuration
    }
  },
  mutations: {
    setRpayFlow (state, data) {
      const config = storeUtils.getConfig(data)
      state.configuration = config
    }
  },
  actions: {
    initApplication ({ dispatch }) {
      return new Promise((resolve) => {
        dispatch('stacksApiStore/fetchBlockchainInfo')
        dispatch('stacksAuthStore/fetchMyAccount').then((profile) => {
          dispatch('stacksApiStore/fetchLoopRuns')
          if (profile.loggedIn) {
            dispatch('stacksApiStore/sipTenTokenFindBy').then(() => {
              dispatch('stacksAuthStore/fetchAccountInfo', { stxAddress: profile.stxAddress, force: true }).then(account => {
                resolve(account)
              })
            })
          }
          resolve(profile)
        })
      })
    }
  }
})
