<template>
<b-row class="py-2 my-2 border-bottom">
  <b-col>{{getCreated}}</b-col>
  <b-col>{{getStatus}}</b-col>
  <b-col>{{getAmount}}</b-col>
  <b-col>{{getType}}</b-col>
  <b-col><span class="pointer" @click="gotoPaymentRef()">open</span></b-col>
</b-row>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import { DateTime } from 'luxon'

export default {
  name: 'LineItem',
  components: {
  },
  props: ['invoice'],
  data () {
    return {
    }
  },
  mounted () {
    if (this.invoice.transactionData.txStatus === 'pending' || this.invoice.transactionData.txStatus === 'processing') {
      this.$store.dispatch('merchantStore/checkTransaction', this.invoice)
    }
  },
  methods: {
    gotoPaymentRef: function () {
      this.$router.push('/account/invoices/' + this.invoice.id)
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
<style lang="scss">
</style>
