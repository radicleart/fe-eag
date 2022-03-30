<template>
<div>
  <div class="container">
    <div class="box">
      <b-link :to="'/nft-collection/' + loopRun.currentRunKey"><img :id="'popover-image-' + index" class="pointer collection-image" :src="getCollectionImageUrl(loopRun)"/></b-link>
    </div>
    <CollectionData :loopRun="loopRun" :index="index"/>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CollectionData from './CollectionData'

export default {
  name: 'CollectionImage',
  components: {
    CollectionData
  },
  props: ['loopRun', 'index'],
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
