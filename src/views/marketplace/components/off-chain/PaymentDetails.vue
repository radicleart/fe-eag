<template>
<b-container class="text-xsmall mb-5">
  <b-row>
    <b-col cols="10" class="py-2 mb-2 bg-light text-upper"><span class="text-primary">Payment Details</span></b-col>
    <b-col cols="2" class="py-2 mb-2 bg-light text-upper"><b-link @click="checkPayment(payment)">refresh</b-link></b-col>
    <b-col cols="4">Reference:</b-col><b-col cols="8">{{payment.id}}</b-col>
    <b-col cols="4">Amount:</b-col><b-col cols="8">{{getAmount(payment)}} {{payment.currency}}</b-col>
    <b-col cols="4">Status:</b-col><b-col cols="8">{{payment.status}}</b-col>
  </b-row>
  <b-row v-if="!transaction || transaction.tx_status === 'pending'">
    <b-col cols="12" class="pt-2 mb-2 text-right">
      Processing - results here when confirmations available
      <a v-if="getTransactionId()" :href="transactionUrl()" target="_blank">view on explorer <b-icon class="text-payments" font-scale="1.2" icon="arrow-up-right-circle"/></a>
    </b-col>
  </b-row>
  <b-row v-else-if="transaction.tx_status === 'success'">
    <b-col cols="12" class="pt-2 my-2"><span class="text-primary text-upper">Stacks {{transaction.events[0].asset.asset_event_type}} Transaction</span></b-col>
    <b-col cols="4">Contract:</b-col><b-col cols="8">{{transaction.contract_call.contract_id}}</b-col>
    <b-col cols="4">Sender:</b-col><b-col cols="8">{{transaction.sender_address}}</b-col>
    <b-col cols="4">Recipient:</b-col><b-col cols="8">{{transaction.events[0].asset.recipient}}</b-col>
    <b-col cols="4">Asset:</b-col><b-col cols="8">{{getTokenId()}}</b-col>
  </b-row>
  <b-row v-else>
    <b-col cols="12" class="pt-2 my-2"><h6>NFT Details</h6></b-col>
    <b-col cols="4">Asset:</b-col><b-col cols="8">{{transaction.tx_status}}</b-col>
  </b-row>
  <b-row v-if="getTransactionId()">
    <b-col cols="12" class="pt-2 mb-2 text-right">
      <a :href="transactionUrl()" target="_blank">view on explorer <b-icon class="text-payments" font-scale="1.2" icon="arrow-up-right-circle"/></a>
    </b-col>
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
      transaction: null
    }
  },
  mounted () {
    this.nftRecipient = this.profile.stxAddress
    this.checkPayment()
  },
  methods: {
    transactionUrl: function () {
      return 'https://explorer.stacks.co/txid/' + this.getTransactionId() + '?chain=' + process.env.VUE_APP_NETWORK
    },
    getTransactionId: function () {
      if (this.transaction) return this.transaction.tx_id
      try {
        const resp = JSON.parse(this.payment.transactionData.stacksmateResponse)
        // if (typeof resp === 'object') resp = resp.txid
        if (!resp.txid.startsWith('0x')) resp.txid = '0x' + resp.txid
        return resp.txid
      } catch (e) {
        return null
      }
    },
    checkPayment () {
      const path = '/extended/v1/tx/' + this.getTransactionId()
      const txOptions = {
        path: path,
        httpMethod: 'GET',
        postData: {
          arguments: [],
          sender: null // this.profile.stxAddress
        }
      }
      this.$store.dispatch('rpayStacksStore/callApi', txOptions).then((result) => {
        this.transaction = result
        this.$notify({ type: 'warning', title: 'Check Status', text: 'Transaction status is ' + this.transaction.tx_status })
      })
    },
    getTokenId () {
      const result = utils.jsonFromTxResult(this.transaction.events[0].asset.value.hex)
      return this.transaction.events[0].asset.asset_id.split('::')[1] + ' #' + result.value
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
