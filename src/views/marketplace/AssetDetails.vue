<template>
<div v-if="loaded" class="ml-5 bg-light">
  <CollectionNavigation :loopRun="loopRun" :asset="gaiaAsset" :filter="'asset'"/>
  <b-container style="height: auto;" fluid class="px-5 mt-5">
    <div v-if="gaiaAsset && loopRun" :key="componentKey">
      <SftDisplay v-if="loopRun.type === 'SIP-013'" v-on="$listeners" :gaiaAsset="gaiaAsset" :events="events" :loopRun="loopRun"/>
      <NftDisplay v-else v-on="$listeners" :gaiaAsset="gaiaAsset" :events="events" :loopRun="loopRun"/>
    </div>
  </b-container>
</div>
</template>

<script>
import SftDisplay from '@/views/marketplace/components/gallery/SftDisplay'
import NftDisplay from '@/views/marketplace/components/gallery/NftDisplay'
import { APP_CONSTANTS } from '@/app-constants'
import CollectionNavigation from '@/views/marketplace/components/gallery/CollectionNavigation'

export default {
  name: 'AssetDetails',
  components: {
    NftDisplay,
    SftDisplay,
    CollectionNavigation
  },
  data: function () {
    return {
      nftIndex: null,
      commissions: null,
      assetHash: null,
      loaded: false,
      gaiaAsset: null,
      loopRun: null,
      contractId: null,
      componentKey: 0
    }
  },
  watch: {
    '$route' () {
      this.loadPage(true)
    }
  },
  mounted () {
    this.loadPage()
  },
  methods: {
    loadPage (components) {
      this.contractId = this.$route.params.contractId
      this.nftIndex = Number(this.$route.params.nftIndex)
      this.$store.dispatch('rpayCategoryStore/fetchLoopRunByContractId', this.contractId).then((loopRun) => {
        this.loopRun = loopRun
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', { contractId: this.contractId, nftIndex: this.nftIndex }).then((gaiaAsset) => {
          this.gaiaAsset = gaiaAsset
          if (!gaiaAsset.contractAsset) this.gaiaAsset.contractAsset = this.getToken(loopRun)
          this.$store.dispatch('rpayManageCacheStore/cacheUpdate', { contractId: this.contractId, nftIndex: this.nftIndex })
          this.loadNFTMints(loopRun, this.nftIndex)
          if (components) this.componentKey++
        })
      })
    },
    getToken (loopRun) {
      const ipfsUrl = loopRun.punkImageIPFSUrl
      return {
        contractId: loopRun.contractId,
        nftIndex: this.nftIndex,
        tokenInfo: { metaDataUrl: ipfsUrl.replace(/\{id\}/, this.nftIndex) }
      }
    },
    loadCommissions (loopRun) {
      const data = {
        stxAddress: this.profile.stxAddress,
        contractId: loopRun.contractId,
        contractAddress: loopRun.contractId.split('.')[0],
        contractName: loopRun.contractId.split('.')[1],
        currentRunKey: this.$route.params.collection
      }
      this.$store.dispatch('rpayMarketGenFungStore/getCommissionTokensByContract', data).then((commissions) => {
        this.commissions = commissions
        this.loadNFTMints(this.loopRun, this.nftIndex)
      })
    },
    loadNFTMints: function (loopRun, nftIndex) {
      const data = {
        contractId: this.loopRun.contractId,
        asset_identifier: loopRun.contractId + '::' + loopRun.assetName,
        nftIndex: nftIndex,
        unanchored: true
      }
      this.$store.dispatch('stacksApiStore/fetchMintEvents', data)
      this.$store.dispatch('stacksApiStore/fetchTotalSupply', data).then((totalSupply) => {
        this.gaiaAsset.totalSupply = totalSupply
        this.loaded = true
      })
    },
    parseRunKey (gaiaAsset) {
      if (gaiaAsset && gaiaAsset.properties && gaiaAsset.properties.collectionId) {
        if (gaiaAsset.properties.collectionId.indexOf('/') > -1) {
          return gaiaAsset.properties.collectionId.split('/')[1]
        } else {
          return gaiaAsset.properties.collectionId
        }
      }
      const runKey = this.$store.getters[APP_CONSTANTS.KEY_RUN_KEY_FROM_META_DATA_URL](gaiaAsset.contractAsset)
      if (runKey && runKey.indexOf('.json') === -1) {
        return runKey
      }
      return process.env.VUE_APP_DEFAULT_LOOP_RUN
    },
    getArtistPrismicId () {
      const artistId = this.$store.getters[APP_CONSTANTS.KEY_CONTENT_ARTIST_ID](this.gaiaAsset.artist)
      return artistId
    }
  },
  computed: {
    events () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_MINT_EVENTS]
    },
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>

<style scoped>
</style>
