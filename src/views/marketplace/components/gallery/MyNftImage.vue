<template>
<div>
  <b-row align-v="center" align-h="center" style="height: 100%;">
    <b-col cols="12" class="text-center">
      <b-link :to="'/nfts/' + asset.contractAsset.contractId + '/' +  asset.contractAsset.nftIndex">
        <div ref="nftImage">
          <img @mouseover="showDetail()" class="pointer my-nft-image" :src="getImageUrl"/>
        </div>
      </b-link>
    </b-col>
    <b-col cols="12">
      <div class="d-flex justify-content-between">
        <div>
          <b-link v-if="asset.contractAsset" class="text-small text-primary" :to="'/nft-preview/' + asset.contractAsset.contractId + '/' + asset.contractAsset.nftIndex">manage</b-link>
          <b-link v-else class="text-small text-primary" :to="'/item-preview/' + asset.assetHash + '/1'">mint now</b-link>
        </div>
        <div v-if="!marketplace">
          <b-link v-if="asset.contractAsset" class="text-small text-primary" :to="'/nfts/' + asset.contractAsset.contractId + '/' + contractAsset.nftIndex">marketplace</b-link>
        </div>
      </div>
    </b-col>
  </b-row>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'MyNftImage',
  components: {
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
