<template>
<div v-if="!loading">
  <div v-if="flowType === 1">
    <PurchaseOfferLogin :offerData="offerData" @registerByEmail="registerByEmail" @backStep="backStep"/>
  </div>
  <div v-else>
    <div>
      <div v-if="contractAsset && contractAsset.listingInUstx && contractAsset.listingInUstx.price > 0">
        <PurchaseBuyNow v-if="contractAsset.listingInUstx.name !== 'off-chain'" :contractAsset="contractAsset" :listingInUstx="contractAsset.listingInUstx" @buyNow="buyNow"/>
        <div class="text-danger" v-html="errorMessage"></div>
      </div>
      <div v-else>
        Asset not on sale.
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PurchaseBuyNow from './PurchaseBuyNow'
import PurchaseOfferLogin from './PurchaseOfferLogin'

export default {
  name: 'PurchaseFlow',
  components: {
    PurchaseOfferLogin,
    PurchaseBuyNow
  },
  props: ['gaiaAsset', 'forceOfferFlow', 'loopRun'],
  data () {
    return {
      errorMessage: null,
      loading: true,
      offerStage: 0,
      offerData: {},
      biddingData: {},
      biddingEndTime: null,
      flowType: 0,
      webWalletNeeded: false
    }
  },
  mounted () {
    this.errorMessage = null
    this.$store.dispatch('rpayStacksStore/fetchMacSkyWalletInfo').then(() => {
      this.$store.commit('merchantStore/setDisplayCard', 100)
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  },
  methods: {
    buyNow: function () {
      const contractAsset = this.gaiaAsset.contractAsset
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      if (!this.loopRun.commissionContractId) {
        this.$notify({ type: 'warning', title: 'Unable to Process', text: 'The commission contract is missing - goto to the collection settings and add the contractId of your commission contract.' })
        return
      }
      if (!profile.loggedIn) {
        this.$store.dispatch('rpayAuthStore/startLogin').then(() => {
          this.$store.dispatch('rpayCategoryStore/fetchLatestLoopRunForStxAddress', { currentRunKey: process.env.VUE_APP_DEFAULT_LOOP_RUN, stxAddress: profile.stxAddress }, { root: true })
        }).catch((err) => {
          console.log(err)
          // https://www.hiro.so/wallet/install-web
          this.webWalletNeeded = true
        })
      } else {
        const commission = contractAsset.listingInUstx.commission
        const buyNowData = {
          contractAddress: contractAsset.contractId.split('.')[0],
          contractName: contractAsset.contractId.split('.')[1],
          commissionContractAddress: commission.split('.')[0],
          commissionContractName: commission.split('.')[1],
          tokenContractAddress: (contractAsset.listingInUstx.token) ? contractAsset.listingInUstx.token.split('.')[0] : null,
          tokenContractName: (contractAsset.listingInUstx.token) ? contractAsset.listingInUstx.token.split('.')[1] : null,
          assetName: this.loopRun.assetName,
          owner: contractAsset.owner,
          price: contractAsset.listingInUstx.price,
          nftIndex: contractAsset.nftIndex,
          decimals: contractAsset.listingInUstx.decimals,
          tokenAssetName: contractAsset.listingInUstx.name
        }
        let methos = 'rpayMarketStore/buyInUstx'
        if (this.loopRun.marketplaceVersion === 3) {
          methos = 'rpayMarketGenFungStore/buyInToken'
        }
        this.$store.dispatch(methos, buyNowData).then((result) => {
          this.result = result
          this.flowType = 2
        }).catch((err) => {
          this.errorMessage = err
          this.flowType = 3
        })
      }
    },
    minted () {
      const contractAsset = this.gaiaAsset.contractAsset
      if (!contractAsset) return
      return contractAsset.nftIndex > -1
    }
  },
  computed: {
    contractAsset () {
      return this.gaiaAsset.contractAsset
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
