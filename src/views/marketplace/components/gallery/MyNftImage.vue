<template>
<div style="100%" class="bg-light">
  <b-row align-v="center" align-h="center" style="height: 100%;">
    <b-col cols="12" class="text-center">
      <div ref="nftImage">
        <b-link :to="'/nft-preview/' + asset.contractAsset.contractId + '/' + asset.contractAsset.nftIndex">
          <FramedImage :id="'popover-my-nft-' + asset.contractAsset.contractId + '-' + asset.contractAsset.nftIndex" :imageSrc="getImageUrl" style="height: 100%;"/>
        </b-link>
        <MyNftData :asset="asset"/>
      </div>
    </b-col>
  </b-row>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import FramedImage from './FramedImage'
import MyNftData from './MyNftData'

export default {
  name: 'MyNftImage',
  components: {
    FramedImage,
    MyNftData
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
    marketplace () {
      return this.$route.name === 'nft-marketplace' || this.$route.name === 'nft-collection'
    },
    myNfts () {
      return this.$route.name === 'my-nfts'
    },
    nftPage () {
      return this.$route.name.startsWith('asset-by-')
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
