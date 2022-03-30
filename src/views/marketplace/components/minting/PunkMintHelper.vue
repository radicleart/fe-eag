<template>
<div v-if="loopRun">
  <b-row style="height: 100%;">
    <b-col cols="12" align-self="start">
      <p v-if="mintPasses > 0">MINT PASSES: {{mintPasses}}</p>
      <p class="">EDITION: {{loopRun.versionLimit}}</p>
      <p class="">AVAILABLE: {{available}}</p>
    </b-col>
    <b-col cols="12" align-self="end">
      <div class="mt-2">
        <div v-if="mintingAllowed">
          <div v-if="canMint">
            <b-row class="">
              <b-col cols="6" class="">
                <b-form-select style="text-align: center; font-size: 1.2rem; font-weight: 700; height: 2.4rem;" v-if="loopRun.batchSize > 1" id="batchOption" v-model="batchOption" :options="batchOptions()"></b-form-select>
              </b-col>
              <b-col cols="6">
                <b-button class="w-100" variant="outline-dark" @click="startMinting()">Mint<span v-if="mintPasses > 1"> {{batchOption}}</span></b-button>
              </b-col>
            </b-row>
          </div>
          <b-row class="mt-5" v-if="available > 0">
            <b-col cols="6" class="pt-3 text-right">
              Purchase options
            </b-col>
            <b-col cols="6" class="text-center">
              <PaymentNftTransferTrigger class="w-100 text-white" :configuration="configuration" :transactionData="transactionData()"/>
            </b-col>
          </b-row>
        </div>
        <div v-else>
          Minting Unavailable
        </div>
      </div>
      <div class="mt-4 pt-4 border-top text-right"><img width="100%" :src="iconLN" /></div>
    </b-col>
  </b-row>
  <b-modal size="lg" id="minting-modal">
    <MintingV3Flow v-if="loopRun.marketplaceVersion === 3" @update="update" :loopRun="loopRun" :batchOption="batchOption"/>
    <template #modal-footer class="text-center"><div class="w-100"></div></template>
  </b-modal>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import MintingV3Flow from '@/views/marketplace/components/minting/MintingV3Flow'
import PaymentNftTransferTrigger from '@/views/marketplace/components/off-chain/PaymentNftTransferTrigger'

export default {
  name: 'PunkMintHelper',
  components: {
    MintingV3Flow,
    PaymentNftTransferTrigger
  },
  props: ['loopRun', 'mintPasses'],
  data () {
    return {
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo neon.png'),
      batchOption: 1,
      configuration: null
    }
  },
  watch: {
    'batchOption' () {
    }
  },
  mounted () {
    this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, priceInStx: 0.50 })
    this.configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
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
      for (let i = 1; i <= Math.min(20, this.mintPasses); i++) {
        options.push(i)
      }
      return options
    },
    startMinting: function () {
      const data = {
        stxAddress: this.profile.stxAddress,
        contractId: this.loopRun.contractId,
        currentRunKey: this.loopRun.currentRunKey
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
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    },
    mintCounter () {
      const application = this.$store.getters[APP_CONSTANTS.KEY_APPLICATION_FROM_REGISTRY_BY_CONTRACT_ID](this.loopRun.contractId)
      const counter = (application && application.tokenContract) ? application.tokenContract.mintCounter : 0
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    },
    mintingAllowed () {
      return this.loopRun.status !== 'inactive' && this.loopRun.status !== 'disabled'
    },
    available () {
      return this.loopRun.versionLimit - this.mintCounter
    },
    canMint () {
      return this.available > 0 && this.mintPasses > 0
    }
  }
}
</script>
<style lang="scss">
</style>
