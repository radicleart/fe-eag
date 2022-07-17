<template>
<b-container id="col-nav" fluid class="py-0 mx-0 px-0 bg-light">
  <div class="d-flex text-primary">
    <div :class="(!filter) ? 'bg-white' : ''" class="py-2 px-4 "><b-link to="/nft-collections">Collections</b-link></div>
    <div v-if="loopRun">
      <div :class="(filter ===  'collection') ? 'bg-white' : ''" class="py-2 px-4 mx-0 "><b-link :to="'/nft-collection/' + loopRun.contractId">| {{loopRun.currentRun}} |</b-link></div>
    </div>
    <div v-if="asset">
      <div :class="(filter ===  'asset') ? 'bg-white' : ''" class="py-2 px-4 mx-0 ">| # {{asset.contractAsset.nftIndex}} |</div>
    </div>
  </div>
  <div class="px-4 d-flex justify-content-between">
    <div class="border-bottom d-flex justify-content-between" v-if="loopRun && $route.name === 'collection'">
      <div class="d-flex justify-content-start mr-5 pt-1">
        <img :src="iconSG" @click="searching = !searching" v-if="!searching" class="pointer" width="35px" height="35px"/>
        <img :src="iconSG" @click="searching = !searching" v-else class="pointer" width="35px" height="35px"/>
        <SearchBar v-if="searching" :displayClass="'text-small'" v-on="$listeners" :loopRun="loopRun" :mode="loopRun.type"/>
      </div>
    </div>
    <div>
      <MintPassChecker :loopRun="loopRun" class="pb-0"/>
    </div>
    <div>
      <Pagination class="d-flex justify-content-center" v-on="$listeners" :pagingData="pagingData" v-if="pagingData && pagingData.numberOfItems > 0"/>
    </div>
  </div>
</b-container>
</template>

<script>
import Pagination from './common/Pagination'
import SearchBar from '@/views/marketplace/components/gallery/SearchBar'
import MintPassChecker from '@/views/marketplace/components/minting/MintPassChecker'

export default {
  name: 'CollectionsNavigation',
  components: {
    SearchBar,
    Pagination,
    MintPassChecker
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
  }
}
</script>
<style scoped>
</style>
