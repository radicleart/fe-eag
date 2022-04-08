<template>
<div>
  <div class="container">
    <div class="box">
      <b-link :to="'/nft-collection/' + loopRun.currentRunKey">
      <FramedImage :options="{ 'width': '600px', 'height': '600px' }" :id="'popover-image-' + index" :imageSrc="getCollectionImageUrl(loopRun)"/>
      <CollectionData :loopRun="loopRun" :index="index"/>
    </b-link>
    </div>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CollectionData from './CollectionData'
import FramedImage from './FramedImage'

export default {
  name: 'CollectionImage',
  components: {
    CollectionData,
    FramedImage
  },
  props: ['loopRun', 'index', 'options'],
  data () {
    return {
      showOverlay: false
    }
  },
  mounted () {
  },
  methods: {
    getCollectionImageUrl (item) {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](item)
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
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
.box {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0.8;  /* for demo purpose  */
}
</style>
