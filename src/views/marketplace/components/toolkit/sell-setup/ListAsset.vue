<template>
<div class="mx-5 d-flex justify-content-center" v-if="!loading">
  <div class="mx-auto">
    <b-card-group :key="componentKey">
      <b-card class="text-whiter border-dark p-3" bg-variant="dark" header-tag="header" footer-tag="footer">
        <!-- <SellingHeader :allowEdit="true"/> -->
        <b-card-text>
          <div>
            Listed for <span class="text-warning">{{contractAsset.listingInUstx.price}}</span> STX
          </div>
          <div class="mt-3">
            Commission:<br/>
            <span class="text-warning">{{loopRun.commissionContractId}}</span>
          </div>
          <div class="w-100 mb-3" role="group" v-if="sipTenTokens">
            <label for="status-name">Mint With Token</label>
            <b-form-select @change="changeToken" id="status-name" v-model="tokenContractId" :options="tokenOptions()"></b-form-select>
          </div>
          <div class="w-100 mb-3" role="group" v-if="sipTenToken">
            <h2 for="status-name">Off Chain Sale</h2>
            <div v-html="sipTenToken.description"></div>
          </div>
          <b-input-group>
            <b-form-input type="number" v-model="buyNowOrStartingPrice" class="input" placeholder="STX"></b-form-input>
          </b-input-group>
          <div>{{errorMessage}}</div>
        </b-card-text>
        <template v-slot:footer>
          <div class="mt-5 d-flex justify-content-between">
            <b-button @click="$emit('cancel')" class="w-50 mr-1" variant="light">Cancel</b-button>
            <b-button @click="listItem()" class="w-50 ml-1" variant="outline-warning">List</b-button>
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
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'ListAsset',
  components: {
  },
  props: ['contractAsset', 'loopRun'],
  data () {
    return {
      componentKey: 0,
      errorMessage: null,
      sellingMessage: null,
      loading: true,
      buyNowOrStartingPrice: 0,
      sipTenTokens: null,
      sipTenToken: null,
      tokenContractId: null
    }
  },
  mounted () {
    if (this.loopRun.marketplaceVersion > 2) {
      this.$store.dispatch('rpayMarketGenFungStore/sipTenTokenFindBy').then((sipTenTokens) => {
        if (sipTenTokens) {
          this.sipTenTokens = sipTenTokens
          this.sipTenToken = sipTenTokens[0]
          this.tokenContractId = this.sipTenToken.contractId
          this.$notify({ type: 'success', title: 'Available Tokens', text: 'List NFT for x tokens' })
        }
        this.loading = false
      })
    } else {
      this.loading = false
    }
    /**
    this.$store.dispatch('rpayStacksStore/fetchMacSkyWalletInfo').then(() => {
      this.$store.commit('rpayStore/setDisplayCard', 100)
      this.loading = false
    }).catch(() => {
      this.loading = false
      this.setPage()
    })
    **/
  },
  methods: {
    minted () {
      return this.contractAsset
    },
    changeToken: function (choice) {
      this.sipTenToken = this.sipTenTokens.find((o) => o.contractId === choice)
      this.tokenContractId = choice
    },
    tokenOptions () {
      const options = []
      this.sipTenTokens.forEach((o) => {
        options.push({ text: o.symbol, value: o.contractId })
      })
      return options
    },
    listItem () {
      this.errorMessage = null
      if (!this.isValid()) return
      const data = {
        sendAsSky: true,
        contractAddress: this.contractAsset.contractId.split('.')[0],
        contractName: this.contractAsset.contractId.split('.')[1],
        commissionContractAddress: this.loopRun.commissionContractId.split('.')[0],
        commissionContractName: this.loopRun.commissionContractId.split('.')[1],
        decimals: this.sipTenToken.decimals,
        nftIndex: this.contractAsset.nftIndex,
        price: Number(this.buyNowOrStartingPrice)
      }
      if (this.tokenContractId) {
        data.tokenContractAddress = this.tokenContractId.split('.')[0]
        data.tokenContractName = this.tokenContractId.split('.')[1]
      }
      let method = 'rpayMarketStore/listInUstx'
      if (this.loopRun.marketplaceVersion === 3) {
        method = 'rpayMarketGenFungStore/listInToken'
      }
      this.$store.dispatch(method, data).then((result) => {
        this.result = result
      }).catch((error) => {
        console.log(error)
        this.sellingMessage = null
      })
    },
    delistItem () {
      const data = {
        sendAsSky: true,
        contractAddress: this.contractAsset.contractId.split('.')[0],
        contractName: this.contractAsset.contractId.split('.')[1],
        nftIndex: this.contractAsset.nftIndex
      }
      this.$store.dispatch('rpayMarketStore/unlistInUstx', data).then((result) => {
        this.result = result
      }).catch((error) => {
        console.log(error)
        this.sellingMessage = null
      })
    },
    isValid: function () {
      this.errorMessage = null
      if (this.buyNowOrStartingPrice === 0) {
        this.$notify({ type: 'error', title: 'Listing Error', text: 'Please set the price' })
        return false
      }
      return true
    },
    setPage () {
      this.loading = false
      const displayCard = this.$store.getters[APP_CONSTANTS.KEY_DISPLAY_CARD]
      if (!displayCard) {
        this.$store.commit('rpayStore/setDisplayCard', 100)
      }
    }
  },
  computed: {
    displayCard () {
      const displayCard = this.$store.getters[APP_CONSTANTS.KEY_DISPLAY_CARD]
      return displayCard
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
