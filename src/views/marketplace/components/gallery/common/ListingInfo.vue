<template>
<div :class="classes" style="min-width: 200px;">
  <b-container>
    <b-row v-if="collection" class="py-2 border-bottom">
      <b-col cols="12">{{collection.currentRun}} #{{asset.contractAsset.nftIndex}}</b-col>
    </b-row>
    <b-row v-if="collection" class="py-2 border-bottom">
      <b-col cols="12">{{collection.makerName}}</b-col>
    </b-row>
    <b-row v-if="!collection" class="py-2 border-bottom">
      <b-col cols="12">{{asset.contractAsset.contractId.split('.')[1]}} #{{asset.contractAsset.nftIndex}}</b-col>
    </b-row>
    <b-row class="py-2 border-bottom">
      <b-col cols="12">
        <div class="d-flex justify-content-between">
          <div v-if="asset.name">{{asset.name}}</div>
          <div v-else>Unamed</div>
          <div class="pointer" @click="showDetails = ! showDetails">
            <b-icon v-if="showDetails" class="text-primary" font-scale="1.5" icon="arrow-down-right-circle"/>
            <b-icon v-else class="text-primary" font-scale="1.5" icon="arrow-up-right-circle"/>
          </div>
        </div>
      </b-col>
    </b-row>
  </b-container>
  <b-container v-if="showDetails">
    <b-row class="py-2 border-bottom">
      <b-col cols="12">
        <OwnerInfo :owner="asset.contractAsset.owner" />
      </b-col>
    </b-row>
    <b-row class="py-2 border-bottom" v-if="isListed() && $route.name !== 'my-nfts'">
      <b-col cols="6" class="py-2">{{getPriceFormatted()}}</b-col>
      <b-col cols="6" class="py-2 bg-dark text-white text-center">
        <span class="pt-3 pointer" :title="ttBiddingHelp" @click="openPurchaceDialog()">BUY NOW</span>
      </b-col>
    </b-row>
    <b-row class="py-2 border-bottom" v-if="isListed() && $route.name === 'my-nfts'">
      <b-col cols="12" class="py-2">Listed for: {{getPriceFormatted()}}</b-col>
    </b-row>
    <b-row class="py-2 border-bottom" v-if="$route.name === 'my-nfts' && $route.name !== 'asset-by-index'">
      <b-col cols="12">
        <div class="d-flex justify-content-between">
          <b-link v-if="$route.name === 'my-nfts'" :to="'/nft-preview/' + asset.contractAsset.contractId + '/' + asset.contractAsset.nftIndex">manage</b-link>
          <b-link v-if="$route.name !== 'asset-by-index'" :to="'/nfts/' + asset.contractAsset.contractId + '/' + asset.contractAsset.nftIndex">display</b-link>
        </div>
      </b-col>
    </b-row>
    <b-row class="py-2 border-bottom">
      <b-col cols="12">
        <div><a :href="transactionUrl()" target="_blank">EXPLORER <!--<b-icon class="text-info" font-scale="1.5" icon="arrow-up-right-circle"/>--></a></div>
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
  props: ['context', 'asset', 'loopRun', 'classes'],
  data () {
    return {
      loaded: false,
      showDetails: false,
      collection: null
    }
  },
  mounted () {
    if (!this.loopRun) {
      this.$store.dispatch('rpayCategoryStore/fetchLoopRunByContractId', this.asset.contractAsset.contractId).then((loopRun) => {
        this.collection = loopRun
        // this.$store.dispatch('rpayStacksContractStore/updateCacheByNftIndex', { contractId: this.contractId, nftIndex: this.nftIndex })
        this.loaded = true
      })
    } else {
      this.collection = this.loopRun
      this.loaded = true
    }

    const $self = this
    if (window.eventBus && window.eventBus.$on) {
      window.eventBus.$on('rpayEvent', function (data) {
        $self.$bvModal.hide('purchase-modal')
      })
    }
  },
  methods: {
    transactionUrl: function (data) {
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + this.asset.contractAsset.contractId + '?chain=' + process.env.VUE_APP_NETWORK
    },
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
      this.$emit('openModal', { opcode: 'open-purchase', asset: this.asset, loopRun: this.collection })
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
