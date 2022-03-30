<template>
<div v-if="loopRun" class="bg-light">
  <CollectionsNavigation :context="'minting'" :loopRun="loopRun" />
  <b-container fluid class="px-5 mt-5">
    <b-row :key="componentKey">
      <b-col>
        <b-row class="">
          <b-col sm="7" xs="12">
            <div>
              <img :src="mintImage" width="100%"/>
            </div>
          </b-col>
          <b-col sm="5" xs="12">
            <b-row>
              <b-col>
                <h1 class="border-bottom mb-5">{{loopRun.currentRun}}</h1>
                <p>{{loopRun.makerName}}</p>
                <p class="mt-5" v-if="loopRun.description" v-html="preserveWhiteSpace(loopRun.description)"></p>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <div v-if="mintPasses <  0">Checking for mint passes</div>
                <div v-else-if="walletTx">
                  <a :href="transactionUrl()" target="_blank"><b-icon class="text-warning" font-scale="1.2" icon="arrow-up-right-circle"/> view on explorer</a>
                </div>
                <PunkMintHelper v-else :loopRun="loopRun" :mintPasses="mintPasses"/>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CollectionsNavigation from '@/views/marketplace/components/gallery/CollectionsNavigation'
import PunkMintHelper from '@/views/marketplace/components/minting/PunkMintHelper'

export default {
  name: 'PunkMinter',
  components: {
    CollectionsNavigation,
    PunkMintHelper
  },
  data () {
    return {
      mintPasses: -1,
      componentKey: 0,
      batchOption: 1,
      configuration: null,
      result: null,
      loopRun: null,
      makerUrlKey: null,
      currentRunKey: null,
      walletTx: false,
      mintImage: null
    }
  },
  watch: {
  },
  mounted () {
    this.makerUrlKey = this.$route.params.maker
    this.currentRunKey = this.$route.params.collection
    this.$store.dispatch('rpayCategoryStore/fetchLoopRun', this.currentRunKey).then((loopRun) => {
      this.loopRun = loopRun
      this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, priceInStx: 0.50 })
      this.configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      this.mintImage = loopRun.mintImage1 || loopRun.image
      if (!this.profile.loggedIn) {
        this.$router.push('/')
        return
      }
      const data = {
        stxAddress: this.profile.stxAddress,
        contractAddress: loopRun.contractId.split('.')[0],
        contractName: loopRun.contractId.split('.')[1],
        currentRunKey: this.$route.params.collection
      }
      this.$store.dispatch('rpayMarketStore/lookupMintPassBalance', data).then((result) => {
        if (result && result.result.value > 0) {
          this.mintPasses = Number(result.result.value)
        } else {
          this.mintPasses = 0
        }
      })
    })
    if (window.eventBus && window.eventBus.$on) {
      const $self = this
      window.eventBus.$on('rpayEvent', function (data) {
        if (data.opcode === 'cancel-minting') {
          $self.$bvModal.hide('minting-modal')
        } else if (data.opcode === 'stx-transaction-sent') {
          $self.$bvModal.hide('minting-modal')
          if (data.txStatus === 'success') {
            $self.walletTx = false
            $self.$store.dispatch('rpayCategoryStore/fetchLoopRun', $self.currentRunKey).then((loopRun) => {
              $self.loopRun = loopRun
              $self.mintImage = $self.loopRun.mintImage1 || $self.loopRun.image
              $self.result = ' status: ' + data.txStatus
              $self.componentKey++
            })
            if (data.functionName === 'mint-token' || data.functionName === 'collection-mint-token') {
              const item = $self.$store.getters[APP_CONSTANTS.KEY_MY_ITEM](data.assetHash)
              $self.saveMintingInfo(item, data)
            } else if (data.assetHashes && (data.functionName === 'mint-token-twenty' || data.functionName === 'collection-mint-token-twenty')) {
              data.assetHashes.forEach((o) => {
                const item = $self.$store.getters[APP_CONSTANTS.KEY_MY_ITEM](o)
                $self.saveMintingInfo(item, data)
              })
            }
          } else if (data.txStatus === 'pending') {
            $self.walletTx = data
            $self.result = ' status: ' + data.txStatus
            $self.mintImage = $self.loopRun.mintImage2 || $self.loopRun.image
          } else {
            $self.result = ' status: ' + data.txStatus
            $self.mintImage = $self.loopRun.image
          }
        }
      })
    }
  },
  methods: {
    saveMintingInfo (item, data) {
      item.mintInfo = {
        txId: data.txId,
        txStatus: data.txStatus
      }
      // this.$store.dispatch('rpayMyItemStore/quickSaveItem', item).then(() => {
      // this.setPending(data)
      // })
    },
    preserveWhiteSpace: function (content) {
      return '<span class="text-description" style="white-space: break-spaces;">DESCRIPTION: ' + content + '</span>'
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
<style lang="scss">
</style>
