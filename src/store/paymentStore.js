import axios from 'axios'
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/store/storeUtils'

const MESH_API_PATH = process.env.VUE_APP_RISIDIO_API + '/mesh'
const SM_API_PATH = process.env.VUE_APP_RISIDIO_API

const paymentCurrency = function (configuration) {
  if (configuration.payment.paymentOption === 'ethereum') {
    return 'ETH'
  } else if (configuration.payment.paymentOption === 'bitcoin' || configuration.payment.paymentOption === 'lightning') {
    return 'BTC'
  } else {
    return configuration.payment.currency
  }
}
const paymentAmount = function (configuration) {
  if (configuration.payment.paymentOption === 'ethereum') {
    return configuration.payment.amountEth
  } else if (configuration.payment.paymentOption === 'bitcoin' || configuration.payment.paymentOption === 'lightning') {
    return configuration.payment.amountBtc
  } else {
    return configuration.payment.amountFiat
  }
}

const watchTransaction = function (dispatch, commit, transaction) {
  if (transaction.txStatus === 'pending') {
    dispatch('rpayTransactionStore/fetchTransactionFromChainByTxId', transaction.txId, { root: true }).then((result) => {
      if (result && result.txStatus !== 'pending') {
        result.opcode = 'stx-transaction-update'
        const mergedTx = Object.assign(transaction, result)
        dispatch('paymentStore/updateStacksMateTransaction', mergedTx, { root: true }).then(() => {
          commit('addStacksMateUserTransactions', mergedTx)
        }).catch((err) => {
          console.log(err)
        })
      }
    })
  }
}
const updateTransactions = function (dispatch, commit, transactions) {
  transactions.forEach((transaction) => {
    watchTransaction(dispatch, commit, transaction)
  })
}
const watchTransactions = function (dispatch, state, commit, recipient) {
  let transactions = state.stacksMateTransactions[recipient] || []
  updateTransactions(dispatch, commit, transactions)
  setInterval(function () {
    transactions = state.stacksMateTransactions[recipient] || []
    updateTransactions(dispatch, commit, transactions)
  }, 15000)
}

