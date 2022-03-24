<template>
<section id="asset-details-section" v-if="gaiaAsset && gaiaAsset.contractAsset">
  <b-container class="center-section" style="min-height: 50vh;">
    <b-row align-h="center" :style="'min-height: ' + videoHeight + 'px'">
      <b-col lg="7" sm="12" class="mb-5">
        <div id="video-column" :style="dimensions">
          <MediaItemGeneral :classes="'hash1-image'" v-on="$listeners" :options="videoOptions" :asset="gaiaAsset"/>
        </div>
      </b-col>
      <b-col lg="5" sm="12" style="margin-top: 200px;">
        <ListingInfo v-on="$listeners" :asset="gaiaAsset" :loopRun="loopRun" :context="'collection'"/>
        <b-container v-if="gaiaAsset.description" class="bg-white text-tab">
          <b-row class="py-2 border-bottom">
            <b-col cols="12">
              <div v-html="preserveWhiteSpace(gaiaAsset.description)"></div>
            </b-col>
          </b-row>
        </b-container>
        <b-row>
          <b-col md="12" align-self="end" :key="componentKey">
            <div class="w-100">
              <PendingTransactionInfo v-if="pending && pending.txStatus === 'pending'" :pending="pending"/>
              <div v-if="nftIndex > -1">
                <NftHistory class="text-small mt-5" @setPending="setPending" :nftIndex="nftIndex" :loopRun="loopRun"/>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  <b-modal id="result-modal" class="" v-if="confirmOfferDialog">
    <b-row>
      <b-col cols="12" class="w-50">
        <h1>{{confirmOfferDialog[0].text}}</h1>
        <h4 class="text-center mb-5">{{confirmOfferDialog[1].text}}</h4>
        <h4 class="text-center mb-5"><a :href="transactionUrl" target="_blank">Transaction sent to Stacks Blockchain</a></h4>
        <p class="text-center mx-md-5 px-md-5 mb-5">{{confirmOfferDialog[2].text}}</p>
        <div class="mt-5"><a href="#" @click.prevent="back()"><b-icon icon="chevron-left"/> {{confirmOfferDialog[3].text}}</a></div>
      </b-col>
    </b-row>
    <div></div>
    <template #modal-footer class="text-center">
      <div class="w-100">
      </div>
    </template>
  </b-modal>
  </b-container>
</section>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import { DateTime } from 'luxon'
import Vue from 'vue'
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'
import MediaItemGeneral from '@/views/marketplace/components/media/MediaItemGeneral'
// import EditionTrigger from '@/views/marketplace/components/toolkit/editions/EditionTrigger'
import NftHistory from '@/views/marketplace/components/toolkit/nft-history/NftHistory'
import PendingTransactionInfo from '@/views/marketplace/components/toolkit/nft-history/PendingTransactionInfo'

