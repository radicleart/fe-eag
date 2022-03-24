<template>
<div class="w-50 flex-columns align-items-middle" v-if="getAmounts">
  <div class="d-flex justify-content-between">
    <div>You send</div>
    <div>You receive</div>
  </div>
  <div class="d-flex justify-content-between">
    <div>{{getAmounts.baseAmounts.amountFiat}} {{getAmounts.baseAmounts.currency}} ({{getAmounts.fiatAmounts.amountFiat}} {{getAmounts.fiatAmounts.currency}})</div>
    <div>to</div>
    <div>{{getAmounts.fiatAmounts.amountStx}} setSuperAdminSTX</div>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
export default {
  name: 'TokenConversions',
  components: {
  },
  data () {
    return {
      defCur: 'EUR'
    }
  },
  methods: {
    fiatSymbol () {
      const exchangeRate = this.$store.getters[APP_CONSTANTS.KEY_EXCHANGE_RATE]
      if (exchangeRate.fiatCurrency === 'EUR') {
        return '&euro;'
      } else if (exchangeRate.fiatCurrency === 'GBP') {
        return '&pound;'
      } else if (exchangeRate.fiatCurrency === 'JPY') {
        return '&yen;'
      } else {
        return '&dollar;'
      }
    },
    changeFiatCurrency (fiatCurrency) {
      if (fiatCurrency) {
        this.defCur = fiatCurrency
        this.$store.commit(APP_CONSTANTS.SET_FIAT_CURRENCY, fiatCurrency)
      } else {
        this.$notify({ type: 'warning', title: 'Exchange Rates', text: 'Rate not available!' })
      }
    },
    truncateAmount (amount) {
      return amount.toFixed(4)
    }
  },
  computed: {
    amountTrunc () {
      const exchangeRate = this.exchangeRate
      // const tunced = Math.round(exchangeRate.amountStx * 10000)
      return (exchangeRate.stxPrice) ? (exchangeRate.stxPrice).toFixed(4) : 0
    },
    getAmounts () {
      const amounts = this.$store.getters[APP_CONSTANTS.KEY_AMOUNTS]
      return amounts
    },
    exchangeRate () {
      const tickerRates = this.$store.getters[APP_CONSTANTS.KEY_TICKER_RATES_UNFILTERED]
      if (tickerRates.length > 0) {
        return tickerRates.find((o) => o.currency === this.defCur)
      }
      return null
    },
    baseAmounts () {
      const baseAmounts = this.$store.getters[APP_CONSTANTS.KEY_AMOUNTS]
      return baseAmounts
    }
  }
}
</script>

<style>
</style>
