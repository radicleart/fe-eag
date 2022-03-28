<template>
<div class="bg-white text-primary mr-5 text-small">
  <b-container v-if="context === 'collection'">
    <b-row class="py-2 border-bottom">
      <b-col cols="12">{{loopRun.currentRun}} #{{asset.contractAsset.nftIndex}}</b-col>
    </b-row>
    <b-row class="py-2 border-bottom">
      <b-col cols="12">{{loopRun.makerName}}</b-col>
    </b-row>
    <b-row class="py-2 border-bottom" v-if="asset.name">
      <b-col cols="12">{{asset.name}}</b-col>
    </b-row>
    <b-row class="py-2 border-bottom">
      <b-col cols="12">
        <OwnerInfo :owner="asset.contractAsset.owner" />
      </b-col>
    </b-row>
    <b-row class="m-4 border-bottom" v-if="isListed()">
      <b-col cols="6" class="py-2">{{getPriceFormatted()}}</b-col>
      <b-col cols="6" class="py-2 bg-dark text-white text-center">
        <span class="pt-3 pointer" :title="ttBiddingHelp" @click="openPurchaceDialog()">BUY NOW</span>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>
<script>
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'
import formatUtils from '@/services/formatUtils.js'
import OwnerInfo from '@/views/marketplace/components/gallery/common/OwnerInfo'

export default {
  name: 'ListingInfo',
  components: {
    OwnerInfo
  },
  props: ['context', 'asset', 'loopRun'],
  data () {
    return {
    }
  },
  mounted () {
    const $self = this
    if (window.eventBus && window.eventBus.$on) {
      window.eventBus.$on('rpayEvent', function (data) {
        $self.$bvModal.hide('purchase-modal')
      })
    }
  },
  methods: {
    getPriceFormatted () {
      return formatUtils.fmtAmount(this.asset.contractAsset.listingInUstx.price, 'stx') + ' ' + this.asset.contractAsset.listingInUstx.symbol
    },
    formatNumber: function (number) {
      return utils.formatNumber(number)
    },
    isListed: function () {
      if (this.asset.contractAsset.listingInUstx && this.asset.contractAsset.listingInUstx.price) {
        return this.asset.contractAsset.listingInUstx.price > 0
      }
      return false
    },
    openPurchaceDialog: function () {
      this.$emit('openModal', { opcode: 'open-purchase', asset: this.asset, loopRun: this.loopRun })
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    },
    usdAmount () {
      try {
        const tickerRates = this.$store.getters[APP_CONSTANTS.KEY_TICKER_RATES]
        const rate = tickerRates.find((o) => o.currency === 'USD')
        const offer = this.$store.getters[APP_CONSTANTS.KEY_HIGHEST_OFFER_ON_ASSET](this.asset.contractAsset.tokenInfo.assetHash)
        const currentOffer = (offer && offer.amount) ? offer.amount : 0
        const minimumOffer = Math.max(currentOffer, (this.asset.contractAsset.saleData.reservePrice))
        const amountUsd = Number(utils.toDecimals(rate.stxPrice * minimumOffer)).toLocaleString()
        return 'Current highest offer: ' + amountUsd + ' USD'
      } catch (e) {
        return null
      }
    },
    ttBiddingHelp () {
      const tooltip = this.$store.getters[APP_CONSTANTS.KEY_TOOL_TIP]('tt-bidding-help')
      return (tooltip) ? tooltip[0].text : ''
    }
  }
}
</script>
<style>
</style>