export default {
  name: 'NftDisplay',
  components: {
    ListingInfo,
    PendingTransactionInfo,
    NftHistory,
    MediaItemGeneral
  },
  props: ['gaiaAsset', 'loopRun'],
  data () {
    return {
      showDownload: false,
      forceOfferFlow: false,
      hiddenCPS: true,
      nftIndex: -1,
      pending: null,
      videoHeight: 0,
      componentKey: 0,
      showHash: false,
      assetHash: null,
      txData: null,
      socialmessage: 'This is number one, an art engine and decentralised marketplace'
    }
  },
  watch: {
    '$route' () {
      this.assetHash = this.$route.params.assetHash
      this.componentKey++
    }
  },
  mounted () {
    this.assetHash = this.$route.params.assetHash
    this.nftIndex = Number(this.$route.params.nftIndex)
    const $self = this
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
    transactionData () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return {
        type: 'purchase',
        contractId: this.loopRun.contractId,
        nftIndex: this.gaiaAsset.contractAsset.nftIndex,
        recipient: profile.stxAddress,
        owner: this.gaiaAsset.contractAsset.owner,
        assetName: this.loopRun.assetName
      }
    },
    created () {
      if (this.gaiaAsset && this.gaiaAsset.mintInfo && this.gaiaAsset.mintInfo.timestamp) {
        return DateTime.fromMillis(this.gaiaAsset.mintInfo.timestamp).toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      } else if (this.gaiaAsset && this.gaiaAsset.updated) {
        return DateTime.fromMillis(this.gaiaAsset.updated).toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      }
      return ''
    },
    mintedEvent (data) {
      this.$bvModal.hide('edition-modal')
      this.$emit('mintedEvent', data)
    },
    setPending (result) {
      if (this.pending) {
        if (!result || !result.txStatus || result.txStatus === 'pending') {
          this.pending = result
        } else if (this.pending.txStatus === 'pending' && result.txStatus === 'success') {
          if (result.functionName.indexOf('mint-token') > -1) {
            if (result.functionName.indexOf('-twenty') > -1) {
              result.assetHash = result.assetHashes[0]
              this.updateCacheByHash(result)
            } else {
              this.updateCacheByHash(result)
            }
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
    getSocialLinks: function () {
      const content = this.$store.getters[APP_CONSTANTS.KEY_CONTENT_CHARITY_BY_ARTIST_ID](this.artistId)
      if (content && content.length > 0 && content[0].data.social_links && content[0].data.social_links.length > 0) {
        return content.data.social_links
      }
      return [
        {
          social_link: [{
            text: 'type=twitter'
          }]
        },
        {
          social_link: [{
            text: 'type=facebook'
          }]
        }
      ]
    },
    updateCacheByHash (data) {
      this.$store.dispatch('rpayStacksContractStore/updateCacheByHash', data).then(() => {
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndAssetHash', data)
      })
    },
    updateCacheByNftIndex (data) {
      this.$store.dispatch('rpayStacksContractStore/updateCacheByNftIndex', data).then(() => {
        this.$store.dispatch('rpayStacksContractStore/fetchTokenByContractIdAndNftIndex', data)
      })
    },
    update () {
      this.componentKey++
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
    targetItem: function () {
      return this.$store.getters[APP_CONSTANTS.KEY_TARGET_FILE_FOR_DISPLAY](this.gaiaAsset)
    },
    dimensions () {
      const dims = { width: '100%', height: '100%' }
      return 'max-width: ' + dims.height + '; max-height: ' + dims.height + ';'
    },
    poster: function () {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.gaiaAsset)
    },
    getArtist: function () {
      if (this.gaiaAsset.artist) {
        return this.gaiaAsset.artist
      } else if (this.gaiaAsset.owner) {
        return this.gaiaAsset.owner.substring(0, this.gaiaAsset.owner.indexOf('.'))
      } else {
        return 'Unknown Artist'
      }
    },
    emailText () {
      const emailText = this.$store.getters[APP_CONSTANTS.KEY_EMAIL_TEXT]('registeremail')
      const answer = (emailText) ? emailText[0].text : 'Interest Registered'
      return answer
    }
  },
  computed: {
    mintedMessage () {
      if (this.gaiaAsset.contractAsset && this.loopRun && this.loopRun.type === 'punks') {
        return this.loopRun.currentRun + ' #' + this.gaiaAsset.contractAsset.nftIndex
      }
      if (this.gaiaAsset.contractAsset) {
        return '#' + this.gaiaAsset.contractAsset.nftIndex + ' ' + this.gaiaAsset.name
      }
      return this.gaiaAsset.name
    },
    editionMessage () {
      if (this.gaiaAsset.contractAsset && this.gaiaAsset.contractAsset.tokenInfo.maxEditions > 1) {
        return '(' + this.gaiaAsset.contractAsset.tokenInfo.edition + ' of ' + this.gaiaAsset.contractAsset.tokenInfo.maxEditions + ')'
      }
      return null
    },
    transactionUrl: function () {
      if (!this.gaiaAsset.mintInfo || !this.gaiaAsset.mintInfo.txId) return '#'
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + this.gaiaAsset.mintInfo.txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    txPending () {
      let transactions = []
      if (this.gaiaAsset.contractAsset) {
        transactions = this.$store.getters[APP_CONSTANTS.KEY_TX_PENDING_BY_TX_ID](this.gaiaAsset.contractAsset.nftIndex)
      } else {
        transactions = this.$store.getters[APP_CONSTANTS.KEY_TX_PENDING_BY_ASSET_HASH](this.gaiaAsset.assetHash)
      }
      return transactions
    },
    editionsAvailable: function () {
      return this.gaiaAsset.contractAsset.tokenInfo.edition === 1 && this.gaiaAsset.contractAsset.tokenInfo.maxEditions > 1 && this.gaiaAsset.contractAsset.editionCounter < this.gaiaAsset.contractAsset.tokenInfo.maxEditions
    },
    webWalletLink () {
      if (this.$browserDetect.isFirefox) {
        return this.$store.getters[APP_CONSTANTS.KEY_WEB_WALLET_LINK_FIREFOX]
      }
      return this.$store.getters[APP_CONSTANTS.KEY_WEB_WALLET_LINK_CHROME]
    },
    currentCost: function () {
      return this.gaiaAsset.contractAsset.tokenInfo.editionCost
    },
    confirmOfferDialog () {
      const dialog = this.$store.getters[APP_CONSTANTS.KEY_DIALOG_CONTENT]('confirm-offer')
      return dialog
    },
    ttWalletHelp () {
      const tooltip = this.$store.getters[APP_CONSTANTS.KEY_TOOL_TIP]('tt-wallet-help')
      return (tooltip) ? tooltip[0].text : ''
    },
    ttOfferingHelp () {
      const tooltip = this.$store.getters[APP_CONSTANTS.KEY_TOOL_TIP]('tt-offering-help')
      return (tooltip) ? tooltip[0].text : ''
    },
    videoOptions () {
      const videoOptions = {
        emitOnHover: true,
        playOnHover: false,
        bigPlayer: true,
        assetHash: this.assetHash,
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
    isOwner: function () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      if (!this.gaiaAsset.contractAsset || !profile || !profile.loggedIn) return false
      return profile.stxAddress === this.gaiaAsset.contractAsset.owner
    },
    owner () {
      return this.gaiaAsset.contractAsset.owner
    },
    webWalletNeeded () {
      const webWalletNeeded = this.$store.getters[APP_CONSTANTS.KEY_WEB_WALLET_NEEDED]
      return webWalletNeeded
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
