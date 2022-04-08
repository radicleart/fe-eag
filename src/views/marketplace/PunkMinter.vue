<template>
<div v-if="loopRun" class="bg-light">
  <CollectionsNavigationMinting :context="'minting'" :loopRun="loopRun" />
  <b-container fluid class="px-5 mt-5">
    <b-row :key="componentKey">
      <b-col>
        <b-row class="">
          <b-col sm="7" xs="12" class="text-right">
            <div>
              <CollectionImage :loopRun="loopRun" :index="'1'"/>
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
                <div v-else-if="transaction && transaction.txStatus === 'pending'">
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
import CollectionsNavigationMinting from '@/views/marketplace/components/gallery/CollectionsNavigationMinting'
import PunkMintHelper from '@/views/marketplace/components/minting/PunkMintHelper'
import CollectionImage from '@/views/marketplace/components/gallery/CollectionImage'

export default {
  name: 'PunkMinter',
  components: {
    CollectionsNavigationMinting,
    PunkMintHelper,
    CollectionImage
  },
  data () {
    return {
      mintPasses: -1,
      componentKey: 0,
      batchOption: 1,
      result: null,
      loopRun: null,
      makerUrlKey: null,
      currentRunKey: null,
      transaction: false,
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
      this.mintImage = loopRun.mintImage1 || loopRun.image
      if (!this.profile.loggedIn) {
        this.$router.push('/')
        return
      }
      const data = {
        stxAddress: this.profile.stxAddress,
        contractId: loopRun.contractId,
        contractAddress: loopRun.contractId.split('.')[0],
        contractName: loopRun.contractId.split('.')[1],
        currentRunKey: this.$route.params.collection
      }
      this.$store.dispatch('rpayTransactionStore/fetchByContractIdAndFrom', data).then((transactions) => {
        if (transactions) {
          transactions = transactions.filter((o) => o.functionName === 'mint-with')
          if (transactions) this.transaction = transactions.reverse()[0]
          if (this.transaction.txStatus === 'pending') {
            this.$store.dispatch('rpayTransactionStore/fetchTransactionFromChainByTxId', this.transaction.txId).then((result) => {
              this.transaction = result
              this.$notify({ type: 'warning', title: 'Check Status', text: 'Transaction status is ' + result.txStatus })
            })
          }
        }
      })
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
          $self.transaction = data
          if (data.txStatus === 'success') {
            $self.$store.dispatch('rpayCategoryStore/fetchLoopRun', $self.currentRunKey).then((loopRun) => {
              $self.loopRun = loopRun
              $self.mintImage = $self.loopRun.mintImage1 || $self.loopRun.image
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
            $self.mintImage = $self.loopRun.mintImage2 || $self.loopRun.image
          } else {
            $self.mintImage = $self.loopRun.image
          }
        }
      })
    }
  },
  methods: {
    transactionUrl: function () {
      if (!this.transaction) return
      return 'https://explorer.stacks.co/txid/' + this.transaction.txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
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
