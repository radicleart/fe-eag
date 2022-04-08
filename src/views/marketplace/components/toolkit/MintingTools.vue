<template>
<div id="minting-tools" class="mt-3" v-if="items">
  <div class="">
    <div v-if="!items[0].contractAsset" class="w-100 text-small">
      <div v-if="!txPending || txPending.length === 0">
        <div v-if="isValid">
          <div>
            <b-button class="mx-2" variant="warning" @click="startMinting()">Mint<span v-if="loopRun && loopRun.batchSize > 1"> Next {{loopRun.batchSize}}</span></b-button>
          </div>
        </div>
        <!-- <b-alert v-else show variant="danger">Information required - <b-link :to="'/edit-item/' + items[0].assetHash">edit this item</b-link></b-alert> -->
        <b-alert v-else show variant="danger">Looks like this one didn't make it on to the blockchain - better luck next spin!</b-alert>
      </div>
    </div>
    <div id="my-nft-tabs" v-else class="mt-5">
      <b-tabs justified content-class="bg-black text-white p-4 border mt-3">
        <b-tab active title="Listings">
          <div v-if="items[0].contractAsset.listingInUstx && items[0].contractAsset.listingInUstx.price > 0">
            <UnlistAsset @cancel="cancel" :loopRun="loopRun" :contractAsset="items[0].contractAsset" v-if="items[0].contractAsset && isListed()"/>
          </div>
          <div v-else>
            <div><b-button class="btn-action" variant="outline-warning" @click="openSaleDataDialog()">List Item</b-button></div>
          </div>
        </b-tab>
        <b-tab title="Transfer">
          <TransferNft :loopRun="loopRun" :item="items[0]"/>
        </b-tab>
        <b-tab title="Operator">
          <ApprovalFlow :loopRun="loopRun" :item="items[0]"/>
        </b-tab>
      </b-tabs>
    </div>
  </div>
  <b-modal id="result-modal">
    <div v-html="mintResult"></div>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="md" id="minting-modal">
    <MintingFlowV2 v-if="isTheV2Contract()" :loopRun="loopRun" :items="items" v-on="$listeners"/>
    <MintingFlow v-else-if="loopRun" :loopRun="loopRun" :items="items" :mintAllocations="mintAllocations" v-on="$listeners"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal size="lg" id="selling-modal">
    <ListAsset @cancel="cancel" :loopRun="loopRun" :contractAsset="items[0].contractAsset" v-if="items[0].contractAsset && !isListed()"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
</div>
</template>

<script>
import MintingFlow from './mint-setup/MintingFlow'
import MintingFlowV2 from './mint-setup/MintingFlowV2'
import ListAsset from './sell-setup/ListAsset'
import UnlistAsset from './sell-setup/UnlistAsset'
import { APP_CONSTANTS } from '@/app-constants'
import TransferNft from '@/views/marketplace/components/toolkit/TransferNft'
import ApprovalFlow from '@/views/marketplace/components/toolkit/approvals/ApprovalFlow'

const STX_CONTRACT_NAME_V2 = process.env.VUE_APP_STACKS_CONTRACT_NAME_V2

export default {
  name: 'MintingTools',
  components: {
    MintingFlow,
    MintingFlowV2,
    ListAsset,
    UnlistAsset,
    TransferNft,
    ApprovalFlow
  },
  props: ['items', 'loopRun', 'mintAllocations'],
  data: function () {
    return {
      showApprovals: false,
      allowEditEditions: process.env.VUE_APP_ALLOW_EDIT_EDITIONS,
      contractNameNext: process.env.VUE_APP_STACKS_CONTRACT_NAME_NEXT,
      showRpay: false,
      showTransfers: false,
      offerData: null,
      mintResult: null,
      mintTitle: ''
    }
  },
  mounted () {
    const $self = this
    this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'minting-flow', asset: this.items })
    if (window.eventBus && window.eventBus.$on) {
      window.eventBus.$on('rpayEvent', function () {
        $self.$bvModal.hide('selling-modal')
        $self.$bvModal.hide('minting-modal')
      })
    }
  },
  methods: {
    isListed () {
      return this.items[0].contractAsset.listingInUstx && this.items[0].contractAsset.listingInUstx.price > 0
    },
    isTheV2Contract () {
      return this.loopRun && this.loopRun.contractId.indexOf(STX_CONTRACT_NAME_V2) > -1
    },
    cancel: function () {
      this.$bvModal.hide('selling-modal')
      this.$bvModal.hide('minting-modal')
    },
    openSaleDataDialog: function () {
      this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'selling-flow' })
      this.$bvModal.show('selling-modal')
    },
    startMinting: function () {
      this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'minting-flow' })
      this.$store.commit('merchantStore/setDisplayCard', 100)
      this.$bvModal.show('minting-modal')
    },
    downable: function () {
      return this.uploadState > 2
    },
    offerAmount: function (amount) {
      return (amount)
    },
    offerMade: function (madeData) {
      return new Date(madeData) // DateTime.fromMillis(madeData).toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    },
    upable: function () {
      return this.uploadState > 1 && this.uploadState < 5
    }
  },
  computed: {
    txPending () {
      let transactions
      if (this.items[0].contractAsset) {
        transactions = this.$store.getters[APP_CONSTANTS.KEY_TX_PENDING_BY_TX_ID](this.items[0].contractAsset.nftIndex)
      } else {
        transactions = this.$store.getters[APP_CONSTANTS.KEY_TX_PENDING_BY_ASSET_HASH](this.items[0].assetHash)
      }
      return transactions
    },
    transaction () {
      const transaction = this.$store.getters[APP_CONSTANTS.KEY_TRANSACTION](this.items[0].mintInfo.txId)
      return transaction
    },
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    },
    application () {
      const application = this.$store.getters[APP_CONSTANTS.KEY_APPLICATION_FROM_REGISTRY_BY_CONTRACT_ID](process.env.VUE_APP_STACKS_CONTRACT_ADDRESS + '.' + process.env.VUE_APP_STACKS_CONTRACT_NAME)
      return application
    },
    configuration () {
      const configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      return configuration
    },
    saleDataText () {
      if (this.items[0].contractAsset.listingInUstx) {
        return 'Unlist'
      }
      return 'List'
    },
    isValid: function () {
      if (this.items[0].cryptoPunk) {
        return this.items[0].name && this.items[0].image
      } else {
        const invalidItems = this.$store.getters[APP_CONSTANTS.KEY_ITEM_VALIDITY](this.items[0])
        return invalidItems.length === 0
      }
    }
  }
}
</script>

<style>
#my-nft-tabs >>> .nav-link.active {
  color: #000 !important;
}
#my-nft-tabs >>> .nav-link {
  color: #fff !important;
}
#selling-modal .modal-content {
  border: none !important;
  background-color: transparent !important;
}
#minting-modal .modal-content {
  border: none !important;
  background-color: transparent !important;
}
#minting-tools  .nav-link.active {
  color: #000;
}
#minting-tools .nav-link:hover {
  color: #ccc;
}
</style>
