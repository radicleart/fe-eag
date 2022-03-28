<template>
<div v-if="!loading" class="bg-dark d-flex justify-content-center">
  <div class="mx-auto">
    <b-card-group>
      <b-card bg-variant="dark" class="border-white text-white" header-tag="header" footer-tag="footer">
        <b-row class="">
          <b-col cols="12" class="px-1">
            <ItemDisplay :item="null" :loopRun="loopRun"/>
          </b-col>
          <b-col cols="12" class="px-1">
            <CPSRoyaltyScreen :batchOption="batchOption" :loopRun="loopRun" :hidePrimaries="true" :mintButtonText="mintButtonText()" :errorMessage="errorMessage" :item="null" @mintToken="beginMintProcess"/>
          </b-col>
        </b-row>
        <template #footer>
          <b-row class="text-whiter text-bold">
            <b-col cols="12" class="">
              <div><span class="text-xsmall">Minting to:</span> <span class="text-xsmall text-warning">{{profile.stxAddress}}</span></div>
            </b-col>
          </b-row>
          <b-row class="text-whiter text-bold">
            <b-col cols="12">
              <span class="text-xsmall" v-b-tooltip.hover="{ variant: 'warning' }"  :title="'Collection key: ' + loopRun.currentRunKey">{{loopRun.currentRun + ' / ' + loopRun.makerName}}</span>
            </b-col>
            <b-col cols="12" class="text-right">
              <span class="text-xsmall">{{loopRun.contractId}}</span>
            </b-col>
          </b-row>
        </template>
      </b-card>
    </b-card-group>
  </div>
  <b-modal scrollable id="upload-modal" title="">
    <div class="row">
      <div class="col-12 my-1">
        <h2>Uploading Assets</h2>
        <div class="">Uploading ({{gaiaed}}) assets to your decentralised data store</div>
        <div class="text-center mt-2"><b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon></div>
      </div>
    </div>
    <template v-slot:modal-footer>
      <div></div>
    </template>
  </b-modal>
</div>

</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CPSRoyaltyScreen from './minting-screens/CPSRoyaltyScreen'
import ItemDisplay from './minting-screens/ItemDisplay'

export default {
  name: 'CPSMintingFlow',
  components: {
    CPSRoyaltyScreen,
    ItemDisplay
  },
  props: ['loopRun', 'batchOption'],
  data () {
    return {
      loading: true,
      gaiaAssets: [],
      makerUrlKey: null,
      mintAllocations: [],
      currentRunKey: null,
      errorMessage: null,
      beneficiaries: null,
      eBen: null,
      gaiaed: 0
    }
  },
  mounted () {
    this.setPage()
    this.makerUrlKey = this.$route.params.maker
    this.currentRunKey = this.$route.params.collection
    this.handleResult()
  },
  methods: {
    setPage () {
      this.loading = false
      const displayCard = this.$store.getters[APP_CONSTANTS.KEY_DISPLAY_CARD]
      if (!displayCard) {
        this.$store.commit(APP_CONSTANTS.SET_DISPLAY_CARD, 100)
      }
    },
    mintButtonText () {
      return 'Mint ' + this.batchOption + ' Now'
    },
    handleResult () {
      if (window.eventBus && window.eventBus.$on) {
        const $self = this
        window.eventBus.$on('rpayEvent', function (data) {
          if (data.opcode === 'stx-transaction-sent') {
            $self.$bvModal.hide('minting-modal')
            if (data.txStatus.indexOf('abort') > -1) {
              const punkIndexes = []
              $self.mintAllocations.forEach((ma) => {
                punkIndexes.push(ma.punkIndex)
              })
              const bean = {
                punkIndexes: punkIndexes,
                currentRunKey: $self.loopRun.currentRunKey
              }
              $self.$store.dispatch('rpayCategoryStore/clearMintAllocations', bean)
              $self.$notify({ type: 'error', title: 'Tx Failed', text: 'Probably a post condition failure - not enough stacks to pay the minting fee?' })
            } else if (data.txStatus.indexOf('replace') > -1) {
              $self.$notify({ type: 'warning', title: 'Tx Replaced', text: 'We may have lost the tx id - if so your token is still safe and will be reconnected once confirmed.' })
            }
          }
        })
      }
    },
    beginMintProcess: function (commission) {
      const data = {
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        batchOption: this.batchOption
      }
      if (this.loopRun.marketplaceVersion === 3) {
        if (!commission) {
          this.$notify({ type: 'error', title: 'Select Tender', text: 'Please select the tender to use topay for minting' })
          return
        }
        data.sipTenToken = commission.sipTenToken
        data.mintPrice = commission.price
        data.tokenContractAddress = commission.tokenContractId.split('.')[0]
        data.tokenContractName = commission.tokenContractId.split('.')[1]
        // data.postConditions = (data.sipTenToken.name === 'Test Wrapper') ? getGFTMintPostConds(data, this.profile.stxAddress) : null
        this.marketplaceMint(data, 'rpayMarketGenFungStore/mintWithToken')
      } else {
        data.mintPrice = this.loopRun.mintPrice
        this.marketplaceMint(data, 'rpayPurchaseStore/cpsMintToken')
      }
    },
    marketplaceMint: function (data, method) {
      this.$store.dispatch(method, data).then((result) => {
        this.result = result
        this.$notify({ type: 'success', title: 'Minting in Progress', text: 'minting in progress' })
        this.$emit('update', { opcode: 'cancel' })
      }).catch(() => {
        this.$notify({ type: 'error', title: 'Error Minting', text: 'Minting cancelled' })
        this.$emit('update', { opcode: 'cancel' })
      })
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    },
    isMinted () {
      const asset = this.$store.getters[APP_CONSTANTS.KEY_ASSET_FROM_CONTRACT_BY_HASH](this.gaiaAssets[0].assetHash)
      return asset
    },
    displayCard () {
      const displayCard = this.$store.getters[APP_CONSTANTS.KEY_DISPLAY_CARD]
      return displayCard
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
