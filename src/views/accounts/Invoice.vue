<template>
<b-container class="text-xsmall mb-5" v-if="loaded">
  <b-row>
    <b-col cols="12" class="mb-4 text-right"><b-link to="/account/invoices" class="text-primary">back</b-link></b-col>
  </b-row>
  <b-row>
    <b-col cols="10" class="py-2 mb-2 bg-light text-upper"><span class="text-primary">Payment Details</span></b-col>
    <b-col cols="2" class="py-2 mb-2 bg-light text-upper"><b-link @click="checkTransaction()">refresh</b-link></b-col>
    <b-col cols="4">Reference:</b-col><b-col cols="8">{{invoice.id}}</b-col>
    <b-col cols="4">Created:</b-col><b-col cols="8">{{getCreated}}</b-col>
    <b-col cols="4">Amount:</b-col><b-col cols="8">{{getAmount}}</b-col>
    <b-col cols="4">Status:</b-col><b-col cols="8">{{getStatus}}</b-col>
  </b-row>
  <b-row v-if="transaction && (transaction.tx_status === 'success' || transaction.tx_status === 'pending')">
    <b-col cols="12" class="py-2 mt-1 mb-1 text-upper"><span class="text-primary">Stacks <span v-if="hasEvents()">{{transaction.events[0].asset.asset_event_type}}</span> Transaction</span></b-col>
    <b-col cols="4">Contract:</b-col><b-col cols="8">{{transaction.contract_call.contract_id}}</b-col>
    <b-col cols="4">Sender:</b-col><b-col cols="8">{{transaction.sender_address}}</b-col>
    <b-col cols="4">Recipient:</b-col><b-col cols="8">{{this.invoice.transactionData.recipient}}</b-col>
    <b-col cols="4">Asset:</b-col><b-col cols="8">{{getTokenId()}}</b-col>
    <b-col cols="4"></b-col><b-col cols="8"><a :href="transactionUrl()" target="_blank">View on explorer <b-icon class="text-payments" font-scale="1.2" icon="arrow-up-right-circle"/></a></b-col>
  </b-row>
  <b-row v-else>
    <b-col cols="12" class="pt-2 my-2">
      <h6>NFT Details</h6>
      <p>Stacks transaction failed to confirm. See <a :href="transactionUrl()" target="_blank">here for details <b-icon class="text-payments" font-scale="1.2" icon="arrow-up-right-circle"/></a></p>
    </b-col>
    <b-col cols="4">Contract:</b-col><b-col cols="8">{{transaction.contract_call.contract_id}}</b-col>
    <b-col cols="4">Sender:</b-col><b-col cols="8">{{transaction.sender_address}}</b-col>
    <b-col cols="4">Recipient:</b-col><b-col cols="8">{{this.invoice.transactionData.recipient}}</b-col>
    <b-col cols="4">Asset:</b-col><b-col cols="8">{{getTokenId()}}</b-col>
    <b-col cols="4"></b-col><b-col cols="8"><a :href="transactionUrl()" target="_blank">View on explorer <b-icon class="text-payments" font-scale="1.2" icon="arrow-up-right-circle"/></a></b-col>
  </b-row>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import { DateTime } from 'luxon'

export default {
  name: 'Invoice',
  components: {
  },
  data () {
    return {
      loaded: false,
      invoice: null,
      transaction: null
    }
  },
  mounted () {
    this.$store.dispatch('merchantStore/fetchPurchase', this.$route.params.paymentId).then((invoice) => {
      if (invoice && invoice.created_at) {
        this.invoice = invoice
      } else {
        this.invoice = invoice
      }
      this.checkTransaction()
    })
  },
  methods: {
    checkTransaction () {
      this.$store.dispatch('merchantStore/checkTransaction', this.invoice).then((t) => {
        this.transaction = t
        this.loaded = true
      })
    },
    transactionUrl: function () {
      return 'https://explorer.stacks.co/txid/' + this.getTransactionId() + '?chain=' + process.env.VUE_APP_NETWORK
    },
    getTransactionId: function () {
      if (!this.invoice.transactionData.stacksmateResponse || this.invoice.transactionData.txStatus === 'errored') return null
      try {
        const resp = JSON.parse(this.invoice.transactionData.stacksmateResponse)
        // if (typeof resp === 'object') resp = resp.txid
        if (!resp.txid.startsWith('0x')) resp.txid = '0x' + resp.txid
        return resp.txid
      } catch (e) {
        return null
      }
    },
    hasEvents () {
      return (this.transaction && this.transaction.events && this.transaction.events.length > 0)
    },
    getTokenId () {
      return this.invoice.transactionData.assetName + ' #' + this.invoice.transactionData.nftIndex
    }
  },
  computed: {
    getType () {
      const inv = this.$store.getters[APP_CONSTANTS.KEY_HISTORIC_INVOICE](this.invoice.id)
      if (inv.created_at) {
        return 'bitcoin'
      }
      return 'card'
    },
    getCreated () {
      const inv = this.$store.getters[APP_CONSTANTS.KEY_HISTORIC_INVOICE](this.invoice.id)
      let dt = null
      if (inv.created_at) {
        dt = DateTime.fromMillis(Number(inv.created_at * 1000))
      } else {
        dt = DateTime.fromISO(inv.createdAt)
      }
      return dt.toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    getAmount () {
      const inv = this.$store.getters[APP_CONSTANTS.KEY_HISTORIC_INVOICE](this.invoice.id)
      const precision = 100000000
      let amountStr = null
      if (inv.currency === 'BTC') {
        amountStr = Math.round(inv.amount * precision) / precision / precision + ' BTC'
      } else {
        amountStr = Math.round(inv.amountFiat * 100) / 10000 + ' ' + inv.currency
      }
      return amountStr
    },
    getStatus () {
      const inv = this.$store.getters[APP_CONSTANTS.KEY_HISTORIC_INVOICE](this.invoice.id)
      if (inv.transactionData.txStatus.indexOf('abort') > -1) {
        return inv.status + ' / failed'
      }
      return inv.status + ' / ' + inv.transactionData.txStatus
    },
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style lang="scss" scoped>
.col-4 {
  margin-bottom: 10px;
}
.col-8 {
  margin-bottom: 10px;
}
</style>
