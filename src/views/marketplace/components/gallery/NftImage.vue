<template>
<div>
  <div class="d-flex justify-content-start">
    <div class="text-center">
      <b-link :to="'/nfts/' + asset.contractAsset.contractId + '/' +  asset.contractAsset.nftIndex">
        <div ref="nftImage">
          <!-- <img class="pointer collection-image" :src="getImageUrl"/> -->
          <FramedImage :options="{ 'width': '400px', 'min-height': '100px' }" :imageSrc="getImageUrl" :forSale="forSale"/>
        </div>
      </b-link>
    </div>
    <div class="text-left mr-5">
      <ListingInfo class="mx-4 collection-listing" :classes="'collection-listing-panel'" v-on="$listeners" :asset="asset" :loopRun="loopRun" :context="'collection'"/>
    </div>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'
import FramedImage from './FramedImage'

export default {
  name: 'NftImage',
  components: {
    ListingInfo,
    FramedImage
  },
  props: ['loopRun', 'asset'],
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
    forSale () {
      return this.asset.contractAsset.listingInUstx && this.asset.contractAsset.listingInUstx.price > 0
    },
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
