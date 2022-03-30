<template>
<b-container fluid class="py-0 mx-0 px-0 bg-light" v-if="context && context === 'my-nfts'">
  <div class="d-flex text-primary">
    <div id="popover-my-nfts" :class="(!loopRun) ? 'bg-white' : ''" class="py-2 px-4 border-right"><b-link to="/my-nfts">My NFTs</b-link></div>
    <MyNftData/>
    <div v-for="(lr, index) in allLoopRuns" :key="index">
      <div :class="(loopRun && loopRun.currentRunKey ===  lr.currentRunKey) ? 'bg-white' : ''" class="py-2 px-4 border-right"><b-link :id="'popover-image-' + index" :to="'/my-nfts/' + lr.currentRunKey">{{lr.currentRun}}</b-link></div>
      <CollectionData :loopRun="lr" :index="index"/>
    </div>
  </div>
</b-container>
<b-container fluid class="py-0 mx-0 px-0 bg-light" v-else-if="context && context === 'minting'">
  <div class="d-flex text-primary">
    <div :id="'popover-image-1'" class="bg-white py-2 px-4 border-right">Minting</div>
    <CollectionData :loopRun="loopRun" :index="'1'"/>
    <!--
    <div class="py-2 px-4 border-right"><b-link :to="'/my-nfts/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
    -->
  </div>
</b-container>
<b-container fluid class="py-0 mx-0 px-0 bg-light" v-else>
  <div class="d-flex justify-content-between">
    <div class="d-flex text-primary">
      <div :class="(!filter) ? 'bg-white' : ''" class="py-2 px-4 border-right"><b-link to="/nft-collections">Collections</b-link></div>
      <div v-if="loopRun">
        <div :class="(filter ===  'collection') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right"><b-link :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
      </div>
      <div v-if="gaiaAsset">
        <div :class="(filter ===  'asset') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right"># {{gaiaAsset.contractAsset.nftIndex}}</div>
      </div>
      <div class="d-flex text-primary" v-if="!loopRun">
        <div :class="(filter ===  'featured') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right pointer"><b-link to="/nft-collections?filter=featured">Featured</b-link></div>
        <div :class="(filter ===  'latest') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right pointer"><b-link to="/nft-collections?filter=latest">Latest Listings</b-link></div>
        <div :class="(filter ===  'upcoming') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right pointer"><b-link to="/nft-collections?filter=upcoming">Upcoming</b-link></div>
      </div>
    </div>

    <div class="border-bottom d-flex justify-content-between" v-if="loopRun">
      <div class="d-flex justify-content-start mr-5 pt-1">
        <SearchBar v-if="searching" :displayClass="'text-small'" v-on="$listeners" :loopRun="loopRun" :mode="loopRun.type"/>
        <img :src="iconSN" @click="searching = !searching" v-if="!searching" class="pointer icon"/>
        <img :src="iconSG" @click="searching = !searching" v-else class="pointer icon"/>
      </div>
    </div>
  </div>
  <div>
    <Pagination class="d-flex justify-content-center" v-on="$listeners" :pagingData="pagingData" v-if="pagingData && pagingData.numberOfItems > 0"/>
  </div>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'
import Pagination from './common/Pagination'
import SearchBar from '@/views/marketplace/components/gallery/SearchBar'
import CollectionData from './CollectionData'
import MyNftData from './MyNftData'

export default {
  name: 'CollectionsNavigation',
  components: {
    CollectionData,
    MyNftData,
    SearchBar,
    Pagination
  },
  props: ['loopRun', 'gaiaAsset', 'context', 'filter', 'pagingData'],
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
