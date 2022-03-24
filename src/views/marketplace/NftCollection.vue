<template>
<div v-if="loaded && (loopRun && loopRun.status !== 'disabled')" class="ml-5 bg-light">
  <CollectionsNavigation :loopRun="loopRun" />
  <b-container :key="componentKey" fluid class="px-5 text-white mt-5">
    <b-row>
      <b-col cols="12">
        <div class="mb-4" v-if="(loopRun.status === 'unrevealed' || loopRun.status === 'active' || loopRun.status === 'inactive')">
          <PageableItems v-on="$listeners" @updateResults="updateResults" @tokenCount="tokenCount" :defQuery="defQuery" :loopRun="loopRun"/>
        </div>
      </b-col>
    </b-row>
  </b-container>
</div>
<b-container v-else>
  Collection not found.
  <span v-if="loopRun && loopRun.status === 'disabled'">This collection can't be shown at the present time.</span>
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PageableItems from '@/views/marketplace/components/gallery/PageableItems'
import CollectionsNavigation from '@/views/marketplace/components/gallery/CollectionsNavigation'

export default {
  name: 'NftCollection',
  components: {
    CollectionsNavigation,
    PageableItems
  },
  watch: {
    '$route' () {
      this.reload()
    }
  },
  data () {
    return {
      loaded: false,
      mintPasses: 0,
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
      loopRun: null,
      componentKey: 0,
      minted: false,
      numbTokens: 0
    }
  },
  mounted () {
    this.reload()
  },
  methods: {
    reload () {
      this.$store.dispatch('rpayCategoryStore/fetchLoopRun', this.$route.params.collectionId).then((loopRun) => {
        if (!loopRun) {
          this.$router.push('/')
        }
        this.loopRun = loopRun
        if (this.profile.loggedIn) {
          const data = {
            stxAddress: this.profile.stxAddress,
            contractAddress: loopRun.contractId.split('.')[0],
            contractName: loopRun.contractId.split('.')[1],
            currentRunKey: this.loopRun.currentRunKey
          }
          this.$store.dispatch('rpayMarketStore/lookupMintPassBalance', data).then((result) => {
            if (result && result.result && result.result.value > 0) {
              this.mintPasses = Number(result.result.value)
            }
          })
        }
        this.loaded = true
      })
    },
    availableMessage () {
      if (this.loopRun.versionLimit - this.loopRun.tokenCount > 0) {
        return this.loopRun.versionLimit - this.loopRun.tokenCount + ' available to mint'
      } else {
        return this.loopRun.versionLimit + ' minted'
      }
    },
    tokenCount (data) {
      this.numbTokens = data.numbTokens
    },
    updateResults (data) {
      this.defQuery = data.query
      this.componentKey++
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
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