const paymentStore = {
  namespaced: true,
  state: {
    payments: [],
    nonces: null,
    backers: [],
    stacksMateTransaction: null,
    allStacksMateTransactions: [],
    stacksMateTransactions: {},
    anon: 'anon',
    squareType: 'fiat-payment-success',
    bitcoinType: 'btc-crypto-payment-success',
    paypalType: 'paypal-payment-success'
  },
  getters: {
    convertToPayment: (state, getters, rootState, rootGetters) => rawPayment => {
      const configuration = rootGetters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      const payment = {
        opcode: rawPayment.opcode,
        txStatus: 'unsent',
        txId: null,
        nonce: null,
        microstx: utils.toOnChainAmount(configuration.payment.amountStx),
        recipient: rawPayment.recipient,
        stxAddress: process.env.VUE_APP_STACKS_TRANSFER_ADDRESS,
        paymentId: rawPayment.txId,
        paymentTx: rawPayment.txId,
        paymentAmount: paymentAmount(configuration),
        paymentCurrency: paymentCurrency(configuration),
        paymentCode: rawPayment.opcode,
        paymentStatus: 'paid'
      }
      if (rawPayment.opcode === state.squareType) {
        payment.paymentId = rawPayment.id
        payment.paymentOrderId = rawPayment.order_id
        payment.paymentUrl = rawPayment.receipt_url
        payment.paymentStatus = rawPayment.status
      } else if (rawPayment.opcode === state.bitcoinType) {
        // const precision = 100000000
        payment.paymentUrl = rawPayment.uri
        const invoice = rootGetters[APP_CONSTANTS.KEY_INVOICE]
        payment.paymentUrl = (invoice.uri) ? invoice.uri : invoice.address
        if (rawPayment.data) {
          payment.paymentCurrency = (rawPayment.data.status === 'processing') ? 'BTC' : 'L/BTC'
          payment.paymentId = rawPayment.data.id
          // payment.paymentAmount = Math.round(rawPayment.data.price / precision)
          payment.amountSat = rawPayment.data.price
          if (rawPayment.data.transactions && rawPayment.data.transactions > 0) {
            payment.paymentTx = rawPayment.data.transactions[0].tx
          }
          payment.paymentStatus = rawPayment.data.status
        }
      }
      return payment
    },
    getPending: state => stxAddress => {
      const transactions = state.stacksMateTransactions[stxAddress]
      if (transactions && transactions.length > 0) {
        return transactions.filter((o) => o.txStatus === 'pending')
      }
      return false
    },
    getNonces: state => {
      return state.nonces
    },
    getLastNonce: state => {
      return state.stacksMateTransaction
    },
    getAllStacksMateTransactions: state => {
      return state.allStacksMateTransactions
    },
    getStacksMateUserTransactions: state => stxAddress => {
      return state.stacksMateTransactions[stxAddress]
    }
  },
  mutations: {
    addBacker (state, backer) {
      if (backer) state.backers.splice(0, 0, backer)
    },
    setNonces (state, nonces) {
      state.nonces = nonces
    },
    setAllStacksMateTransactions (state, allStacksMateTransactions) {
      state.allStacksMateTransactions = allStacksMateTransactions
    },
    setStacksMateTransaction (state, stacksMateTransaction) {
      state.stacksMateTransaction = stacksMateTransaction
    },
    setStacksMateUserTransactions (state, data) {
      state.stacksMateTransactions[data.stxAddress] = data.transactions
    },
    addStacksMateUserTransactions (state, transaction) {
      if (transaction.stxAddress) {
        const transactions = state.stacksMateTransactions[transaction.recipient] || []
        const index = transactions.findIndex((o) => o.id === transaction.id)
        if (index > -1) {
          transactions.splice(index, 1, transaction)
        } else {
          transactions.splice(0, 0, transaction)
        }
      }
    },
    addPayment (state, payment) {
      if (payment) state.payments.splice(0, 0, payment)
    }
  },
  actions: {
    fetchNoncesForStacksMateWallet ({ commit, rootGetters }, stxAddress) {
      return new Promise(resolve => {
        const configuration = rootGetters['rpayStore/getConfiguration']
        const url = configuration.risidioStacksApi + '/extended/v1/address/' + stxAddress + '/nonces'
        axios.get(url).then((response) => {
          commit('setNonces', response.data)
          resolve(response.data)
        }).catch(() => {
          resolve()
        })
      })
    },
    fetchAllStacksMateTransactions ({ dispatch, state, commit }) {
      return new Promise(function (resolve, reject) {
        axios.get(MESH_API_PATH + '/v2/stacksmate/transactions').then((response) => {
          commit('setAllStacksMateTransactions', response.data)
          resolve(response.data)
        }).catch((error) => {
          reject(new Error('Unable to fetch asset: ' + error))
        })
      })
    },
    fetchStacksMateTransactions ({ dispatch, state, commit }, recipient) {
      return new Promise(function (resolve, reject) {
        axios.get(MESH_API_PATH + '/v2/stacksmate/transactions/' + recipient).then((response) => {
          commit('setStacksMateUserTransactions', { stxAddress: recipient, transactions: response.data })
          resolve(response.data)
          watchTransactions(dispatch, state, commit, recipient)
        }).catch((error) => {
          reject(new Error('Unable to fetch asset: ' + error))
        })
      })
    },
    fetchLastStacksMateTransaction ({ commit }) {
      return new Promise(function (resolve, reject) {
        axios.get(MESH_API_PATH + '/v2/stacksmate/transaction-recent').then((response) => {
          if (response.data) commit('setStacksMateTransaction', response.data)
          resolve(response.data)
        }).catch((error) => {
          reject(new Error('Unable to fetch asset: ' + error))
        })
      })
    },
    deleteStacksMateTransaction ({ commit }, nonce) {
      return new Promise(function (resolve, reject) {
        axios.delete(MESH_API_PATH + '/v2/stacksmate/transactions/' + nonce).then((response) => {
          resolve(response.data)
        }).catch((error) => {
          reject(new Error('Unable to fetch asset: ' + error))
        })
      })
    },
    saveStacksMateTransaction ({ state, commit }, smTransaction) {
      return new Promise(function (resolve, reject) {
        const txs = state.stacksMateTransactions[smTransaction.recipient]
        if (txs) {
          const index = txs.findIndex((o) => o.paymentId === smTransaction.paymentId)
          if (index > -1) {
            reject(new Error('Transaction with payment id already registered? ' + smTransaction.paymentId))
            return
          }
        }
        smTransaction.timeSent = new Date().getTime()
        axios.post(MESH_API_PATH + '/v2/stacksmate/transactions', smTransaction).then((response) => {
          resolve(response.data)
        }).catch((error) => {
          reject(new Error('Unable to fetch asset: ' + error))
        })
      })
    },
    updateStacksMateTransaction ({ commit }, smTransaction) {
      return new Promise(function (resolve, reject) {
        axios.put(MESH_API_PATH + '/v2/stacksmate/transactions', smTransaction).then((response) => {
          commit('setStacksMateTransaction', smTransaction)
          resolve(response.data)
        }).catch((error) => {
          reject(new Error('Unable to fetch asset: ' + error))
        })
      })
    },
    sendStacksMateTransaction ({ dispatch, commit }, payment) {
      return new Promise(function (resolve, reject) {
        dispatch('saveStacksMateTransaction', payment).then((smTransaction) => {
          commit('setStacksMateTransaction', smTransaction)
          axios.post(SM_API_PATH + '/stacksmate/' + payment.recipient + '/' + payment.nonce + '/' + payment.microstx).then((response) => {
            smTransaction.stxAddress = payment.stxAddress
            smTransaction.nonce = payment.nonce
            smTransaction.txId = response.data
            smTransaction.txStatus = 'pending'
            dispatch('updateStacksMateTransaction', smTransaction)
            dispatch('rpayAuthStore/fetchAccountInfo', { stxAddress: payment.stxAddress }, { root: true })
            commit('addStacksMateUserTransactions', smTransaction)
            resolve(smTransaction)
          }).catch((err) => {
            smTransaction.txStatus = 'failed'
            dispatch('updateStacksMateTransaction', smTransaction)
            dispatch('rpayAuthStore/fetchAccountInfo', { stxAddress: payment.stxAddress }, { root: true })
            if (typeof err === 'object' && err !== null) {
              console.log(Object.keys(err))
              if (err.response) {
                console.log(err.response.data)
                reject(new Error('Unable to fetch asset: ' + err.response.data.message))
              } else {
                reject(new Error('Unable to fetch asset: ' + err))
              }
            } else {
              console.log('error not object')
              reject(new Error('Unable to fetch asset: ' + err))
            }
          })
        }).catch(() => {
          payment.error('TX_PREV_SAVED')
          resolve(payment)
        })
      })
    }
  }
}
export default paymentStore
