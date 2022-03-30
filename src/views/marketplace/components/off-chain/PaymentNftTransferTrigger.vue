<template>
<div>
  <div class="w-100" v-if="transactionData.type === 'mint-with'">
    <p class="text-small" v-html="paymentMessage"></p>
    <b-button class="w-100" :disabled="pending" variant="outline-dark" @click="showAddress">Start</b-button>
  </div>

  <div class="w-md-75" v-else>
    <p class="text-small" v-html="paymentMessage"></p>
    <p class="mt-3 text-left"><b-button :disabled="pending" variant="warning" @click="showAddress">Buy Now</b-button></p>
  </div>
  <b-modal size="lg" id="stacks-address-modal" centered>
    <StacksAddressModal @showPayment="showPayment"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="payment-modal" centered>
    <PaymentFlow v-if="showRpay" :transactionData="transactionData" :configuration="configuration" :recipient="recipient" @stacksMateEvent="stacksMateEvent"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PaymentFlow from '@/views/marketplace/components/off-chain/PaymentFlow'
import StacksAddressModal from '@/views/marketplace/components/off-chain/StacksAddressModal'
import utils from '@/services/utils'

export default {
  name: 'PaymentNftTransferTrigger',
  components: {
    PaymentFlow,
    StacksAddressModal
  },
  props: ['configuration', 'transactionData'],
  data () {
    return {
      componentKey: 0,
      recipient: null,
      showSMWallet: false,
      showRpay: false,
      showUserTransactions: false,
      transactions: null
    }
  },
  mounted () {
    // const configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
    // if (this.getAmounts) configuration.payment = Object.assign(configuration.payment, this.getAmounts.fiatAmounts)
    // configuration.payment.paymentOption = ''
    // configuration.risidioCardMode = 'purchase-flow'
    // this.configuration = configuration
    const data = { stxAddress: process.env.VUE_APP_STACKS_TRANSFER_ADDRESS }
    this.recipient = this.profile.stxAddress
    this.$store.dispatch('rpayAuthStore/fetchAccountInfo', data)
    if (this.$route.query && this.$route.query.stxAddress) {
      this.recipient = this.$route.query.stxAddress
    }
    if (!this.recipient && this.profile.loggedIn) {
      this.recipient = this.profile.stxAddress
    }
  },
  methods: {
    stacksMateEvent (transaction) {
      this.$store.dispatch('paymentStore/fetchStacksMateTransactions', this.profile.stxAddress).then((transactions) => {
        this.transactions = transactions
      })
      if (transaction.error !== 'TX_PREV_SAVED') {
        this.$notify({ type: 'success', title: 'Stacks Transfer', text: 'Your STX tokens are on their way!' })
      }
      this.$bvModal.hide('payment-modal')
      this.showUserTransactions = true
      this.componentKey++
    },
    useMyAddress: function () {
      this.recipient = this.profile.stxAddress
    },
    showAddress () {
      if (this.pending) {
        this.$notify({ type: 'warning', title: 'Pending', text: 'Please wait for current transactions to confirm' })
        return
      }
      this.$bvModal.show('stacks-address-modal')
    },
    showPayment (data) {
      this.recipient = data.recipient
      if (!this.recipient) {
        this.$notify({ type: 'error', title: 'Purchase Error', text: 'An address is needed as this is where we send the artwork!' })
        return
      }
      let decaddr
      try {
        decaddr = utils.convertAddressFrom(this.recipient)
      } catch (err) {
        this.$notify({ type: 'error', title: 'Address Error', text: 'A valid address is needed as this is where we send the artwork!' })
        return
      }
      if (decaddr[0] === 22 && process.env.VUE_APP_NETWORK !== 'production') {
        this.$notify({ type: 'error', title: 'Address Error', text: 'Expecting a stacks mainnet address!' })
        return
      } else if (decaddr[0] === 26 && process.env.VUE_APP_NETWORK === 'production') {
        this.$notify({ type: 'error', title: 'Address Error', text: 'Expecting a stacks testnet address!' })
        return
      }
      this.transactionData.recipient = this.recipient
      this.showRpay = true
      this.$bvModal.show('payment-modal')
      this.$bvModal.hide('stacks-address-modal')
    }
  },
  computed: {
    paymentMessage () {
      const configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      if (!configuration) return ''

      const amounts = this.getAmounts
      if (!amounts) return ''
      if (this.transactionData) {
        return ''
      }
      // return '<div>Swap <span class="text-warning">' + configuration.payment.amountFiat + '</span> ' + configuration.payment.currency + ' for <span class="text-warning">' + configuration.payment.amountStx + '</span> STX</div><div class="mt-3">Send the STX to:</span> <span class="text-warning">' + this.recipient + '</div>'
      const baseMessage = '<h3 class="mb-4">' + amounts.baseAmounts.currency + ' <span class="text-warning">' + amounts.baseAmounts.amountFiatFormatted + '</span> Swap</h3>'
      return baseMessage + '<div>Swap <span class="text-warning">' + amounts.fiatAmounts.amountFiatFormatted + '</span> ' + amounts.fiatAmounts.currency + ' for <span class="text-warning">' + amounts.baseAmounts.amountStx + '</span> STX</div>'
      // <div class="mt-3">Send the STX to:</span> <span class="text-warning">' + this.recipient + '</div>'
    },
    getAmounts () {
      const amounts = this.$store.getters[APP_CONSTANTS.KEY_AMOUNTS]
      return amounts
    },
    pending () {
      const pending = this.$store.getters[APP_CONSTANTS.KEY_MY_PENDING](this.profile.stxAddress)
      return pending
    },
    smWallet () {
      const stxAddress = process.env.VUE_APP_STACKS_TRANSFER_ADDRESS
      const wallet = this.$store.getters[APP_CONSTANTS.KEY_ACCOUNT_INFO](stxAddress)
      return wallet
    },
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style lang="scss">
</style>
