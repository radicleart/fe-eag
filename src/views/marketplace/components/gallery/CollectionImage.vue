<template>
<div>
  <div class="container">
    <div class="box">
      <b-row>
        <b-col cols="11">
          <b-link :to="'/nft-collection/' + loopRun.contractId">
            <CollectionPopover :loopRun="loopRun" :index="index"/>
            <FramedImage :options="{ 'max-width': '400px', 'max-height': '400px' }" :id="'popover-image-' + index" :imageSrc="getCollectionImageUrl(loopRun)"/>
          </b-link>
        </b-col>
        <b-col cols="1" align-self="center" v-if="showNext">
          <div class="pointer" @click="$emit('moveon', index)"><b-icon icon="chevron-right" font-scale="2"/></div>
        </b-col>
      </b-row>
      <div class="mx-5" style="max-width: 500px">
        <h1 class="coll-header">{{loopRun.currentRun}}</h1>
        <p class="coll-body" v-html="loopRun.description"></p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CollectionPopover from './CollectionPopover'
import FramedImage from './FramedImage'

export default {
  name: 'CollectionImage',
  components: {
    CollectionPopover,
    FramedImage
  },
  props: ['loopRun', 'index', 'numbLoopRuns'],
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
    showNext () {
      return this.numbLoopRuns > this.index + 1
    },
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
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
