import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { APP_CONSTANTS } from '@/app-constants'
import storeUtils from './storeUtils'
import contentStore from './contentStore'
import merchantStore from './merchantStore'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    contentStore,
    merchantStore
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
    initApplication ({ rootGetters, dispatch }) {
      return new Promise((resolve) => {
        dispatch('rpayAuthStore/fetchMyAccount').then((profile) => {
          if (profile.loggedIn) {
            const authHeaders = rootGetters[APP_CONSTANTS.KEY_AUTH_HEADERS]
            axios.interceptors.request.use(function (config) {
              config.headers.Authorization = authHeaders.headers.Authorization
              config.headers.IdentityAddress = authHeaders.headers.IdentityAddress
              config.headers.STX_ADDRESS = profile.stxAddress
              return config
            })
            dispatch('rpayStacksContractStore/fetchFullRegistry')
            const data = { stxAddress: 'STFJEDEQB1Y1CQ7F04CS62DCS5MXZVSNXXN413ZG', mine: true }
            if (process.env.VUE_APP_NETWORK !== 'local') {
              data.stxAddress = profile.stxAddress
            } else {
              dispatch('rpayStacksStore/fetchMacSkyWalletInfo')
            }
            dispatch('rpayMarketGenFungStore/sipTenTokenFindBy').then(() => {
              dispatch('rpayCategoryStore/fetchLoopRuns')
              dispatch('rpayCategoryStore/fetchLatestLoopRunForStxAddress', { currentRunKey: process.env.VUE_APP_DEFAULT_LOOP_RUN, stxAddress: profile.stxAddress }, { root: true })
              // dispatch('rpayMyItemStore/initSchema').then(rootFile => {
              dispatch('rpayAuthStore/fetchAccountInfo', { stxAddress: profile.stxAddress, force: true }).then(account => {
                resolve(account)
              })
            })
            // })
          } else {
            dispatch('rpayCategoryStore/fetchLoopRuns')
          }
          resolve(profile)
        })
      })
    }
  }
})
