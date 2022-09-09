<template>
<div v-if="loopRun" class="bg-light">
  <CollectionsNavigationMinting :context="'minting'" :loopRun="loopRun" />
  <b-container fluid class="px-5 mt-5">
    <b-row :key="componentKey">
      <b-col md="7" sm="12" class="text-right">
        <div>
          <CollectionImage :loopRun="loopRun" :index="'1'"/>
        </div>
      </b-col>
      <b-col md="5" sm="12" class="pb-3">
        <b-row style="height: 95%;">
          <b-col class="mt-2 p-3" cols="8" align-self="start">
            <CollectionDataMinting :loopRun="loopRun" :commissions="commissions"/>
          </b-col>
          <b-col cols="12" align-self="end" class="m-3 p-3 mint-helper" v-if="commissions">
            <div class="mb-4 pb-4"><img width="60%" :src="iconLN" /></div>
            <div v-if="mintPasses <  0">Checking for mint passes</div>
            <div v-else-if="transaction && transaction.txStatus === 'pending'">
              <a :href="transactionUrl()" target="_blank">view on explorer <b-icon class="text-primary" font-scale="1.2" icon="arrow-up-right-circle"/></a>
            </div>
            <PunkMintHelper v-else :loopRun="loopRun" :mintPasses="mintPasses" :commissions="commissions"/>
          </b-col>
          <b-col cols="12" align-self="end" class="p-3">
            <OwnerInfo :owner="profile.stxAddress" :context="'minting'" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script>
import CollectionsNavigationMinting from '@/views/marketplace/components/gallery/CollectionsNavigationMinting'
import PunkMintHelper from '@/views/marketplace/components/minting/PunkMintHelper'
import CollectionImage from '@/views/marketplace/components/gallery/CollectionImage'
import CollectionDataMinting from '@/views/marketplace/components/gallery/CollectionDataMinting'
import OwnerInfo from '@/views/marketplace/components/gallery/common/OwnerInfo'

export default {
  name: 'PunkMinter',
  components: {
    CollectionsNavigationMinting,
    PunkMintHelper,
    CollectionDataMinting,
    CollectionImage,
    OwnerInfo
  },
  data () {
    return {
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo grey.png'),
      mintPasses: -1,
      mintEvents: null,
      componentKey: 0,
      batchOption: 1,
      result: null,
      loopRun: null,
      makerUrlKey: null,
      currentRunKey: null,
      transactions: null,
      transaction: false,
      commissions: null,
      mintImage: null
    }
  },
  watch: {
  },
  mounted () {
    this.makerUrlKey = this.$route.params.maker
    this.currentRunKey = this.$route.params.collection
    this.$store.dispatch('stacksApiStore/fetchLoopRun', this.currentRunKey).then((loopRun) => {
      this.loopRun = loopRun
      let data = {
        asset_identifier: loopRun.contractId + '::' + loopRun.assetName,
        limit: 1,
        offset: 0,
        unanchored: true,
        tx_metadata: true
      }
      this.$store.dispatch('stacksApiStore/fetchMintEvents', data).then((mintEvents) => {
        this.mintEvents = mintEvents
      })
      this.mintImage = loopRun.mintImage1 || loopRun.image
      if (!this.profile.loggedIn) {
        this.$router.push('/')
        return
      }
      data = {
        stxAddress: this.profile.stxAddress,
        contractId: loopRun.contractId,
        contractAddress: loopRun.contractId.split('.')[0],
        contractName: loopRun.contractId.split('.')[1],
        currentRunKey: this.$route.params.collection
      }
      this.$store.dispatch('stacksPurchaseStore/getCommissionTokensByContract', data).then((commissions) => {
        this.commissions = commissions
        this.loadMempoolTransactions()
      })
      this.$store.dispatch('stacksPurchaseStore/lookupMintPassBalance', data).then((result) => {
        if (result && result.result.value > 0) {
          this.mintPasses = Number(result.result.value)
        } else {
          this.mintPasses = 0
        }
      })
    })
    /**
    if (window.eventBus && window.eventBus.$on) {
      const $self = this
      window.eventBus.$on('rpayEvent', function (data) {
        if (data.opcode === 'cancel-minting') {
          $self.$bvModal.hide('minting-modal')
        } else if (data.opcode === 'stx-transaction-sent') {
          $self.$bvModal.hide('minting-modal')
          $self.transaction = data
          if (data.txStatus === 'success') {
            $self.$store.dispatch('stacksApiStore/fetchLoopRun', $self.currentRunKey).then((loopRun) => {
              $self.loopRun = loopRun
              $self.mintImage = $self.loopRun.mintImage1 || $self.loopRun.image
              $self.componentKey++
            })
          } else if (data.txStatus === 'pending') {
            $self.mintImage = $self.loopRun.mintImage2 || $self.loopRun.image
          } else {
            $self.mintImage = $self.loopRun.image
          }
        }
      })
    }
    **/
  },
  methods: {
    transactionUrl: function () {
      if (!this.transaction) return
      return 'https://explorer.stacks.co/txid/' + this.transaction.txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    loadMempoolTransactions: function () {
      const data = {
        stxAddress: this.profile.stxAddress
      }
      this.$store.dispatch('stacksApiStore/fetchMempoolTxsByAddress', data).then((result) => {
        if (result.total > 0) {
          this.transactions = result.results
          this.transaction = result.results[0]
          this.$notify({ type: 'warning', title: 'Check Status', text: 'Transaction status is ' + this.transaction.tx_status })
        }
        this.loaded = true
      })
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
    mintCounter () {
      const counter = this.loopRun.tokenCount
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    },
    available () {
      return this.loopRun.versionLimit - this.mintCounter
    },
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
<style lang="scss">
.mint-helper {
  border: 1pt solid #a2a2a2;
}
</style>
