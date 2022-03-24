<template>
<b-container fluid class="py-0 mx-0 px-0 bg-light">
  <div class="d-flex text-tab">
    <div class="py-2 px-4 bg-white border-right"><b-link to="/nft-collections">Collections</b-link></div>
    <div v-if="loopRun">
      <div class="py-2 px-4 mx-0 border-right"><b-link :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
    </div>
    <div v-if="gaiaAsset">
      <div class="py-2 px-4 mx-0 border-right"># {{gaiaAsset.contractAsset.nftIndex}}</div>
    </div>
    <div class="d-flex text-tab" v-if="!loopRun">
      <div class="py-2 px-4 mx-0 border-right">Featured</div>
      <div class="py-2 px-4 mx-0 border-right">Latest Listings</div>
      <div class="py-2 px-4 mx-0 border-right">Upcoming</div>
    </div>
  </div>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'

export default {
  name: 'CollectionsNavigation',
  components: {
  },
  props: ['loopRun', 'gaiaAsset'],
  data () {
    return {
      loaded: false
    }
  },
  mounted () {
  },
  methods: {
    showCollection (loopRun) {
      this.$emit('update', { opcode: 'show-collection', loopRun: loopRun })
    },
    getCollectionImageUrl (item) {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](item)
    }
  },
  computed: {
    rightMargin () {
      const loopRuns = this.$store.getters[APP_CONSTANTS.GET_LOOP_RUNS]
      return utils.sortLoopRuns(loopRuns)
    },
    allLoopRuns () {
      const loopRuns = this.$store.getters[APP_CONSTANTS.GET_LOOP_RUNS]
      return utils.sortLoopRuns(loopRuns)
    },
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
<style scoped>
</style>
