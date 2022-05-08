<template>
<section id="asset-details-section" v-if="gaiaAsset && gaiaAsset.contractAsset">
  <b-container class="center-section" style="min-height: 50vh;">
    <b-row align-h="center" :style="'min-height: ' + videoHeight + 'px'">
      <b-col lg="7" sm="12" class="mb-5">
        <MediaItemGeneral :classes="'hash1-image'" v-on="$listeners" :options="videoOptions" :asset="gaiaAsset"/>
      </b-col>
      <b-col lg="5" sm="12" class="my-5">
        <ListingInfo class="my-5" :classes="'bg-white text-primary mr-5 text-small'" v-on="$listeners" :asset="gaiaAsset" :loopRun="loopRun" :context="'collection'"/>
        <b-row  v-if="gaiaAsset.description" class="py-2 border-bottom text-primary">
          <b-col cols="12">
            <div v-html="preserveWhiteSpace(gaiaAsset.description)"></div>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="12" align-self="end" :key="componentKey">
            <div class="w-100">
              <PendingTransactionInfo v-if="pending && pending.txStatus === 'pending'" :pending="pending"/>
            </div>
          </b-col>
        </b-row>
        <b-row v-if="loadedInFlights">
          <b-col md="12" align-self="end" :key="componentKey">
            <PaymentTrigger class="w-100" @update="update" :loopRun="loopRun" :transactionData="transactionDataSft()" :inFlightPayments="inFlightPayments"/>
          </b-col>
        </b-row>
        <b-row v-if="events">
          <b-col md="12" align-self="end" :key="componentKey">
            <NftHistory class="text-small mt-5" @setPending="setPending" :events="events" :gaiaAsset="gaiaAsset" :loopRun="loopRun"/>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</section>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import Vue from 'vue'
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'
import MediaItemGeneral from '@/views/marketplace/components/media/MediaItemGeneral'
// import EditionTrigger from '@/views/marketplace/components/toolkit/editions/EditionTrigger'
import NftHistory from '@/views/marketplace/components/toolkit/nft-history/NftHistory'
import PendingTransactionInfo from '@/views/marketplace/components/toolkit/nft-history/PendingTransactionInfo'
import PaymentTrigger from '@/views/marketplace/components/off-chain/PaymentTrigger'

export default {
  name: 'NftDisplay',
  components: {
    PaymentTrigger,
    ListingInfo,
    PendingTransactionInfo,
    NftHistory,
    MediaItemGeneral
  },
  props: ['gaiaAsset', 'loopRun', 'events'],
  data () {
    return {
      nftIndex: -1,
      amount: 100,
      pending: null,
      videoHeight: 0,
      componentKey: 0,
      loadedInFlights: false,
      inFlightPayments: [],
      txData: null
    }
  },
  mounted () {
    this.nftIndex = Number(this.$route.params.nftIndex)
    const $self = this
    const data = {
      contractId: this.loopRun.contractId,
      stxAddress: this.profile.stxAddress
    }
    this.$store.dispatch('merchantStore/initialiseRates').then((res) => {
      this.$store.dispatch('merchantStore/fetchPurchases', data).then((payments) => {
        this.inFlightPayments = payments
        this.$store.commit(APP_CONSTANTS.SET_PURCHASE_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, commission: { price: this.loopRun.mintPrice, amount: 100 } })
        this.loadedInFlights = true
      })
    })
    this.resizeContainers()
    if (window.eventBus && window.eventBus.$on) {
      window.eventBus.$on('rpayEvent', function (data) {
        if ($self.$route.name.indexOf('asset-by-') === -1) return
        $self.componentKey++
        $self.$bvModal.hide('result-modal')
        $self.txData = data
        if (data.opcode.indexOf('stx-transaction-sent') > -1) {
          if (data.txStatus === 'pending') {
            // $self.$bvModal.show('result-modal')
          }
          $self.update()
        }
      })
    }
    Vue.nextTick(function () {
      const vid = document.getElementById('video-column')
      if (vid) this.videoHeight = vid.clientHeight
    }, this)
  },
  methods: {
    transactionDataSft () {
      return {
        commission: { price: this.loopRun.mintPrice, amount: this.amount },
        type: 'admin-mint-sft',
        batchOption: 1,
        contractId: this.loopRun.contractId,
        nftIndex: this.nftIndex,
        amount: this.amount,
        recipient: null,
        sender: this.profile.stxAddress,
        assetName: this.loopRun.assetName
      }
    },
    setPending (result) {
      if (this.pending) {
        if (!result || !result.txStatus || result.txStatus === 'pending') {
          this.pending = result
        } else if (this.pending.txStatus === 'pending' && result.txStatus === 'success') {
          if (result.functionName.indexOf('mint-token') > -1) {
          } else if (result.txStatus === 'success' && result.functionName.indexOf('mint-token') === -1) {
            const data = { contractId: this.loopRun.contractId, nftIndex: result.nftIndex }
            this.updateCacheByNftIndex(data)
          }
        } else if (result.txStatus.startsWith('abort')) {
          // this.$notify({ type: 'danger', title: 'Transaction Info', text: 'Transaction failed - check blockchain for cause.' })
        }
      }
      this.pending = result
    },
    updateCacheByNftIndex (data) {
      this.$store.dispatch('rpayStacksContractStore/updateCacheByNftIndex', data).then(() => {
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', data)
      })
    },
    update (data) {
      if (data.opcode === 'amount-change') {
        this.amount = data.amount
      }
    },
    resizeContainers () {
      let resizeTimer
      const $self = this
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(function () {
          const vid = document.getElementById('video-column')
          if (vid) $self.videoHeight = vid.clientHeight
        }, 400)
      })
    },
    preserveWhiteSpace: function (content) {
      return '<span class="text-description" style="white-space: break-spaces;">' + content + '</span>'
    },
    back: function () {
      this.$bvModal.hide('result-modal')
    },
    dimensions () {
      const dims = { width: '100%', height: '100%' }
      return 'max-width: ' + dims.height + '; max-height: ' + dims.height + ';'
    },
    poster: function () {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.gaiaAsset)
    }
  },
  computed: {
    canMint () {
      return !this.events || this.events.length === 0
    },
    transactionUrl: function () {
      if (!this.gaiaAsset.mintInfo || !this.gaiaAsset.mintInfo.txId) return '#'
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + this.gaiaAsset.mintInfo.txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    videoOptions () {
      const videoOptions = {
        emitOnHover: true,
        playOnHover: false,
        bigPlayer: true,
        autoplay: false,
        muted: false,
        controls: true,
        showMeta: false,
        dimensions: 'max-width: 100%; max-height: auto;',
        aspectRatio: '1:1',
        poster: this.gaiaAsset.image,
        sources: [
          { src: (this.gaiaAsset.properties) ? this.gaiaAsset.properties.animation_url : null }
        ],
        fluid: false
      }
      return videoOptions
    },
    owner () {
      return this.gaiaAsset.contractAsset.owner
    },
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>

<style>
.more-link {
  border: 1pt solid #fff;
  padding: 3px 10px;
  text-align: center;
  font-size: 1.2rem;
}
.on-auction-text {
  text-transform: capitalize;
  font-weight: 700;
  font-size: 1.5rem;
}
#asset-offer-modal .modal-body {
  background-color: #fff;
  text-align: left !important;
}
#asset-offer-modal .modal-content {
  color: #000;
}
#asset-offer-modal .modal-dialog {
  background-color: #fff;
  color: #000;
  text-align: left !important;
}
</style>
