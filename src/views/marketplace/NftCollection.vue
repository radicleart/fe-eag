<template>
<div v-if="loaded && (loopRun && loopRun.status !== 'disabled')" class="bg-light">
  <CollectionNavigation @updateResults="updateResults" @changePage="gotoPage" :loopRun="loopRun" :filter="filter" :pagingData="pagingData"/>
  <b-container fluid class="px-5 mt-5">
    <b-row>
      <b-col cols="12" style="min-height: 50vh">
        <div class="mb-4">
          <PageableItems v-on="$listeners" :resultSet="resultSet" :loopRun="loopRun" :mintEvents="mintEvents"/>
        </div>
      </b-col>
    </b-row>
  </b-container>
</div>
<b-container v-else>
  Looking up Collection.
  <span v-if="loopRun && loopRun.status === 'disabled'">This collection can't be shown at the present time.</span>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PageableItems from '@/views/marketplace/components/gallery/PageableItems'
import CollectionNavigation from '@/views/marketplace/components/gallery/CollectionNavigation'

const STX_CONTRACT_ADDRESS = process.env.VUE_APP_STACKS_CONTRACT_ADDRESS
const STX_CONTRACT_NAME = process.env.VUE_APP_STACKS_CONTRACT_NAME

export default {
  name: 'NftCollection',
  components: {
    CollectionNavigation,
    PageableItems
  },
  watch: {
    '$route' () {
      // this.reload()
    }
  },
  data () {
    return {
      pagingData: {
        pageSize: 10,
        offset: 1,
        numberOfItems: 0
      },
      resultSet: null,
      componentKey: 0,
      loaded: false,
      filter: 'collection',
      mintPasses: -1,
      defQuery: {
        query: null,
        allCollections: 'one',
        onSale: false,
        onAuction: false,
        editions: false,
        createdBefore: null,
        createdAfter: null,
        sortField: 'nftIndex',
        sortDir: 'sortDown'
      },
      minted: false,
      numbTokens: 0
    }
  },
  mounted () {
    this.contractId = this.$route.params.contractId
    this.loadCollection()
    if (this.$route.params.offset) this.pagingData.offset = Number(this.$route.params.offset)
    if (this.$route.params.pageSize) this.pagingData.pageSize = Number(this.$route.params.pageSize)
    if (this.pagingData.pageSize > 100) this.pagingData.pageSize = 50
    const $self = this
    let resizeTimer
    if (this.loopRun) this.pagingData.numberOfItems = this.loopRun.tokenCount

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
    loadCollection () {
      const data = {
        contractId: this.contractId,
        nftIndex: 1
      }
      this.$store.dispatch('stacksApiStore/initAssetDetails', data).then(() => {
        this.reload(this.loopRun)
      })
    },
    reload (loopRun) {
      if (loopRun.status === 'unrevealed') {
        this.resultSet = []
        const ipfsUrl = loopRun.punkImageIPFSUrl
        for (let i = 1; i <= loopRun.versionLimit; i++) {
          this.resultSet.push({
            contractAsset: {
              contractId: loopRun.contractId,
              nftIndex: i,
              tokenInfo: { metaDataUrl: ipfsUrl.replace(/\{id\}/, i) }
            }
          })
        }
        this.tokenCount = loopRun.versionLimit
        this.pagingData.numberOfItems = loopRun.versionLimit
        this.$emit('tokenCount', { numbTokens: loopRun.versionLimit })
        this.loaded = true
      } else {
        this.fetchPage(this.pagingData.offset - 1, false, this.defQuery)
      }
    },
    updateResults (data) {
      this.defQuery = data.query
      this.$router.push('/nft-collection/' + this.loopRun.contractId + '?' + this.getQueryString(this.defQuery))
      this.fetchPage(this.pagingData.offset - 1, true, this.defQuery)
    },
    gotoPage (page) {
      this.$router.push('/nft-collection/' + this.loopRun.contractId + '/' + page + '/' + this.pagingData.pageSize)
      this.fetchPage(page - 1, true, this.defQuery)
    },
    fetchPage (page, reset, query) {
      // NB adding the contract id negates the search by runKey (ie by collectionId)
      const data = {
        runKey: (this.loopRun) ? this.loopRun.currentRunKey : null,
        query: this.getQueryString(query),
        page: page,
        pageSize: this.pagingData.pageSize
      }
      this.resultSet = []
      if (query.allCollections !== 'all') {
        data.contractId = (this.loopRun) ? this.loopRun.contractId : STX_CONTRACT_ADDRESS + '.' + STX_CONTRACT_NAME
        this.$store.dispatch('rpayStacksContractStore/fetchTokensByContractId', data).then((result) => {
          this.resultSet = result.gaiaAssets
          this.resultSet.forEach((asset) => {
            asset.mintEvents = this.filterMints(asset.mintEvents, asset.contractAsset.nftIndex)
          })
          this.tokenCount = result.tokenCount
          this.pagingData.numberOfItems = result.tokenCount
          this.$emit('tokenCount', { numbTokens: result.tokenCount })
          if (reset) this.componentKey++
          this.loaded = true
        })
      } else {
        this.$store.dispatch('rpayStacksContractStore/fetchTokensByFilters', data).then((result) => {
          this.resultSet = result.gaiaAssets
          this.tokenCount = result.tokenCount
          this.pagingData.numberOfItems = result.tokenCount
          this.$emit('tokenCount', { numbTokens: result.tokenCount })
          if (reset) this.componentKey++
          this.loaded = true
        })
      }
    },
    filterMints (mintEvents, nftIndex) {
      if (!mintEvents) return
      return mintEvents.filter((o) => o.nftIndex === nftIndex)
    },
    getQueryString (query) {
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
      return queryStr
    },
    tokenCount (data) {
      this.numbTokens = data.numbTokens
    },
    refresh (data) {
      if (data.opcode === 'show-collection') {
        if (this.$route.path !== '/nft-marketplace/' + data.loopRun.makerUrlKey + '/' + data.loopRun.currentRunKey) this.$router.push('/nft-marketplace/' + data.loopRun.makerUrlKey + '/' + data.loopRun.currentRunKey)
      }
    },
    resetFilters () {
      this.defQuery.allCollections = 'one'
      this.defQuery.query = null
      this.defQuery.onAuction = false
      this.defQuery.onSale = false
      this.defQuery.allEditions = false
      this.defQuery.claims = null
      this.defQuery.sortField = 'nftIndex'
      this.defQuery.sortDir = 'sortDown'
    },
    update (data) {
      if (data.opcode === 'show-collection') {
        this.resetFilters()
        if (this.$route.path !== '/nft-marketplace/' + data.loopRun.makerUrlKey + '/' + data.loopRun.currentRunKey) this.$router.push('/nft-marketplace/' + data.loopRun.makerUrlKey + '/' + data.loopRun.currentRunKey)
      } else if (data.opcode === 'show-search') {
        if (data.showSearch) {
          this.defQuery.allCollections = 'all'
        } else {
          this.defQuery.allCollections = 'one'
        }
      }
      this.componentKey++
    },
    getCollectionImageUrl (item) {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](item)
    }
  },
  computed: {
    loopRun () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_CURRENT_COLLECTION]
    },
    mintEvents () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_MINT_EVENTS_FOR_TOKEN](this.nftIndex)
    },
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
