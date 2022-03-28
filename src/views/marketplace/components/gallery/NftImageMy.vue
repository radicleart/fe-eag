<template>
<div>
  <b-row align-v="center" align-h="center" style="height: 100%;">
    <b-col class="text-center">
      <b-link :to="'/nfts/' + asset.contractAsset.contractId + '/' +  asset.contractAsset.nftIndex">
        <div ref="nftImage">
          <img @mouseover="showDetail()" class="pointer collection-image" :src="getImageUrl"/>
        </div>
      </b-link>
    </b-col>
    <b-col class="text-left">
      <ListingInfo v-on="$listeners" :asset="asset" :loopRun="loopRun" :context="'collection'"/>
    </b-col>
  </b-row>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'

export default {
  name: 'NftImageMy',
  components: {
    ListingInfo
  },
  props: ['loopRun', 'asset'],
  data () {
    return {
      showOverlay: false
    }
  },
  mounted () {
  },
  methods: {
    showDetail () {
      this.showOverlay = true
    },
    hideDetail () {
      this.showOverlay = false
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    },
    getImageUrl () {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.asset)
    }
  }
}
</script>
<style scoped>
.container {
    width: 100%;
    height: 100%;
    position: relative;
    margin: 20px;
}
.stack-top {
    z-index: 9;
    position: relative;
    top: -200px;
    left: 10px;
    margin: 0px;
    padding: 20px;
    width: 50%;
}

</style>
