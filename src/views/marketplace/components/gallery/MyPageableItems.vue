<template>
<div>
  <div v-if="!loading">
    <h1 class="pointer mb-4 border-bottom"><b-icon font-scale="0.6" icon="chevron-right"/> {{tokenCount}} NFTs</h1>
    <div class="mb-4" v-if="resultSet && resultSet.length > 0">
      <div>
        <Pagination @changePage="gotoPage" :pagingData="pagingData" v-if="pagingData.numberOfItems > 0"/>
        <b-row v-if="resultSet && resultSet.length > 0">
          <div class="col-lg-6 col-md-6 col-xs-12" v-for="(asset, index) of resultSet" :key="index">
            <MyNftImage v-on="$listeners" :loopRun="loopRun" :asset="asset"/>
          </div>
        </b-row>
        <div class="d-flex justify-content-start my-3 mx-4" v-else>
          <div class="mt-5">
            <p>No NFTs found for this collection...</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="pagingData.numberOfItems > 0">Loading NFTs...</div>
  </div>
</div>
</template>

<script>
import MyNftImage from './MyNftImage'
import Pagination from './common/Pagination'
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'MyPageableItems',
  components: {
    MyNftImage,
    Pagination
  },
  props: ['loopRun'],
  data () {
    return {
      pagingData: {
        pageSize: 100,
        offset: 1,
        numberOfItems: 0
      },
      trait: '',
      clicked: false,
      resultSet: [],
      tokenCount: null,
      loading: true,
      doPaging: true,
      componentKey: 0,
      nowOnPage: 0,
      currentRunKey: null
    }
  },
  mounted () {
    this.loading = false
    this.fetchPage(0)
    const $self = this
    let resizeTimer
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        $self.componentKey += 1
      }, 400)
    })
    window.onscroll = () => {
      const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight
      if (bottomOfWindow) {
        // $self.page++
        // $self.fetchPage()
      }
    }
  },
  methods: {
    transactionUrl: function () {
      if (!this.result) return
      let txId = this.result.txId
      if (!txId.startsWith('0x')) txId = '0x' + txId
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    gotoPage (page) {
      this.nowOnPage = page - 1
      this.fetchPage(page - 1)
    },
    fetchPage (page) {
      const data = {
        contractId: (this.loopRun) ? this.loopRun.contractId : null,
        stxAddress: this.profile.stxAddress,
        asc: true,
        page: page,
        pageSize: this.pagingData.pageSize
      }
      if (process.env.VUE_APP_NETWORK === 'local') {
        data.stxAddress = 'STFJEDEQB1Y1CQ7F04CS62DCS5MXZVSNXXN413ZG'
      }
      this.$store.dispatch('rpayStacksContractStore/fetchMyTokensCPSV2', data).then((result) => {
        this.resultSet = result.gaiaAssets // this.resultSet.concat(results)
        this.tokenCount = result.tokenCount
        this.pagingData.numberOfItems = result.gaiaAssets.length
        this.loading = false
      })
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
</style>
