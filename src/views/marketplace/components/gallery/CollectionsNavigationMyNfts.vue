<template>
<b-container id="col-nav" fluid class="py-0 mx-0 px-0 bg-light">
  <div class="d-flex text-primary">
    <div id="popover-my-nfts" :class="(!loopRun) ? 'bg-white' : ''" class="py-2 px-4 border-right"><b-link to="/my-nfts">My NFTs</b-link></div>
    <MyNftData/>
    <div v-if="loopRun">
      <div :class="(filter ===  'collection') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right"><b-link :to="'/my-nfts/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
    </div>
    <div v-if="asset">
      <div :class="(filter ===  'asset') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right"># {{asset.contractAsset.nftIndex}}</div>
    </div>
    <div v-else v-for="(lr, index) in allLoopRuns" :key="index">
      <div :class="(loopRun && loopRun.currentRunKey ===  lr.currentRunKey) ? 'bg-white' : ''" class="py-2 px-4 border-right"><b-link :id="'popover-image-' + index" :to="'/my-nfts/' + lr.currentRunKey">{{lr.currentRun}}</b-link></div>
      <CollectionPopover :loopRun="lr" :index="index"/>
    </div>
  </div>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'
import CollectionPopover from './CollectionPopover'
import MyNftData from './MyNftData'

export default {
  name: 'CollectionsNavigation',
  components: {
    CollectionPopover,
    MyNftData
  },
  props: ['loopRun', 'asset', 'context', 'filter', 'pagingData'],
  data () {
    return {
      iconSN: require('@/assets/img/EAG - WEB UX assets - png/EAG - search neon.png'),
      iconSG: require('@/assets/img/EAG - WEB UX assets - png/EAG - search grey.png'),
      searching: false,
      currentRunKey: null
    }
  },
  mounted () {
    this.currentRunKey = this.$route.params.collectionId
  },
  methods: {
  },
  computed: {
    allLoopRuns () {
      let loopRuns = this.$store.getters[APP_CONSTANTS.GET_LOOP_RUNS]
      loopRuns = loopRuns.filter((o) => o.status !== 'disabled')
      return utils.sortLoopRuns(loopRuns)
    }
  }
}
</script>
<style scoped>
</style>
