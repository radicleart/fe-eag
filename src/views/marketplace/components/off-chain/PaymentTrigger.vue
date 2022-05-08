<template>
<div>
  <div class="mt-0" v-if="!inFlightPayments || inFlightPayments.length < loopRun.spinsPerDay">
    <div class="w-100 ml-1">
      <b-button class="w-50" variant="outline-dark" @click="showAddress">BUY NOW</b-button>
    </div>
  </div>
  <div class="d-flex mt-4" v-if="inFlightPayments && inFlightPayments.length > 0">
    <div class="w-50 ml-1">
      <b-link class="text-xsmall" @click="showInflightPayments"><b-icon icon="cart"/> open cart</b-link>
    </div>
  </div>

  <b-modal size="lg" id="payment-begun-modal" centered>
    <p>Payment begun</p>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="in-flight-modal" centered>
    <StatementCard :payments="inFlightPayments"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="stacks-address-modal" centered>
    <StacksAddressModal @showPayment="showPayment" v-on="$listeners" :transactionData="transactionData"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="payment-modal" centered>
    <PaymentFlow :transactionData="transactionData" @stacksMateEvent="stacksMateEvent"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PaymentFlow from '@/views/marketplace/components/off-chain/PaymentFlow'
import StacksAddressModal from '@/views/marketplace/components/off-chain/StacksAddressModal'
import StatementCard from '@/views/accounts/components/StatementCard'
import utils from '@/services/utils'

export default {
  name: 'PaymentTrigger',
  components: {
    PaymentFlow,
    StacksAddressModal,
    StatementCard
  },
  props: ['loopRun', 'configuration', 'transactionData', 'inFlightPayments'],
  data () {
    return {
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
    if (this.$route.query && this.$route.query.stxAddress) {
      this.recipient = this.$route.query.stxAddress
    }
    if (!this.recipient && this.profile.loggedIn) {
      this.recipient = this.profile.stxAddress
    }
    if (!this.transactionData.nftIndex) {
      this.transactionData.nftIndex = this.mintCounter + 1
    }
  },
  methods: {
    stacksMateEvent (data) {
      if (data.opcode === 'change-payment-method') return
      this.$bvModal.hide('stacks-address-modal')
      this.$bvModal.hide('payment-begun-modal')
      if (data.opcode === 'crypto-payment-expired' || data.opcode === 'payment-restart') {
        this.$notify({ type: 'warning', title: 'Payments', text: 'Payment expired.' })
      } else if (data.opcode.indexOf('-payment-begun') > -1) {
        this.$bvModal.show('payment-begun-modal')
      } else if (data.opcode.indexOf('-payment-error') > -1) {
        this.$notify({ type: 'danger', title: 'Payments', text: 'Payment was not recieved due to an unexpected error.' })
        this.$bvModal.show('in-flight-modal')
      } else if (data.opcode.indexOf('-payment-cancelled') > -1) {
        this.$notify({ type: 'warning', title: 'Payments', text: 'Payment cancelled.' })
      } else if (data.opcode.indexOf('-payment-success') > -1) {
        this.$notify({ type: 'warning', title: 'Pending', text: 'Event data: ' + data })
        this.$bvModal.hide('payment-modal')
        this.$bvModal.show('in-flight-modal')
      }
    },
    update (data) {
      this.$emit('update', data)
    },
    showInflightPayments () {
      if (this.inFlightPayments.length > 0) {
        this.$bvModal.show('in-flight-modal')
      }
    },
    showAddress () {
      this.$bvModal.show('stacks-address-modal')
    },
    showPayment (data) {
      if (data.opcode && data.opcode === 'amount-change') {
        this.$emit('update', data)
        return
      }
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
    mintCounter () {
      // const application = this.$store.getters[APP_CONSTANTS.KEY_APPLICATION_FROM_REGISTRY_BY_CONTRACT_ID](this.loopRun.contractId)
      // const counter = (application && application.tokenContract) ? application.tokenContract.mintCounter : 0
      const counter = this.loopRun.tokenCount
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    },
    paymentMessage () {
      const configuration = this.$store.getters[APP_CONSTANTS.KEY_PURCHASE_CONFIGURATION]
      if (!configuration) return ''

      const amounts = this.getAmounts
      if (!amounts) return ''
      if (this.transactionData) {
        return ''
      }
      const baseMessage = '<h3 class="mb-4">' + amounts.baseAmounts.currency + ' <span class="text-payments">' + amounts.baseAmounts.amountFiatFormatted + '</span> Swap</h3>'
      return baseMessage + '<div>Swap <span class="text-payments">' + amounts.fiatAmounts.amountFiatFormatted + '</span> ' + amounts.fiatAmounts.currency + ' for <span class="text-payments">' + amounts.baseAmounts.amountStx + '</span> STX</div>'
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
