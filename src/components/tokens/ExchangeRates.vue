<template>
<b-nav-item-dropdown class="no-focus-outline " no-caret v-if="exchangeRate">
  <template v-slot:button-content>
    <span class="text-info"><StxNeonIcon class="icon"/><span>{{amountTrunc}}</span> <span style="position: relative; left: 0px;" v-html="exchangeRate.currency"></span></span>
  </template>
  <b-dropdown-item class="no-focus-outline pl-0 m-0" v-for="(rate, idx) in tickerRates" :key="idx" @click.prevent="changeFiatCurrency(rate.currency)">
    <div class="d-flex justify-content-between mb-0"><div style="min-width: 60px;">{{rate.currency}}</div> <div style="min-width: 80px;">{{truncateAmount(rate.stxPrice)}} STX</div></div>
  </b-dropdown-item>
</b-nav-item-dropdown>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import StxNeonIcon from '@/assets/img/EAG - WEB UX assets/EAG - stax icon neon.svg'

export default {
  name: 'ExchangeRates',
  components: {
    StxNeonIcon
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
    exchangeRate () {
      const tickerRates = this.$store.getters[APP_CONSTANTS.KEY_TICKER_RATES_UNFILTERED]
      if (tickerRates.length > 0) {
        return tickerRates.find((o) => o.currency === this.defCur)
      }
      return null
    },
    tickerRates () {
      const rates = this.$store.getters[APP_CONSTANTS.KEY_TICKER_RATES_UNFILTERED]
      return rates
    }
  }
}
</script>

<style>
</style>
