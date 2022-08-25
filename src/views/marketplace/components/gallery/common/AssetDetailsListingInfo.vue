<template>
<div :class="classes" class="sub-menu" style="min-width: 200px;">
  <b-container>
    <b-row v-if="collection" class="border">
      <b-col cols="12" class="py-2 bg-light border">COLLECTION: {{collection.currentRun}}</b-col>
      <b-col cols="12" class="py-2 bg-light border">NFT: #{{asset.contractAsset.nftIndex}} {{asset.name}}</b-col>
      <b-col cols="12" class="py-2 text-lower">
        <div class="d-flex justify-content-between">
          <div class="">
            <span class="text-upper">ARTIST:</span> {{collection.makerName}}
          </div>
          <!--
          <div class="pointer" @click="showDetails = ! showDetails">
            <b-icon v-if="showDetails" class="text-primary" font-scale="1.5" icon="arrow-down-right-circle"/>
            <b-icon v-else class="text-primary" font-scale="1.5" icon="arrow-up-right-circle"/>
          </div>
          -->
        </div>
      </b-col>
    </b-row>
    <b-row v-else class="border">
      <b-col cols="12" class="py-2 bg-light border">This collection is not currently supported</b-col>
    </b-row>
    <b-row v-if="!collection" class="border-bottom">
      <b-col cols="12" class="py-2 text-lower">
        <div class="d-flex justify-content-between">
          <div class="pointer" >
            {{asset.contractAsset.contractId.split('.')[1]}} #{{asset.contractAsset.nftIndex}}
          </div>
          <!--
          <div class="pointer" @click="showDetails = ! showDetails">
            <b-icon v-if="showDetails" class="text-primary" font-scale="1.5" icon="arrow-down-right-circle"/>
            <b-icon v-else class="text-primary" font-scale="1.5" icon="arrow-up-right-circle"/>
          </div>
          -->
        </div>
      </b-col>
    </b-row>
  </b-container>
  <b-container v-if="showDetails">
    <b-row class="border-bottom">
      <b-col cols="12" class="py-2 text-lower" v-if="asset.contractAsset.owner">
        <OwnerInfo :label="'NFT OWNER: '" :owner="asset.contractAsset.owner" />
      </b-col>
    </b-row>
    <b-row class="border-bottom" v-if="$route.name === 'collection'">
      <b-col cols="12" class="py-2 bg-dark text-white text-center">
        <b-link :to="'/artwork/' + loopRun.contractId + '/' + asset.contractAsset.nftIndex">BUY NOW</b-link>
      </b-col>
    </b-row>
    <b-row class="border-bottom" v-if="$route.name === 'collection' || $route.name === 'artwork-by-index' || $route.name === 'asset-by-index'">
      <b-col cols="12" class="py-2">
        VALUE: {{getMintPriceFormatted()}} STX
      </b-col>
    </b-row>
    <b-row class="border-bottom" v-if="isListedOrUnMinted() && $route.name !== 'my-nfts'">
      <b-col cols="6" class="py-2 text-lower">{{getPriceFormatted()}}</b-col>
      <b-col cols="6" class="py-2 bg-dark text-white text-center">
        <span class="pt-3 pointer" :title="ttBiddingHelp" @click="openPurchaceDialog()">BUY NOW</span>
      </b-col>
    </b-row>
    <b-row class="border-bottom" v-if="$route.name === 'collection' || $route.name === 'artwork-by-index' || $route.name === 'asset-by-index'">
      <b-col cols="12" class="py-2 bg-dark text-white text-left" v-if="loopRun.type === 'SIP-013'">
        NFT fractions available <b-link router-tag="span" v-b-tooltip.hover="{ variant: 'light' }" :title="'Artist is selling percentages of this artwork'" class="ml-2" variant="outline-success"><b-icon icon="question-circle"/></b-link>
      </b-col>
    </b-row>

    <b-row class="border-bottom" v-if="isListedOrUnMinted() && $route.name === 'my-nfts'">
      <b-col cols="12" class="py-2">Listed for: {{getPriceFormatted()}}</b-col>
    </b-row>
    <b-row class="border-bottom" v-if="$route.name === 'my-nfts' && $route.name !== 'asset-by-index'">
      <b-col cols="12">
        <div class="d-flex justify-content-between">
          <b-link v-if="$route.name === 'my-nfts'" :to="'/nft-preview/' + asset.contractAsset.contractId + '/' + asset.contractAsset.nftIndex">manage</b-link>
          <b-link v-if="$route.name !== 'asset-by-index'" :to="'/nfts/' + asset.contractAsset.contractId + '/' + asset.contractAsset.nftIndex">display</b-link>
        </div>
      </b-col>
    </b-row>
    <b-row class="border" v-if="loopRun.status !== 'unrevealed'">
      <b-col cols="12" class="border bg-white py-2">
        <div><a class="text-primary" :href="transactionUrl()" target="_blank">show on explorer <!--<b-icon class="text-info" font-scale="1.5" icon="arrow-up-right-circle"/>--></a></div>
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
  name: 'AssetDetailsListingInfo',
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
      this.$store.dispatch('stacksApiStore/fetchLoopRunByContractId', this.asset.contractAsset.contractId).then((loopRun) => {
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
    getMintPriceFormatted () {
      return formatUtils.fmtAmount(this.loopRun.mintPrice * 100, 'stx')
    },
    formatNumber: function (number) {
      return utils.formatNumber(number)
    },
    isListedOrUnMinted: function () {
      if (this.asset.contractAsset.listingInUstx && this.asset.contractAsset.listingInUstx.price) {
        return this.asset.contractAsset.listingInUstx.price > 0
      } else if (!this.asset.contractAsset.nftIndex) {
        return true
      }
      return false
    },
    openPurchaceDialog: function () {
      this.$emit('openModal', { opcode: 'open-purchase', asset: this.asset, loopRun: this.collection })
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
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
