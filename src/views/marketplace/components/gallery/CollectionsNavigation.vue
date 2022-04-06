<template>
<b-container id="col-nav" fluid class="py-0 mx-0 px-0 bg-light">
  <div class="d-flex justify-content-between">
    <div class="d-flex text-primary">
      <b-nav-item-dropdown :class="(!filter) ? 'bg-white' : ''" class="py-0 px-0" style="list-style: none;" no-caret>
        <template v-slot:button-content>
          <span>Collections</span>
        </template>
        <b-dropdown-item style="list-style: none;" class="no-focus-outline pl-0 m-0" v-for="(lr, index) in allLoopRuns" :key="index">
          <div :class="(loopRun && loopRun.currentRunKey ===  lr.currentRunKey) ? 'bg-white' : ''" class=""><b-link :to="'/nft-collection/' + lr.currentRunKey">{{lr.currentRun}}</b-link></div>
        </b-dropdown-item>
      </b-nav-item-dropdown>
      <div class="d-flex text-primary" v-if="!loopRun">
        <div :class="(filter ===  'featured') ? 'bg-white' : ''" class="py-2 px-4 mx-0  pointer">| <b-link to="/nft-collections?filter=featured">Featured</b-link> |</div>
        <div :class="(filter ===  'latest') ? 'bg-white' : ''" class="py-2 px-4 mx-0  pointer">| <b-link to="/nft-collections?filter=latest">Latest Listings</b-link> |</div>
        <div :class="(filter ===  'upcoming') ? 'bg-white' : ''" class="py-2 px-4 mx-0  pointer">| <b-link to="/nft-collections?filter=upcoming">Upcoming</b-link> |</div>
      </div>
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
