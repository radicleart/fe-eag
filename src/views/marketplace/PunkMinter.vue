<template>
<div v-if="loopRun">
  <b-container fluid id="my-nft-tabs" class="px-5 text-white mt-5">
    <b-row>
      <b-col :key="componentKey">
        <h1 class="mb-5 border-bottom">{{loopRun.currentRun}} by: <span class="text-warning">{{loopRun.makerName}}</span></h1>
        <b-row class="mt-5">
          <b-col sm="7" xs="12">
            <div>
              <VideoJsPlayer v-if="loopRun.video" v-on="handleVideoEvent()" @error="setAltImg" :options="videoOptions()"/>
              <img v-else :src="mintImage" width="100%" v-b-tooltip.hover="{ variant: 'warning' }" :title="'Collection\n' + loopRun.currentRun"/>
            </div>
          </b-col>
          <b-col sm="5" xs="12">
            <b-row style="height: 100%;">
              <b-col cols="12" align-self="start">
                <h1 class="border-bottom mb-5">{{loopRun.currentRun}}</h1> <!-- ({{loopRun.tokenCount + '/' + loopRun.versionLimit}}) -->
                <p class="mt-5">EDITION: {{loopRun.versionLimit}}</p>
                <p class="mt-5" v-if="loopRun.description" v-html="preserveWhiteSpace(loopRun.description)"></p>
              </b-col>
              <b-col cols="12" align-self="end">
                <div class="mt-2" v-if="walletTx">
                  <a class="mr-2" :href="transactionUrl()" target="_blank"><b-icon class="text-warning" font-scale="1.2" icon="arrow-up-right-circle"/> view on explorer</a>
                </div>
                <div class="mt-2" v-else>
                  <div v-if="mintingStatus">
                    <div v-if="mintPasses > 0">
                      <b-row class="">
                        <b-col cols="6" class="">
                          <b-form-select style="text-align: center; font-size: 1.2rem; font-weight: 700; height: 2.4rem;" v-if="loopRun.batchSize > 1" id="batchOption" v-model="batchOption" :options="batchOptions()"></b-form-select>
                        </b-col>
                        <b-col cols="6" class="" v-if="mintPasses > 0">
                          <b-button class="w-100 text-white" variant="warning" @click="startMinting()">Mint<span v-if="mintPasses > 1"> {{batchOption}}</span></b-button>
                        </b-col>
                      </b-row>
                    </div>
                    <div v-else>
                      {{mintPassMessage}}
                    </div>
                    <b-row>
                      <b-col cols="12" class="text-center">
                        or
                      </b-col>
                    </b-row>
                    <!--
                    <b-row>
                      <b-col cols="12">
                        <PaymentNftTransferTrigger class="w-100 text-white" :configuration="configuration" :transactionData="transactionData()"/>
                      </b-col>
                    </b-row>
                    -->
                  </div>
                  <div v-else>
                    Minting Unavailable
                  </div>
                </div>
                <div class="mt-4 pt-4 border-top text-right"><img :src="hashone" /></div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
  <b-modal size="md" id="minting-modal">
    <CPSMintingFlow :loopRun="loopRun" @update="update" :batchOption="batchOption"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
  <b-modal scrollable id="result-modal" title="">
    <div class="row">
      <div class="col-12 my-1">
        <h2>Crash Punk Minting</h2>
        <div class="">Crash Punks mints on the Stacks / Bitcoin Blockchains</div>
        <div class="">This can take a little while but once minted the NFT will appear
          in your <b-link class="text-info" :to="'/my-nfts/' + loopRun.currentRunKey">NFT Library</b-link>
        </div>
        <div class="text-center mt-4">Please leave this tab open while we store your meta data.</div>
        <div class="text-center mt-2"><b-icon icon="three-dots" animation="cylon" font-scale="4"></b-icon></div>
      </div>
    </div>
    <template v-slot:modal-footer>
      <div class="w-100 text-right text-xsmall">
        {{result}}
      </div>
    </template>
  </b-modal>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CPSMintingFlow from '@/views/marketplace/components/toolkit/mint-setup/CPSMintingFlow'
import VideoJsPlayer from '@/views/marketplace/components/media/VideoJsPlayer'
// import PaymentNftTransferTrigger from '@/views/marketplace/components/off-chain/PaymentNftTransferTrigger'

