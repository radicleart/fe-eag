<template>
<div v-if="!loading" class="ml-5 bg-light">
  <CollectionsNavigation :loopRun="loopRun" :gaiaAsset="gaiaAsset"/>
  <b-container fluid class="px-5 text-white mt-5">
    <div v-if="!loading && gaiaAsset && loopRun">
      <NftDisplay v-on="$listeners" :gaiaAsset="gaiaAsset" :loopRun="loopRun"/>
    </div>
  </b-container>
</div>
</template>

<script>
import NftDisplay from '@/views/marketplace/components/gallery/NftDisplay'
import { APP_CONSTANTS } from '@/app-constants'
import CollectionsNavigation from '@/views/marketplace/components/gallery/CollectionsNavigation'

export default {
  name: 'AssetDetails',
  components: {
    NftDisplay,
    CollectionsNavigation
  },
  data: function () {
    return {
      nftIndex: null,
      assetHash: null,
      loading: true,
      gaiaAsset: null,
      loopRun: null,
      contractId: null
    }
  },
  watch: {
    '$route' () {
      this.loadPage()
    }
  },
  mounted () {
    this.loadPage()
  },
  methods: {
    loadPage () {
      this.contractId = this.$route.params.contractId
      if (this.$route.name === 'asset-by-index') {
        this.nftIndex = Number(this.$route.params.nftIndex)
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', { contractId: this.contractId, nftIndex: this.nftIndex }).then((gaiaAsset) => {
          this.$store.dispatch('rpayCategoryStore/fetchLoopRuns').then((loopRuns) => {
            this.gaiaAsset = gaiaAsset
            this.loopRun = loopRuns.find((o) => o.contractId === this.contractId)
            this.$store.dispatch('rpayManageCacheStore/cacheUpdate', { contractId: this.contractId, nftIndex: this.nftIndex })
            this.loading = false
          })
        })
      } else {
        this.assetHash = this.$route.params.assetHash
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndAssetHash', { contractId: this.contractId, assetHash: this.assetHash }).then((gaiaAsset) => {
          this.gaiaAsset = gaiaAsset
          this.$store.dispatch('rpayManageCacheStore/cacheUpdate', { contractId: this.contractId, assetHash: this.assetHash })
          this.loading = false
        })
      }
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
    gaiaAsset1 () {
      if (this.nftIndex || this.nftIndex === 0) {
        return this.$store.getters[APP_CONSTANTS.KEY_ASSET_FROM_NFT_INDEX](this.nftIndex)
      } else {
        return this.$store.getters[APP_CONSTANTS.KEY_GAIA_ASSET_BY_HASH](this.assetHash)
      }
    }
  }
}
</script>

<style scoped>
</style>
