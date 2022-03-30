<template>
<div v-if="!loading">
  <div class="mx-auto">
    <b-card-group>
      <b-card class="border-dark p-3" style="width: 100%;" bg-variant="dark" header-tag="header" footer-tag="footer">
        <!-- <SellingHeader :allowEdit="true"/> -->
        <b-card-text class="text-whiter">
          <div>
            <span class="text-warning mr-3">Listed for</span>
            <span class="text-warning mr-3">{{contractAsset.listingInUstx.price}}</span>
            <span class="text-warning mr-3" v-if="contractAsset.listingInUstx.token">{{contractAsset.listingInUstx.symbol}}</span>
            <span v-else class="text-warning">STX</span>
          </div>
          <div class="mt-3">
            Commission:<br/>
            <span class="text-warning text-xsmall">{{loopRun.commissionContractId.split('.')[1]}}</span>
          </div>
        </b-card-text>
        <template v-slot:footer>
          <div class="mt-5 d-flex justify-content-between">
            <b-button @click="$emit('cancel')" class="w-50 mr-1" variant="light">Cancel</b-button>
            <b-button @click="delistItem()" class="w-50 ml-1" variant="outline-warning">Unlist</b-button>
          </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</div>
<div v-else>
  Waiting for asset.
</div>
</template>

<script>

export default {
  name: 'SellingFlow',
  components: {
  },
  props: ['contractAsset', 'loopRun'],
  data () {
    return {
      loading: true,
      sipTenTokens: null,
      sipTenToken: null
    }
  },
  mounted () {
    if (this.loopRun.marketplaceVersion > 2) {
      this.$store.dispatch('rpayMarketGenFungStore/sipTenTokenFindBy').then((sipTenTokens) => {
        if (sipTenTokens) {
          this.sipTenTokens = sipTenTokens
          this.sipTenToken = sipTenTokens[0]
          this.$notify({ type: 'success', title: 'Available Tokens', text: 'List NFT for x tokens' })
        }
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  methods: {
    delistItem () {
      const data = {
        sendAsSky: true,
        contractAddress: this.contractAsset.contractId.split('.')[0],
        contractName: this.contractAsset.contractId.split('.')[1],
        nftIndex: this.contractAsset.nftIndex
      }
      let method = 'rpayMarketStore/unlistInUstx'
      if (this.loopRun.marketplaceVersion === 3) {
        method = 'rpayMarketGenFungStore/unlistInToken'
      }
      this.$store.dispatch(method, data).then((result) => {
        this.result = result
      }).catch((error) => {
        console.log(error)
      })
    }
  },
  computed: {
  }
}
</script>
<style lang="scss" scoped>
</style>
