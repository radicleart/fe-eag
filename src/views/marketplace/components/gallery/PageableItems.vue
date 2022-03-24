<template>
<div class="mb-4" v-if="!loading">
  <div class="border-bottom d-flex justify-content-between" v-if="loopRun">
    <div class="d-flex justify-content-start">
      <!--
      <svg width="50" height="50" viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="50" ry="50" />
      </svg>
      <svg width="50" height="50" viewBox="0 0 100 100" :src="searchGrey">
      </svg>
      <SearchNeon viewBox="0 0 100 100" width="100px" height="auto" class="logo">
      </SearchNeon>
      -->
      <SearchNeon @click="searching = !searching" v-if="!searching" class="pointer icon"/>
      <SearchGrey @click="searching = !searching" v-else class="pointer icon"/>
      <SearchBar v-if="searching" :displayClass="'text-small'" v-on="$listeners" :loopRun="loopRun" :mode="loopRun.type"/>
    </div>
    <div>
      <Pagination @changePage="gotoPage" :pageSize="pageSize" :numberOfItems="numberOfItems" v-if="numberOfItems > 0"/>
    </div>
  </div>
  <vue-horizontal>
    <div v-for="(asset, index) of resultSet" :key="index">
      <NftImage v-on="$listeners" @update="update" :loopRun="loopRun" :asset="asset"/>
    </div>
  </vue-horizontal>
</div>
</template>

<script>
import NftImage from './NftImage'
import Pagination from './common/Pagination'
import { APP_CONSTANTS } from '@/app-constants'
import VueHorizontal from 'vue-horizontal'
import SearchBar from '@/views/marketplace/components/gallery/SearchBar'
import SearchNeon from '@/assets/img/EAG - WEB UX assets/EAG - search icon neon.svg'
import SearchGrey from '@/assets/img/EAG - WEB UX assets/EAG - search icon grey.svg'

const STX_CONTRACT_ADDRESS = process.env.VUE_APP_STACKS_CONTRACT_ADDRESS
const STX_CONTRACT_NAME = process.env.VUE_APP_STACKS_CONTRACT_NAME

export default {
  name: 'PageableItems',
  components: {
    SearchNeon,
    SearchGrey,
    SearchBar,
    NftImage,
    Pagination,
    VueHorizontal
  },
  props: ['loopRun', 'defQuery'],
  data () {
    return {
      searching: false,
      showMpInfo: false,
      resultSet: [],
      edition: null,
      trait: '',
      pageSize: 10,
      offset: 1,
      loading: true,
      doPaging: true,
      numberOfItems: 0,
      componentKey: 0,
      containerHeight: 0
    }
  },
  mounted () {
    this.collection = this.$route.params.collection
    if (this.$route.params.offset) this.offset = Number(this.$route.params.offset)
    if (this.$route.params.pageSize) this.pageSize = Number(this.$route.params.pageSize)
    if (this.pageSize > 100) this.pageSize = 50
    const $self = this
    let resizeTimer
    if (this.loopRun) this.numberOfItems = this.loopRun.tokenCount
    this.fetchPage(this.offset - 1, false, this.defQuery)
    this.loading = false

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        $self.componentKey += 1
      }, 400)
    })
    window.onscroll = () => {
      const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight
      if (bottomOfWindow) {
      }
    }
  },
  methods: {
    update (data) {
      if (data.opcode === 'report-height') {
        this.containerHeight = Math.max(this.containerHeight, data.containerHeight)
      }
    },
    gotoPage (page) {
      this.$router.push('/nft-collection/' + this.loopRun.currentRunKey + '/' + page + '/' + this.pageSize)
      this.fetchPage(page - 1, false, this.defQuery)
    },
    fetchPage (page, reset, query) {
      let queryStr = '?'
      if (this.loopRun && this.loopRun.currentRunKey === 'my_first_word') {
        queryStr += 'sortDir=sortUp&'
      } else {
        queryStr += 'sortDir=' + query.sortDir + '&'
      }
      if (query.query) queryStr += 'query=' + query.query + '&'
      if (query.edition) queryStr += 'edition=' + query.edition + '&'
      if (query.onSale) queryStr += 'onSale=true&'
      if (query.claims) queryStr += 'claims=' + query.claims + '&'
      if (query.editions) queryStr += 'editions=true&'
      if (query.sortField) queryStr += 'sortField=' + query.sortField + '&'
      // NB adding the contract id negates the search by runKey (ie by collectionId)
      const data = {
        runKey: (this.loopRun) ? this.loopRun.currentRunKey : null,
        query: queryStr,
        page: page,
        pageSize: this.pageSize
      }
      this.resultSet = []
      if (query.allCollections !== 'all') {
        data.contractId = (this.loopRun) ? this.loopRun.contractId : STX_CONTRACT_ADDRESS + '.' + STX_CONTRACT_NAME
        this.$store.dispatch('rpayStacksContractStore/fetchTokensByContractId', data).then((result) => {
          this.resultSet = result.gaiaAssets
          this.tokenCount = result.tokenCount
          this.numberOfItems = result.tokenCount
          this.$emit('tokenCount', { numbTokens: result.tokenCount })
          if (reset) this.componentKey++
          this.loading = false
        })
      } else {
        this.$store.dispatch('rpayStacksContractStore/fetchTokensByFilters', data).then((result) => {
          this.resultSet = result.gaiaAssets
          this.tokenCount = result.tokenCount
          this.numberOfItems = result.tokenCount
          this.$emit('tokenCount', { numbTokens: result.tokenCount })
          if (reset) this.componentKey++
          this.loading = false
        })
      }
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style>
.myItemsIntroText {font-weight: 200; font-size: 1.1rem; color: #fff;}
.grid {
  background: #fff;
  max-width: 100%;
}
.mp-info {
  width: 100%;
  height: 100%;
  color: #fff !important;
  /* background: rgb(2,0,36);
  background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(0,1,255,1) 49%, rgba(78,65,142,1) 100%, rgba(11,193,241,1) 100%);
  */
  background: #ccc;
  padding: 50px 10px;
  border: 0px solid green;
  border-radius: 5px;
  text-align: center;
}
/* clearfix */
.grid:after {
  content: '';
  display: block;
  clear: both;
}

/* ---- grid-item ---- */

.grid-item {
  margin: 0 5px 10px 5px;
  min-width: 40%;
  min-height: 120px;
  float: left;
  background: #fff;
  border: 0px solid #ccc;
  border-color: hsla(0, 0%, 0%, 0.5);
  border-radius: 5px;
}

.grid-item--width2 { width: 320px; }
.grid-item--width3 { width: 480px; }
.grid-item--width4 { width: 640px; }

.grid-item--height2 { height: 200px; }
.grid-item--height3 { height: 260px; }
.grid-item--height4 { height: 360px; }

.grid-item--gigante {
  width: 320px;
  height: 360px;
  z-index: 2; /* above other items */
}

.grid-item:hover {
  background: #A2C;
  border-color: white;
  cursor: pointer;
}
</style>
