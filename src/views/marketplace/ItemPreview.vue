<template>
<div v-if="loaded" class="ml-5 bg-light">
  <CollectionsNavigationMyNfts v-if="loopRun" :context="'item-preview'" :loopRun="loopRun" :asset="item" :filter="'asset'"/>
  <b-container style="height: auto;" fluid class="px-5 mt-5">
    <b-row :key="componentKey" style="min-height: 50vh;" >
      <b-col lg="7" sm="12" class="mb-5">
        <MediaItemGeneral :classes="'hash1-image'" :options="options" :asset="item"/>
        <div class="text-left text-small mt-3">
          <b-link v-if="loopRun.currentRunKey" :to="'/my-nfts/' + loopRun.currentRunKey"><b-icon icon="chevron-left"/> Back</b-link>
          <b-link v-else :to="'/my-nfts'"><b-icon icon="chevron-left"/> Back</b-link>
        </div>
      </b-col>
      <b-col lg="5" sm="12" class="my-5">
        <div>
          <div class="mb-2 d-flex justify-content-between">
            <h2 class="d-block border-bottom mb-5">{{mintedMessage}}</h2>
            <ItemActionMenu :item="item" :loopRun="loopRun" v-if="loopRun && item && !item.contractAsset"/>
          </div>
          <h6 v-if="item.artist" class="text-small">By : {{item.artist}}</h6>
        </div>
        <!--
        <p v-if="profile.superAdmin">
          <a target="_blank" :href="cacheUrl()">read from cache</a>
        </p>
        -->
        <div v-if="item.balance === 0">You no longer own this item</div>
        <div v-else>
          <p v-if="item.description" class="pt-4 text-small" v-html="preserveWhiteSpace(item.description)"></p>
          <MintInfo v-if="loopRun.currentRunKey" :item="item" :loopRun="loopRun"/>
          <PendingTransactionInfo v-if="pending && pending.txStatus === 'pending'" :pending="pending"/>
          <div v-else-if="iAmOwner">
            <MintingTools v-if="loopRun.currentRunKey" class="w-100" :item="item" :loopRun="loopRun" @processChainEvent="processChainEvent"/>
          </div>
        </div>
        <div>
          <NftHistory v-if="loopRun.currentRunKey" class="mt-5" @update="processChainEvent" @setPending="setPending" :loopRun="loopRun"  :gaiaAsset="item"/>
        </div>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import MediaItemGeneral from '@/views/marketplace/components/media/MediaItemGeneral'
import ItemActionMenu from '@/views/marketplace/components/update/ItemActionMenu'
import PendingTransactionInfo from '@/views/marketplace/components/toolkit/nft-history/PendingTransactionInfo'
import NftHistory from '@/views/marketplace/components/toolkit/nft-history/NftHistory'
import MintInfo from '@/views/marketplace/components/toolkit/mint-setup/MintInfo'
import MintingTools from '@/views/marketplace/components/toolkit/MintingTools'
import CollectionsNavigationMyNfts from '@/views/marketplace/components/gallery/CollectionsNavigationMyNfts'

