import lsatHelper from './lsatHelper'
import axios from 'axios'
import SockJS from 'sockjs-client'
import Stomp from '@stomp/stompjs'
import { APP_CONSTANTS } from '@/app-constants'

let socket = null
let stompClient = null
const precision = 100000000
const precisionStx = 1000000
const setAmounts = function (tickerRates, configuration) {
  try {
    const rate = tickerRates.find((o) => o.currency === configuration.payment.currency)
    let amountFiat = configuration.payment.amountFiat
    if (configuration.commission) amountFiat = (configuration.commission.price * configuration.commission.amount * rate.stxPrice)
    if (configuration.payment.allowMultiples) {
      amountFiat = amountFiat * configuration.payment.creditAttributes.start
    }
    const amountBtc = amountFiat / rate.last
    configuration.payment.amountFiat = Math.round(amountFiat * 100) / 100
    configuration.payment.amountBtc = amountBtc
    configuration.payment.amountBtc = Math.round(amountBtc * precision) / precision
    configuration.payment.amountSat = Math.round(amountBtc * precision)
    configuration.payment.amountEth = Math.round((amountFiat / rate.ethPrice) * precision) / precision
    configuration.payment.amountStx = Math.round((amountFiat / rate.stxPrice) * precisionStx) / precisionStx
    return configuration
  } catch {
    return configuration
  }
}
const currencyWhiteList = function (currency) {
  return currency === 'CNY' ||
          currency === 'GBP' ||
          currency === 'JPY' ||
          currency === 'EUR' ||
          currency === 'USD'
}
const getPaymentOptions = function (configuration) {
  const allowedOptions = []
  const options = configuration.payment.paymentOptions
  const mainOption = configuration.payment.paymentOption
  options.forEach(function (option) {
    if (option.allowLightning) {
      allowedOptions.push({ disabled: option.disabled, text: 'Lightning', value: 'lightning', mainOption: mainOption === 'lightning' })
    } else if (option.allowFiat) {
      allowedOptions.push({ disabled: option.disabled, text: 'Fiat', value: 'fiat', mainOption: mainOption === 'fiat' })
    } else if (option.allowPaypal) {
      allowedOptions.push({ disabled: option.disabled, text: 'Paypal', value: 'paypal', mainOption: mainOption === 'paypal' })
    } else if (option.allowBitcoin) {
      allowedOptions.push({ disabled: option.disabled, text: 'Bitcoin', value: 'bitcoin', mainOption: mainOption === 'bitcoin' })
    } else if (option.allowLSAT) {
      allowedOptions.push({ disabled: option.disabled, text: 'Risidio LSAT', value: 'lsat', mainOption: mainOption === 'lsat' })
    } else if (option.allowEthereum) {
      allowedOptions.push({ disabled: option.disabled, text: 'Ether', value: 'ethereum', mainOption: mainOption === 'ethereum' })
    } else if (option.allowStacks) {
      allowedOptions.push({ disabled: option.disabled, text: 'Stacks', value: 'stacks', mainOption: mainOption === 'stacks' })
    }
  })
  return allowedOptions
}
const connectApiNews = function (commit) {
  if (!socket) socket = new SockJS(process.env.VUE_APP_RISIDIO_API + '/mesh/api-news')
  if (!stompClient) stompClient = Stomp.over(socket)
  stompClient.debug = () => {}
  socket.onclose = function () {
    stompClient.disconnect()
  }
  stompClient.connect({}, function () {
    stompClient.subscribe('/queue/rates-news', function (response) {
      const rates = JSON.parse(response.body)
      commit('setTickerRates', rates.tickerRates)
    })
  },
  function () {
  })
}
const subscribePayment = function (commit, paymentId) {
  if (!socket || !stompClient || !paymentId) return
  stompClient.subscribe('/queue/payment-news-' + paymentId, function (response) {
    const invoice = { data: JSON.parse(response.body) }
    commit('mergePaidCharge', invoice)
    if (invoice) {
      if (invoice.status === 'paid' || invoice.status === 'processing') {
        invoice.opcode = 'btc-crypto-payment-success'
        window.eventBus.$emit('rpayEvent', invoice)
      }
    }
  })
}
const checkPayment = function (resolve, reject, state, commit, paymentId) {
  axios.post(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/checkPayment/' + paymentId).then(response => {
    const invoice = response.data
    if (invoice && (invoice.status === 'paid' || invoice.status === 'processing')) {
      localStorage.setItem('OP_INVOICE', JSON.stringify(invoice))
      commit('mergePaidCharge', invoice)
      invoice.opcode = 'btc-crypto-payment-success'
      window.eventBus.$emit('rpayEvent', invoice)
    }
    resolve(invoice)
  }).catch(() => {
    resolve(false)
  })
}
const payment = {
  forceNew: false,
  amountFiat: 2,
  amountEth: 2,
  amountBtc: 2,
  amountStx: 2,
  currency: 'GBP',
  paymentCode: 'po-12324',
  allowMultiples: false,
  stxPaymentAddress: process.env.VUE_APP_STACKS_PAYMENT_ADDRESS,
  ethPaymentAddress: process.env.VUE_APP_ETH_PAYMENT_ADDRESS,
  ethNetworkId: Number(process.env.VUE_APP_ETH_NETWORK_ID),
  paymentOption: 'bitcoin',
  paymentOptions: [
    { allowFiat: true, disabled: false },
    { allowPaypal: true, disabled: true },
    { allowBitcoin: true, disabled: false },
    { allowLightning: true, disabled: false },
    { allowStacks: false, disabled: true },
    { allowLSAT: false, disabled: true },
    { allowEthereum: true, disabled: true }
  ],
  creditAttributes: {
    start: 2,
    step: 2,
    min: 2,
    max: 20
  },
  squarePay: {
    applicationId: process.env.VUE_APP_SQUARE_APPLICATION_ID,
    locationId: process.env.VUE_APP_SQUARE_LOCATION_ID,
    squareUrl: process.env.VUE_APP_VUE_APP_SQUARE_URL
  }
}
const appDetails = {
  name: 'StacksMate and the User Owned Internet',
  icon: origin + '/img/logo/logo.png'
}
const configuration = {
  appDetails: appDetails,
  payment: payment,
  minter: {},
  network: process.env.VUE_APP_NETWORK,
  risidioProjectId: process.env.VUE_APP_STACKS_CONTRACT_ADDRESS + '.' + process.env.VUE_APP_STACKS_CONTRACT_NAME,
  risidioBaseApi: process.env.VUE_APP_RISIDIO_API,
  risidioStacksApi: process.env.VUE_APP_STACKS_API,
  risidioWalletMac: process.env.VUE_APP_WALLET_MAC,
  risidioWalletSky: process.env.VUE_APP_WALLET_SKY,
  risidioCardMode: 'purchase-flow'
}

