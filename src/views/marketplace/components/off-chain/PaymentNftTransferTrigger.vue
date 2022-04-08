<template>
<div>
  <div v-if="loaded">
    <div class="w-100" v-if="inFlightPayments">
      <b-button class="w-100" variant="outline-dark" @click="showAddressOrInflightPayments">Show</b-button>
    </div>
    <div class="w-100" v-else>
      <b-button class="w-100" variant="outline-dark" @click="showAddressOrInflightPayments">Start</b-button>
    </div>
  </div>
  <b-modal size="lg" id="in-flight-modal" centered>
    <InFlightPaymentModal :payments="inFlightPayments"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="stacks-address-modal" centered>
    <StacksAddressModal @showPayment="showPayment"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="payment-modal" centered>
    <PaymentFlow :transactionData="transactionData" :configuration="configuration" @stacksMateEvent="stacksMateEvent"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PaymentFlow from '@/views/marketplace/components/off-chain/PaymentFlow'
import StacksAddressModal from '@/views/marketplace/components/off-chain/StacksAddressModal'
import InFlightPaymentModal from '@/views/marketplace/components/off-chain/InFlightPaymentModal'
import utils from '@/services/utils'

export default {
  name: 'PaymentNftTransferTrigger',
  components: {
    PaymentFlow,
    StacksAddressModal,
    InFlightPaymentModal
  },
  props: ['configuration', 'transactionData'],
  data () {
    return {
      loaded: false,
      inFlightPayments: null,
      recipient: null
    }
  },
  mounted () {
    const data = {
      stxAddress: process.env.VUE_APP_STACKS_TRANSFER_ADDRESS
    }
    this.recipient = this.profile.stxAddress
    this.$store.dispatch('rpayAuthStore/fetchAccountInfo', data)
    data.stxAddress = this.profile.stxAddress
    this.$store.dispatch('merchantStore/fetchPayments', data).then((payments) => {
      this.loaded = true
      if (payments && payments.opennode.filter((o) => o.status !== 'unpaid').length > 0) {
        this.inFlightPayments = payments.opennode.filter((o) => o.status !== 'unpaid')
      }
    })
    if (this.$route.query && this.$route.query.stxAddress) {
      this.recipient = this.$route.query.stxAddress
    }
    if (!this.recipient && this.profile.loggedIn) {
      this.recipient = this.profile.stxAddress
    }
  },
  methods: {
    stacksMateEvent (data) {
      this.$notify({ type: 'warning', title: 'Pending', text: 'Event data: ' + data })
    },
    showAddressOrInflightPayments () {
      if (this.inFlightPayments) {
        this.$bvModal.show('in-flight-modal')
      } else {
        this.$bvModal.show('stacks-address-modal')
      }
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
      this.$bvModal.show('payment-modal')
      this.$bvModal.hide('stacks-address-modal')
    }
  },
  computed: {
    paymentMessage () {
      const configuration = this.$store.getters[APP_CONSTANTS.KEY_PAYMENT_CONFIG]
      if (!configuration) return ''

      const amounts = this.getAmounts
      if (!amounts) return ''
      if (this.transactionData) {
        return ''
      }
      const baseMessage = '<h3 class="mb-4">' + amounts.baseAmounts.currency + ' <span class="text-warning">' + amounts.baseAmounts.amountFiatFormatted + '</span> Swap</h3>'
      return baseMessage + '<div>Swap <span class="text-warning">' + amounts.fiatAmounts.amountFiatFormatted + '</span> ' + amounts.fiatAmounts.currency + ' for <span class="text-warning">' + amounts.baseAmounts.amountStx + '</span> STX</div>'
    },
    getAmounts () {
      const amounts = this.$store.getters[APP_CONSTANTS.KEY_AMOUNTS]
      return amounts
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