export default {
  name: 'ItemPreview',
  components: {
    CollectionsNavigationMyNfts,
    MediaItemGeneral,
    NftHistory,
    MintingTools,
    PendingTransactionInfo,
    MintInfo,
    ItemActionMenu
  },
  data: function () {
    return {
      loaded: false,
      contractId: null,
      componentKey: 0,
      nftIndex: null,
      assetHash: null,
      pending: null,
      message: 'No item available...'
    }
  },
  mounted () {
    this.nftIndex = Number(this.$route.params.nftIndex)
    this.contractId = this.$route.params.contractId
    this.state = this.$route.query.state
    this.fetchItem()
  },
  methods: {
    processChainEvent (data) {
      if (data.opcode !== 'cancel') {
        this.componentKey++
        this.setPending(data)
      }
    },
    cacheUrl () {
      return process.env.VUE_APP_RISIDIO_API + '/mesh/v2/cache/update-by-index/' + this.loopRun.contractId + '/' + this.item.contractAsset.nftIndex
    },
    fetchItem () {
      const data = {
        contractId: this.contractId,
        nftIndex: this.nftIndex,
        stxAddress: this.profile.stxAddress
      }
      this.$store.dispatch('stacksApiStore/initSingleAsset', data).then(() => {
        this.loaded = true
      })
    },
    setPending (result) {
      if (result) {
        const data = {
          contractId: this.loopRun.contractId
        }
        if (!result || !result.txStatus || result.txStatus === 'pending') {
          this.pending = result
        } else if (result.txStatus === 'success' && result.functionName.indexOf('mint-token') > -1) {
        } else if (result.txStatus === 'success' && result.functionName.indexOf('mint-token') === -1) {
          data.nftIndex = result.nftIndex
          this.updateCacheByNftIndex(data)
        } else {
          this.$notify({ type: 'danger', title: 'Transaction Info', text: 'Transaction failed - check blockchain for cause.' })
        }
      }
      this.pending = result
    },
    updateCacheByHash (data) {
      this.$store.dispatch('rpayStacksContractStore/updateCacheByHash', data).then((result) => {
        if (result && typeof result.nftIndex !== 'undefined') {
          this.nftIndex = result.nftIndex
          data.nftIndex = result.nftIndex
          this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', data).then(() => {
            this.fetchItem()
          })
        } else {
          this.fetchItem()
        }
      })
    },
    updateCacheByNftIndex (data) {
      this.$store.dispatch('rpayStacksContractStore/updateCacheByNftIndex', data).then(() => {
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', data).then(() => {
          this.fetchItem()
        })
      })
    },
    preserveWhiteSpace: function (content) {
      return '<span class="text-description" style="white-space: break-spaces;">' + content + '</span>'
    }
  },
  computed: {
    item () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_GAIA_ASSET](this.nftIndex)
    },
    loopRun () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_CURRENT_COLLECTION]
    },
    mintEvents () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_MINT_EVENTS_FOR_TOKEN](this.nftIndex)
    },
    mintedMessage () {
      if (this.item.contractAsset && this.loopRun && this.loopRun.type === 'punks') {
        return this.loopRun.currentRun + ' #' + this.item.contractAsset.nftIndex
      }
      if (this.item.contractAsset && this.item.name) {
        return '#' + this.item.contractAsset.nftIndex + ' ' + this.item.name
      }
      return '#' + this.item.contractAsset.nftIndex
    },
    runKey () {
      const defaultLoopRun = process.env.VUE_APP_DEFAULT_LOOP_RUN
      let runKey = (this.item && this.item.attributes.collection) ? this.item.attributes.collection : defaultLoopRun
      if (runKey.indexOf('/') > -1) {
        runKey = runKey.split('/')[0]
      }
      return runKey
    },
    transactionUrl: function () {
      if (!this.item.mintInfo || !this.item.mintInfo.txId) return '#'
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      let txId = this.item.mintInfo.txId
      if (!txId.startsWith('0x')) txId = '0x' + txId
      return stacksApiUrl + '/txid/' + txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    options () {
      const videoOptions = {
        emitOnHover: true,
        playOnHover: false,
        bigPlayer: true,
        assetHash: this.assetHash,
        autoplay: false,
        muted: false,
        controls: true,
        showMeta: false,
        poster: this.item.image,
        sources: [
          { src: (this.item.properties) ? this.item.properties.animation_url : null }
        ],
        fluid: true
      }
      return videoOptions
    },
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    },
    iAmOwner () {
      if (process.env.VUE_APP_NETWORK === 'local') {
        return this.item.contractAsset && (this.item.contractAsset.owner === 'STFJEDEQB1Y1CQ7F04CS62DCS5MXZVSNXXN413ZG' || this.item.contractAsset.owner === this.profile.stxAddress)
      }
      return this.item.contractAsset && this.item.contractAsset.owner === this.profile.stxAddress
    },
    minted () {
      // const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      // return !this.item.contractAsset && this.item.contractAsset.owner === profile.stxAddress
      return this.item.contractAsset
    },
    attributes () {
      return this.item.attributes
    }
  }
}
</script>

<style>
</style>
