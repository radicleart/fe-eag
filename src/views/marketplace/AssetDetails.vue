<template>
<div v-if="loaded" class="ml-5 bg-light">
  <CollectionNavigation :loopRun="loopRun" :asset="gaiaAsset" :filter="'asset'"/>
  <b-container style="height: auto;" fluid class="px-5 mt-5">
    <div v-if="gaiaAsset && loopRun">
      <SftDisplay v-if="loopRun.type === 'SIP-013'" v-on="$listeners" :gaiaAsset="gaiaAsset" :events="events" :loopRun="loopRun"/>
      <NftDisplay v-else v-on="$listeners" :gaiaAsset="gaiaAsset" :events="events" :loopRun="loopRun"/>
    </div>
  </b-container>
</div>
</template>

<script>
import SftDisplay from '@/views/marketplace/components/gallery/SftDisplay'
import NftDisplay from '@/views/marketplace/components/gallery/NftDisplay'
import { APP_CONSTANTS } from '@/app-constants'
import CollectionNavigation from '@/views/marketplace/components/gallery/CollectionNavigation'
import utils from '@/services/utils'

export default {
  name: 'AssetDetails',
  components: {
    NftDisplay,
    SftDisplay,
    CollectionNavigation
  },
  data: function () {
    return {
      nftIndex: null,
      events: null,
      commissions: null,
      assetHash: null,
      loaded: false,
      gaiaAsset: null,
      loopRun: null,
      contractId: null
    }
  },
  watch: {
    '$route' () {
      this.loadPage()
    }
  },
  mounted () {
    this.loadPage()
  },
  methods: {
    loadPage () {
      this.contractId = this.$route.params.contractId
      this.nftIndex = Number(this.$route.params.nftIndex)
      this.$store.dispatch('rpayCategoryStore/fetchLoopRunByContractId', this.contractId).then((loopRun) => {
        this.loopRun = loopRun
        if (loopRun.type !== 'SIP-01333333') {
          this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', { contractId: this.contractId, nftIndex: this.nftIndex }).then((gaiaAsset) => {
            this.gaiaAsset = gaiaAsset
            if (!gaiaAsset.contractAsset) this.gaiaAsset.contractAsset = this.getToken(loopRun)
            this.$store.dispatch('rpayManageCacheStore/cacheUpdate', { contractId: this.contractId, nftIndex: this.nftIndex })
            this.loadNFTMints()
          })
        } else {
          this.gaiaAsset = { contractAsset: this.getToken(loopRun) }
          this.$store.dispatch('stacksApiStore/fetchMetaData', this.gaiaAsset).then((metaData) => {
            this.gaiaAsset.image = metaData.image
            if (metaData.properties && metaData.properties.full_size_image) {
              this.gaiaAsset.image = metaData.properties.full_size_image
            }
            this.loadNFTMints()
          })
        }
      })
    },
    getToken (loopRun) {
      const ipfsUrl = loopRun.punkImageIPFSUrl
      return {
        contractId: loopRun.contractId,
        nftIndex: this.nftIndex,
        tokenInfo: { metaDataUrl: ipfsUrl.replace(/\{id\}/, this.nftIndex) }
      }
    },
    loadCommissions (loopRun) {
      const data = {
        stxAddress: this.profile.stxAddress,
        contractId: loopRun.contractId,
        contractAddress: loopRun.contractId.split('.')[0],
        contractName: loopRun.contractId.split('.')[1],
        currentRunKey: this.$route.params.collection
      }
      this.$store.dispatch('rpayMarketGenFungStore/getCommissionTokensByContract', data).then((commissions) => {
        this.commissions = commissions
        this.loadNFTMints()
      })
    },
    loadNFTMints: function () {
      let url = '/extended/v1/tokens/nft/history?'
      // let url = '/extended/v1/tokens/nft/mints?'
      const assetIdentifier = this.loopRun.contractId + '::' + this.loopRun.assetName
      url += 'asset_identifier=' + assetIdentifier
      url += '&value=' + utils.serializeToHex(this.gaiaAsset.contractAsset.nftIndex)
      // url += '&value=' + '0x' + (this.nftIndex.toString(16).padStart(2, '0'))
      const txOptions = {
        path: url,
        httpMethod: 'GET',
        postData: {
          arguments: [],
          sender: null // this.profile.stxAddress
        }
      }
      this.$store.dispatch('rpayStacksStore/callApi', txOptions).then((result) => {
        if (result.total > 0) {
          this.events = this.values(result.results)
        }
        this.loaded = true
      })
    },
    values (events) {
      let mapped = []
      mapped = events.map(function (event) {
        const ep = utils.tokenIdOwnerFromRpr(event.value)
        return {
          recipient: event.recipient,
          event_index: event.event_index,
          tx_id: event.tx_id,
          nftIndex: ep.nftIndex,
          owner: ep.owner,
          sender: 'eag',
          asset_event_type: 'mint'
        }
      })
      if (mapped && mapped.length > 0) mapped = mapped.filter((o) => o.nftIndex === this.nftIndex)
      return mapped
    },
    parseRunKey (gaiaAsset) {
      if (gaiaAsset && gaiaAsset.properties && gaiaAsset.properties.collectionId) {
        if (gaiaAsset.properties.collectionId.indexOf('/') > -1) {
          return gaiaAsset.properties.collectionId.split('/')[1]
        } else {
          return gaiaAsset.properties.collectionId
        }
      }
      const runKey = this.$store.getters[APP_CONSTANTS.KEY_RUN_KEY_FROM_META_DATA_URL](gaiaAsset.contractAsset)
      if (runKey && runKey.indexOf('.json') === -1) {
        return runKey
      }
      return process.env.VUE_APP_DEFAULT_LOOP_RUN
    },
    getArtistPrismicId () {
      const artistId = this.$store.getters[APP_CONSTANTS.KEY_CONTENT_ARTIST_ID](this.gaiaAsset.artist)
      return artistId
    }
  },
  computed: {
    gaiaAsset1 () {
      if (this.nftIndex || this.nftIndex === 0) {
        return this.$store.getters[APP_CONSTANTS.KEY_ASSET_FROM_NFT_INDEX](this.nftIndex)
      } else {
        return this.$store.getters[APP_CONSTANTS.KEY_GAIA_ASSET_BY_HASH](this.assetHash)
      }
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
