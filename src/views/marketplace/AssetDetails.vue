<template>
<div v-if="loaded" class="ml-5 bg-light" :key="componentKey">
  <CollectionNavigation :loopRun="loopRun" :asset="gaiaAsset" :filter="'asset'"/>
  <b-container style="height: auto;" fluid class="px-5 mt-5">
    <div class="d-flex justify-content-between">
      <div class="my-auto"><b-link :to="prevNft"><b-icon icon="chevron-left" font-scale="2"></b-icon></b-link></div>
      <div style="width: 100%" v-if="gaiaAsset && loopRun" :key="componentKey">
        <SftDisplay v-if="loopRun.type === 'SIP-013'" v-on="$listeners"/>
        <NftDisplay v-else v-on="$listeners" :gaiaAsset="gaiaAsset" :events="events" :loopRun="loopRun"/>
      </div>
      <div class="my-auto"><b-link :to="nextNft"><b-icon icon="chevron-right" font-scale="2"></b-icon></b-link></div>
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
      loaded: false,
      contractId: null,
      componentKey: 0
    }
  },
  watch: {
    '$route' () {
      // this.loadCollection(true)
      this.nftIndex = Number(this.$route.params.nftIndex)
      this.loadCollection()
      if (!this.gaiaAsset.totalSupply) {
        const data = {
          contractId: this.contractId,
          nftIndex: this.nftIndex
        }
        this.$store.dispatch('stacksApiStore/fetchTotalSupply', data)
      }
    }
  },
  mounted () {
    this.contractId = this.$route.params.contractId
    this.nftIndex = Number(this.$route.params.nftIndex)
    this.loadCollection()
  },
  methods: {
    loadCollection (components) {
      const data = {
        contractId: this.contractId,
        nftIndex: this.nftIndex
      }
      this.$store.dispatch('stacksApiStore/initSingleAsset', data).then(() => {
        this.loaded = true
        this.componentKey++
      })
    }
  },
  computed: {
    gaiaAsset () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_GAIA_ASSET](this.nftIndex)
    },
    loopRun () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_CURRENT_COLLECTION]
    },
    mintEvents () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_MINT_EVENTS_FOR_TOKEN](this.nftIndex)
    },
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    },
    nextNft () {
      const parts = this.$route.fullPath.split('/')
      const nftIndex = (this.nftIndex === this.loopRun.versionLimit) ? 1 : (this.nftIndex + 1)
      return '/' + parts[1] + '/' + parts[2] + '/' + nftIndex
    },
    prevNft () {
      const parts = this.$route.fullPath.split('/')
      const nftIndex = (this.nftIndex === 1) ? this.loopRun.versionLimit : (this.nftIndex - 1)
      return '/' + parts[1] + '/' + parts[2] + '/' + nftIndex
    }
  }
}
</script>

<style scoped>
</style>
