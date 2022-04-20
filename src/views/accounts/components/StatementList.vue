<template>
<div>
  <h4 class="mb-4 text-upper">Purchase History</h4>
  <b-table hover :items="values()" :fields="fields()" class="bg-transparent text-primary">
    <template #cell(open)="data">
        <span><b-icon class="pointer" @click="gotoPaymentRef(data)" font-scale="1.5" icon="arrow-up-right-circle"/></span>
    </template>
  </b-table>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import { DateTime } from 'luxon'

export default {
  name: 'InFlightPaymentModal',
  components: {
  },
  props: ['payments'],
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    gotoPaymentRef: function (data) {
      this.$router.push('/accounts/statements/' + this.payments[data.index].id)
    },
    getType (payment) {
      if (payment.created_at) {
        return 'bitcoin'
      }
      return 'card'
    },
    getCreated (payment) {
      let dt = null
      if (payment.created_at) {
        dt = DateTime.fromMillis(Number(payment.created_at * 1000))
      } else {
        dt = DateTime.fromISO(payment.createdAt)
      }
      return dt.toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    getStatus (payment) {
      return payment.status + '/' + payment.transactionData.txStatus
    },
    getAmount (payment) {
      const precision = 100000000
      let amountStr = null
      if (payment.currency === 'BTC') {
        amountStr = Math.round(payment.amount * precision) / precision / precision + ' BTC'
      } else {
        amountStr = Math.round(payment.amountFiat * 100) / 10000 + ' ' + payment.currency
      }
      return amountStr
    },
    fields () {
      return ['created', 'status', 'amount', 'open']
    },
    values () {
      let mapped = []
      const $self = this
      mapped = this.payments.map(function (payment) {
        return {
          created: $self.getCreated(payment),
          status: $self.getStatus(payment),
          amount: $self.getAmount(payment)
        }
      })
      return mapped
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
