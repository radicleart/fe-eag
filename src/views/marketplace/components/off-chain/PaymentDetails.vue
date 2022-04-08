<template>
<b-container class="text-small mb-5">
  <b-row>
    <b-col cols="10" class="pt-2 mb-2 bg-light"><h6>Payment Details</h6></b-col>
    <b-col cols="2" class="pt-2 mb-2 bg-light"><b-link @click="checkPayment(payment)">refresh</b-link></b-col>
    <b-col cols="4">Reference:</b-col><b-col cols="8">{{payment.id}}</b-col>
    <b-col cols="4">Amount:</b-col><b-col cols="8">{{getAmount(payment)}} {{payment.currency}}</b-col>
    <b-col cols="4">Status:</b-col><b-col cols="8">{{payment.status}}</b-col>
  </b-row>
  <b-row v-if="payment.status === 'processing'">
    <b-col cols="12" class="pt-2 my-2"><h6>Stacks Transaction</h6></b-col>
    <b-col cols="10" class="pt-2 mb-2 bg-light">Transaction waiting on payment</b-col>
  </b-row>
  <b-row v-else>
    <b-col cols="12" class="pt-2 my-2"><h6>Stacks Transaction</h6></b-col>
    <b-col cols="4">Status:</b-col><b-col cols="8">{{payment.transactionData.txStatus}}</b-col>
    <b-col cols="4">Type:</b-col><b-col cols="8">{{txType(payment)}}</b-col>
    <b-col cols="4">Asset:</b-col><b-col cols="8">{{payment.transactionData.assetName}}</b-col>
    <b-col cols="4">Sender:</b-col><b-col cols="8">{{payment.transactionData.sender}}</b-col>
    <b-col cols="4">Recipient:</b-col><b-col cols="8">{{payment.transactionData.recipient}}</b-col>
    <b-col cols="4">Tx Id:</b-col><b-col cols="8">{{payment.transactionData.stacksmateResponse}}</b-col>
  </b-row>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'

export default {
  name: 'PaymentDetails',
  components: {
  },
  props: ['payment'],
  data () {
    return {
      nftRecipient: null
    }
  },
  mounted () {
    this.nftRecipient = this.profile.stxAddress
  },
  methods: {
    checkPayment (payment) {
      this.$store.dispatch('merchantStore/checkPayment', payment.id).then((invoice) => {
        const expired = this.$store.getters[APP_CONSTANTS.KEY_INVOICE_EXPIRED]
        this.checkingChain = false
        if (invoice && invoice.opcode === 'btc-crypto-payment-success') {
          this.$store.commit('merchantStore/setDisplayCard', 104)
          this.$notify({ type: 'success', title: 'Payment Detected', text: 'Redirecting to NFT transfer' })
        } else {
          this.$notify({ type: 'warning', title: 'Payment Not Detected', text: 'Scan the qr code or paste the info into your btc wallet.' })
        }
        return expired
      })
    },
    getAmount (payment) {
      if (payment.currency === 'BTC') {
        return utils.fromSatoshi(payment.amount)
      }
      return payment.amount
    },
    txType (payment) {
      if (payment.transactionData.type === 'mint-with') {
        return 'mint'
      }
      return 'transfer'
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style lang="scss">
</style>