const merchantStore = {
  namespaced: true,
  state: {
    timer: null,
    tickerRates: null,
    configuration: configuration,
    settledInvoice: null,
    invoice: null,
    headers: null,
    displayCard: 100,
    beneficiary: null,
    paymentOption: null,
    paymentOptions: []
  },
  getters: {
    getDisplayCard: (state) => {
      return state.displayCard
    },
    getPurchaseConfiguration: state => {
      return state.configuration
    },
    getPreferredNetwork: (state) => {
      try {
        const networkConfig = state.configuration.minter.networks.filter(obj => {
          return obj.network === state.configuration.minter.preferredNetwork
        })[0]
        return networkConfig
      } catch (err) {
        return null
      }
    },
    getEnabledNetworks: (state) => {
      const networks = (state.configuration.minter) ? state.configuration.minter.networks.filter(o => o.enabled) : null
      return networks
    },
    getCurrentPaymentOption: (state) => {
      return (state.configuration.payment) ? state.configuration.payment.paymentOption : null
    },
    getPaymentOptions: state => {
      const paymentOptions = getPaymentOptions(state.configuration)
      return paymentOptions
    },
    getHeaders: state => {
      return state.configuration.authHeaders
    },
    getInvoice: state => {
      return state.invoice
    },
    isInvoiceExpired: state => invoice => {
      if (!state.invoice) return
      try {
        console.log(state.invoice.id === invoice.id)
      } catch (err) {
        console.log(invoice)
      }
      return lsatHelper.lsatExpired(invoice)
    },
    getInvoiceExpired: state => {
      if (!state.invoice) return
      return lsatHelper.lsatExpired(state.invoice)
    },
    getInvoiceExpires: state => {
      if (!state.invoice) return
      return lsatHelper.lsatExpires(state.invoice)
    },
    getInvoiceDuration: state => {
      if (!state.invoice) return
      return lsatHelper.lsatDuration(state.invoice)
    },
    getExchangeRateFormatted: state => amountStx => {
      if (!state.tickerRates) {
        return null
      }
      const rate = state.tickerRates.find(item => item.currency === 'EUR')
      const priceInEuro = (1 / rate.amountStx) * amountStx
      return rate.symbol + ' ' + (Math.round(priceInEuro * 100) / 100)
    },
    getStxAmountFormatted: () => amountStx => {
      if (!amountStx) {
        return 0
      }
      return (Math.round(amountStx * 10000) / 10000)
    },
    getTickerRates: state => {
      if (!state.tickerRates) return []
      const currencies = state.tickerRates.filter((o) => currencyWhiteList(o.currency))
      return currencies
    },
    getUnfilteredTickerRates: state => {
      if (!state.tickerRates) return []
      return state.tickerRates
    }
  },
  mutations: {
    setPurchaseConfiguration (state, data) {
      let config = state.configuration
      config.risidioCardMode = data.flow
      config.loopRun = data.loopRun
      config.commission = data.commission
      config = setAmounts(state.tickerRates, config)
      state.configuration = config
    },
    updateConfiguration (state, configuration) {
      state.configuration = configuration
    },
    setDisplayCard (state, val) {
      if (val !== 100 && val !== 102 && val !== 104 && val !== 106) {
        val = 100
      }
      if (val === 100) {
        if (state.configuration.payment && !state.configuration.payment.allowMultiples) {
          val = 102
        }
      }
      state.displayCard = val
    },
    setEditBeneficiary (state, beneficiary) {
      state.beneficiary = beneficiary
    },
    setPreferredNetwork (state, o) {
      if (state.configuration.minter) state.configuration.minter.preferredNetwork = o
    },
    setCurrentCryptoPaymentOption (state, o) {
      if (state.configuration.payment) state.configuration.payment.paymentOption = o
    },
    addPaymentOption (state, o) {
      if (state.configuration.payment) state.configuration.payment.paymentOption = o
    },
    addPaymentOptions (state, o) {
      state.paymentOptions = getPaymentOptions(state.configuration)
      if (state.configuration.payment && !state.configuration.payment.paymentOption) {
        state.configuration.payment.paymentOption = state.configuration.payment.paymentOptions[0].value
      }
    },
    setInvoice (state, invoice) {
      state.invoice = invoice
    },
    mergePaidCharge (state, charge) {
      if (charge && charge.data) {
        state.invoice = Object.assign(state.invoice, charge.data)
      }
    },
    setTickerRates (state, tickerRates) {
      state.tickerRates = tickerRates
    }
  },
  actions: {
    fetchPurchases ({ state }, data) {
      return new Promise((resolve) => {
        let url = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/purchases'
        if (data.contractId) url += '/' + data.contractId
        if (data.stxAddress) url += '/' + data.stxAddress
        if (data.status) url += '/' + data.status
        axios.get(url).then(response => {
          const paymentMap = response.data
          let payments = []
          if (paymentMap && paymentMap.opennode.filter((o) => o.status !== 'unpaid').length > 0) {
            payments = paymentMap.opennode.filter((o) => o.status !== 'unpaid')
          }
          if (paymentMap && paymentMap.square.filter((o) => o.status !== 'unpaid').length > 0) {
            payments = payments.concat(paymentMap.square.filter((o) => o.status !== 'unpaid'))
          }
          resolve(payments)
        })
      })
    },
    fetchPurchase ({ state }, paymentId) {
      return new Promise((resolve) => {
        const url = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/purchase/' + paymentId
        axios.get(url).then(response => {
          resolve(response.data)
        })
      })
    },
    initialiseRates ({ commit }) {
      return new Promise((resolve) => {
        try {
          axios.get(process.env.VUE_APP_RISIDIO_API + '/mesh/v1/rates/ticker').then(response => {
            connectApiNews(commit)
            commit('setTickerRates', response.data)
            resolve(response.data)
          })
        } catch (err) {
          resolve()
        }
      })
    },
    initialisePaymentFlow ({ dispatch, state, commit, rootGetters }, transactionData) {
      return new Promise((resolve) => {
        const configuration = state.configuration
        axios.get(process.env.VUE_APP_RISIDIO_API + '/mesh/v1/rates/ticker').then(response => {
          commit('setTickerRates', response.data)
          setAmounts(state.tickerRates, configuration)
          commit('updateConfiguration', configuration)
          if (transactionData) {
            configuration.transactionData = transactionData
            commit('updateConfiguration', configuration)
          }
          const profile = rootGetters['rpayAuthStore/getMyProfile']
          dispatch('fetchPurchases', { stxAddress: profile.stxAddress }).then((payments) => {
            if (payments) {
              const invoice = payments.find((o) => o.status === 'unpaid' && !lsatHelper.lsatExpired(o))
              if (!invoice) {
                dispatch('continueOrCreatePayment').then((result) => {
                  resolve(result)
                })
              } else {
                localStorage.setItem('OP_INVOICE', JSON.stringify(invoice))
                commit('setInvoice', invoice)
                resolve(invoice)
                return null
              }
            } else {
              dispatch('continueOrCreatePayment').then((result) => {
                resolve(result)
              })
            }
          })
        }).catch(() => {
          configuration.payment.paymentOptions[1].allowBitcoin = false
          configuration.payment.paymentOptions[2].allowLightning = false
          commit('updateConfiguration', configuration)
          resolve({ status: 'unpaid' })
        })
      })
    },
    continueOrCreatePayment ({ dispatch, state, commit }) {
      return new Promise((resolve, reject) => {
        const configuration = state.configuration
        this.dispatch('rpayStacksStore/fetchMacSkyWalletInfo', { root: true })
        commit('addPaymentOptions')
        if (configuration.payment.forceNew) {
          localStorage.removeItem('OP_INVOICE')
        }
        commit('updateConfiguration', configuration)
        if (localStorage.getItem('OP_INVOICE')) {
          const savedInvoice = JSON.parse(localStorage.getItem('OP_INVOICE'))
          if (savedInvoice && (savedInvoice.status === 'paid' || savedInvoice.status === 'processing')) {
            localStorage.removeItem('OP_INVOICE')
            // commit('setInvoice', savedInvoice)
            // savedInvoice.opcode = 'btc-crypto-payment-prior'
            // window.eventBus.$emit('rpayEvent', savedInvoice)
            // resolve(savedInvoice)
            // return
          } else if (savedInvoice && !savedInvoice.lightning_invoice) {
            localStorage.removeItem('OP_INVOICE')
          } else if (!lsatHelper.lsatExpired(savedInvoice)) {
            commit('setInvoice', savedInvoice)
            try {
              subscribePayment(commit, savedInvoice.id)
            } catch (err) {
            }
            checkPayment(resolve, reject, state, commit, savedInvoice.id)
            commit('updateConfiguration', configuration)
            resolve(savedInvoice)
            return
          }
        }
        const allowed = configuration.payment.paymentOptions.find((o) => o.allowBitcoin) ||
          configuration.payment.paymentOptions.find((o) => o.allowLightning)
        if (!allowed) {
          resolve({ status: 'unpaid' })
          return
        }
        dispatch('fetchPayment').then((invoice) => {
          localStorage.setItem('OP_INVOICE', JSON.stringify(invoice))
          if (invoice) subscribePayment(commit, invoice.id)
          resolve(invoice)
        }).catch(() => {
          resolve(false)
        })
      })
    },
    fetchPayment ({ state, rootGetters, commit }) {
      return new Promise((resolve, reject) => {
        const configuration = state.configuration
        const data = {
          amount: configuration.payment.amountSat,
          description: (configuration.payment.description) ? configuration.payment.description : 'Stacksmate STX swap',
          transactionData: configuration.transactionData
        }
        const authHeaders = rootGetters[APP_CONSTANTS.KEY_AUTH_HEADERS]
        axios.post(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/fetchPayment', data, authHeaders).then(response => {
          const invoice = response.data
          subscribePayment(commit, invoice.id)
          checkPayment(resolve, reject, state, commit, invoice.id)
          commit('setInvoice', invoice)
          resolve(invoice)
        }).catch(() => {
          configuration.payment.paymentOptions[1].allowBitcoin = false
          configuration.payment.paymentOptions[2].allowLightning = false
          commit('updateConfiguration', configuration)
          resolve({ status: 'unpaid' })
        })
      })
    },
    checkPayment ({ state, commit }, paymentId) {
      return new Promise((resolve, reject) => {
        checkPayment(resolve, reject, state, commit, paymentId)
      })
    },
    stopCheckPayment ({ state }) {
      if (state.timer) {
        clearInterval(state.timer)
      }
    },
    updateAmount ({ state, commit }, data) {
      let config = state.configuration
      config.commission.amount = data.amount
      config = setAmounts(state.tickerRates, config)
      commit('updateConfiguration', config)
    },
    stopListening ({ commit }) {
      if (stompClient) stompClient.disconnect()
    }
  }
}
export default merchantStore
