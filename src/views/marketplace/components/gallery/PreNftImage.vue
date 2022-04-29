<template>
<div v-if="loaded">
  <div class="d-flex justify-content-start">
    <div class="text-center">
      <b-link :to="'/artwork/' + asset.contractAsset.contractId + '/' +  asset.contractAsset.nftIndex">
        <div ref="nftImage">
          <!-- <img class="pointer collection-image" :src="getImageUrl"/> -->
          <FramedImage :options="{ 'width': '400px', 'min-height': '100px' }" :imageSrc="image" :forSale="forSale"/>
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
import FramedImage from './FramedImage'
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'

export default {
  name: 'PreNftImage',
  components: {
    FramedImage,
    ListingInfo
  },
  props: ['loopRun', 'asset'],
  data () {
    return {
      loaded: false,
      image: null
    }
  },
  mounted () {
    this.$store.dispatch('stacksApiStore/fetchMetaData', this.asset).then((metaData) => {
      if (metaData) {
        this.image = metaData.image
      }
      this.loaded = true
    })
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
      return this.image
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
