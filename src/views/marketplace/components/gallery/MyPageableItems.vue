<template>
<div>
<div v-if="clicked && currentRunKey === 'crash_punks_v1'" class="text-center">
  <div class="mt-5 pt-5">Request sent - thank you. Your Crash Punks will be upgraded shortly...</div>
  <div class="mt-5 pt-5">Transactions are taking some time at the moment. Please be patient and you will see the # of V2 Crash Punk NFTs in your wallet after your transaction is in an anchor block - this site will take a little longer to reflect the update.</div>
  <div class="mt-2"></div>
  <div class="mt-5 pt-5">
    <a :href="transactionUrl()" target="_blank"><span class="text-warning ml-3">Track via the explorer</span></a>
  </div>
  <div class="mt-5 pt-5">How to read your transaction status: If your transaction is pending, it will go through, just please wait a while. Once your transaction status is picked up by the micro-block, it will go into the anchor block, and you have successfully upgraded. The NFTs will take some time to display back here.</div>
</div>
<div v-else>
  <div v-if="!loading">
    <h1 class="pointer mb-4 border-bottom"><b-icon font-scale="0.6" icon="chevron-right"/> {{tokenCount}} NFTs</h1>
    <div v-if="currentRunKey === 'crash_punks_v2' && tokenCount === 0">
      You currently have 0 Crash Punks on v2 - if you already upgraded they will appear here soon. If not, please make sure to upgrade <b-link class="text-warning" :to="'/my-nfts/crash_punks_v1'">here</b-link>
    </div>
    <div class="mb-4" v-if="resultSet && resultSet.length > 0">
      <div>
        <Pagination @changePage="gotoPage" :pageSize="pageSize" :numberOfItems="numberOfItems" v-if="numberOfItems > 0"/>
        <div id="my-table" class="row" v-if="resultSet && resultSet.length > 0">
          <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 mx-0 p-0" v-for="(asset, index) of resultSet" :key="index">
            <NftImage v-on="$listeners" @update="update" :loopRun="loopRun" :asset="asset"/>
          </div>
        </div>
        <div class="d-flex justify-content-start my-3 mx-4" v-else>
          <div class="mt-5">
            <p>No NFTs found for this collection...</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="numberOfItems > 0">Loading NFTs...</div>
  </div>
</div>
</div>
</template>

<script>
import NftImage from './NftImage'
import Pagination from './common/Pagination'
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'MyPageableItems',
  components: {
    NftImage,
    Pagination
  },
  props: ['loopRun'],
  data () {
    return {
      trait: '',
      clicked: false,
      resultSet: [],
      tokenCount: null,
      pageSize: 200,
      loading: true,
      doPaging: true,
      numberOfItems: 0,
      componentKey: 0,
      nowOnPage: 0,
      currentRunKey: null
    }
  },
  mounted () {
    this.loading = false
    this.currentRunKey = this.$route.params.collectionId
    if (!this.currentRunKey) {
      // currentRunKey = process.env.VUE_APP_DEFAULT_LOOP_RUN
      this.loaded = true
    } else {
      this.$store.dispatch('rpayCategoryStore/fetchLoopRun', this.currentRunKey).then((loopRun) => {
        this.loopRun = loopRun
        this.loaded = true
      })
    }
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
        pageSize: this.pageSize
      }
      if (process.env.VUE_APP_NETWORK === 'local') {
        data.stxAddress = 'STFJEDEQB1Y1CQ7F04CS62DCS5MXZVSNXXN413ZG'
      }
      this.$store.dispatch('rpayStacksContractStore/fetchMyTokensCPSV2', data).then((result) => {
        this.resultSet = result.gaiaAssets // this.resultSet.concat(results)
        this.tokenCount = result.tokenCount
        this.numberOfItems = result.gaiaAssets.length
        this.loading = false
      })
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    },
    mintCounter () {
      const application = this.$store.getters[APP_CONSTANTS.KEY_APPLICATION_FROM_REGISTRY_BY_CONTRACT_ID](process.env.VUE_APP_STACKS_CONTRACT_ADDRESS + '.' + process.env.VUE_APP_STACKS_CONTRACT_NAME)
      return application.tokenContract.mintCounter
    }
  }
}
</script>
<style>
</style>