export default {
  name: 'PunkMinter',
  components: {
    VideoJsPlayer,
    CPSMintingFlow
    // PaymentNftTransferTrigger
  },
  data () {
    return {
      hashone: require('@/assets/img/marketplace/STX_icon.svg'),
      waitingImage: 'https://images.prismic.io/radsoc/f60d92d0-f733-46e2-9cb7-c59e33a15fc1_download.jpeg?auto=compress,format',
      mintPasses: 0,
      componentKey: 0,
      loaded: false,
      batchOption: 1,
      mintingStatus: false,
      configuration: null,
      mintPassMessage: 'checking for mint pass',
      result: null,
      loopRun: null,
      items: [],
      uiState: 'locking',
      mintAllocations: [],
      gaiaAssets: [],
      makerUrlKey: null,
      currentRunKey: null,
      walletTx: false,
      mintImage: null,
      allowed: false,
      counter: 0
    }
  },
  watch: {
    'batchOption' () {
      this.setMintingStatus()
    }
  },
  mounted () {
    this.makerUrlKey = this.$route.params.maker
    this.currentRunKey = this.$route.params.collection
    this.$store.dispatch('rpayCategoryStore/fetchLoopRun', this.currentRunKey).then((loopRun) => {
      this.loopRun = loopRun
      this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, priceInStx: 0.50 })
      this.configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      this.setMintingStatus()
      this.mintImage = loopRun.mintImage1 || loopRun.image
      this.setMintingStatus()
      if (this.profile.loggedIn) {
        const data = {
          stxAddress: this.profile.stxAddress,
          contractAddress: loopRun.contractId.split('.')[0],
          contractName: loopRun.contractId.split('.')[1],
          currentRunKey: this.$route.params.collection
        }
        this.$store.dispatch('rpayMarketStore/lookupMintPassBalance', data).then((result) => {
          if (result && result.result.value > 0) {
            this.mintPasses = Number(result.result.value)
            this.mintPassMessage = 'Mint Pass Found'
          } else {
            this.mintPassMessage = 'Mint Pass Not Found'
          }
        })
      }
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
              $self.setMintingStatus()
              $self.mintImage = $self.loopRun.mintImage1 || $self.loopRun.image
              $self.result = ' status: ' + data.txStatus
              $self.$bvModal.hide('result-modal')
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
            // $self.$notify({ type: 'success', title: 'Tx Sent', text: 'Punks minted and meta data saved to Gaia!' })
          } else if (data.txStatus === 'pending') {
            $self.walletTx = data
            $self.result = ' status: ' + data.txStatus
            $self.mintImage = $self.loopRun.mintImage2 || $self.loopRun.image
            // const vals = { stxAddress: $self.profile.stxAddress, currentRunKey: $self.loopRun.currentRunKey }
            // $self.$store.dispatch('rpayCategoryStore/addToBlockList', vals)
            // $self.$bvModal.show('result-modal')
          } else {
            $self.result = ' status: ' + data.txStatus
            $self.mintImage = $self.loopRun.image
          }
        }
      })
    }
  },
  methods: {
    transactionData () {
      return {
        type: 'mint-with',
        contractId: this.loopRun.contractId,
        nftIndex: null,
        recipient: null,
        owner: null,
        assetName: this.loopRun.assetName
      }
    },
    saveMintingInfo (item, data) {
      item.mintInfo = {
        txId: data.txId,
        txStatus: data.txStatus
      }
      this.$store.dispatch('rpayMyItemStore/quickSaveItem', item).then(() => {
        // this.setPending(data)
      })
    },
    transactionUrl: function () {
      if (!this.walletTx) return '#'
      let txId = this.walletTx.txId
      if (!txId.startsWith('0x')) txId = '0x' + txId
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    setAltImg: function (event) {
      event.target.src = this.waitingImage
    },
    handleVideoEvent () {
      return this.items.length === this.loopRun.batchSize
    },
    preserveWhiteSpace: function (content) {
      return '<span class="text-description" style="white-space: break-spaces;">DESCRIPTION: ' + content + '</span>'
    },
    setMintingStatus () {
      this.mintingStatus = this.loopRun.status !== 'inactive' && this.loopRun.status !== 'disabled'
    },
    update (data) {
      if (data.opcode === 'show-collection') {
        this.$router.push('/nft-marketplace/' + data.loopRun.makerUrlKey + '/' + data.loopRun.currentRunKey)
      } else if (data.opcode === 'cancel') {
        this.$bvModal.hide('minting-modal')
      } else if (data.opcode === 'update-loopRun') {
        this.loopRun = data.loopRun
      }
    },
    batchOptions () {
      const options = []
      for (let i = 1; i <= this.mintPasses; i++) {
        options.push(i)
      }
      return options
    },
    startMinting: function () {
      const data = {
        stxAddress: this.profile.stxAddress,
        contractId: this.loopRun.contractId,
        currentRunKey: this.$route.params.collection
      }
      this.$store.dispatch('rpayCategoryStore/checkGuestList', data).then((result) => {
        if (result) {
          this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'minting-flow' })
          this.$store.commit('rpayStore/setDisplayCard', 100)
          this.$bvModal.show('minting-modal')
        } else {
          this.$notify({ type: 'warning', title: 'Mint Pass Expired', text: 'New allow list in operation' })
        }
      })
    },
    updateAllocation (data) {
      this.uiState = 'locked'
      this.$notify({ type: 'warning', title: 'Upload File', text: 'Allocation event - ' + data })
    },
    videoOptions () {
      const videoOptions = {
        emitOnHover: false,
        playOnHover: false,
        assetHash: null,
        bigPlayer: false,
        autoplay: true,
        muted: false,
        controls: true,
        showMeta: false,
        dimensions: 'max-width: 100%; max-height: auto;',
        aspectRatio: '1:1',
        poster: this.loopRun.image,
        sources: [{ src: this.loopRun.video }],
        fluid: false
      }
      return videoOptions
    }
  },
  computed: {
    mempool () {
      const mempool = this.$store.getters[APP_CONSTANTS.KEY_MEMPOOL]
      return mempool || {}
    },
    mempoolSettings () {
      const mempoolSettings = this.$store.getters[APP_CONSTANTS.KEY_MEMPOOL_SETTINGS]
      return mempoolSettings || {}
    },
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    },
    fetchedItems () {
      return this.items.length === this.loopRun.batchSize
    },
    credits () {
      if (!this.profile.loggedIn) return 0
      const loopRun = this.loopRun
      if (loopRun) {
        const remaining = loopRun.spinsPerDay - loopRun.spinsToday
        return (remaining > 0) ? remaining : 0
      }
      return 0
    }
  }
}
</script>
<style lang="scss">
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
