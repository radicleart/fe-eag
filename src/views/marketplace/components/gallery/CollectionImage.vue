<template>
<div>
  <div class="container">
    <div class="box">
      <b-link :to="'/nft-collection/' + loopRun.currentRunKey"><img :id="'popover-image-' + index" class="pointer collection-image" :src="getCollectionImageUrl(loopRun)"/></b-link>
    </div>
    <b-popover placement="topleft" triggers="hover" variant="light" :target="'popover-image-' + index" custom-class="my-popover-class">
      <template #title><b-link :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></template>
        <div class="py-2">{{loopRun.makerName}}</div>
        <div class="py-2 border-top">LIMIT: {{loopRun.versionLimit}}</div>
    </b-popover>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'CollectionImage',
  components: {
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
    showDetail () {
      this.$refs['popover-' + this.index].$emit('open')
    },
    hideDetail () {
      this.$refs['popover-' + this.index].$emit('close')
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
.my-popover-class {
    position: relative;
    top: -20px;
    left: -200px;
}

</style>
