<template>
<div>
  <div class="container" @mouseout="hideDetail()">
    <div class="box">
      <b-link :to="'/nft-collection/' + loopRun.currentRunKey"><img @mouseover="showDetail()" class="pointer collection-image" :src="getCollectionImageUrl(loopRun)"/></b-link>
    </div>
    <div class="bg-white text-tab box stack-top" v-if="showOverlay">
        <div class="py-2">{{loopRun.currentRun}}</div>
        <div class="py-2 border-top">{{loopRun.makerName}}</div>
        <div class="py-2 border-top">LIMIT: {{loopRun.versionLimit}}</div>
    </div>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'CollectionImage',
  components: {
  },
  props: ['loopRun'],
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
    },
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
