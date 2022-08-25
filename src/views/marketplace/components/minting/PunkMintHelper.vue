<template>
  <div v-if="commissions">
    <div class="d-flex w-50 w-sm-100" v-if="mintPasses > 0">
      <div class="w-75 p-2 mr-1 bg-darkish text-white">MINT PASSES</div>
      <div class="w-25 p-2 mr-1 bg-darkish text-white">{{mintPasses}}</div>
    </div>
    <div v-if="mintingAllowed" class="mt-4">
      <div v-if="hasMintPass">
        <div class="d-flex">
          <div class="w-50 mr-1">
            <b-form-select style="text-align: center; font-size: 1.2rem; font-weight: 700; height: 2.4rem;" v-if="loopRun.batchSize > 1" id="batchOption" v-model="batchOption" :options="batchOptions()"></b-form-select>
          </div>
          <div class="w-50 ml-1">
            <b-button class="w-100" variant="outline-dark" @click="startMinting()">MINT<span v-if="mintPasses > 1"> {{batchOption}}</span></b-button>
          </div>
        </div>
      </div>
      <div class="mt-4" v-if="available > 0 && loadedInFlights">
        <PaymentTrigger class="w-100" :loopRun="loopRun" :transactionData="transactionData()" :inFlightPayments="inFlightPayments"/>
      </div>
    </div>
    <div v-else class="mt-2">
      Minting Unavailable
    </div>
    <b-modal size="lg" id="minting-modal" v-if="commissions">
      <MintingV3Flow v-if="loopRun.marketplaceVersion === 3" @update="update" :commissions="commissions" :loopRun="loopRun" :batchOption="batchOption"/>
      <template #modal-footer class="text-center"><div class="w-100"></div></template>
    </b-modal>
  </div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import MintingV3Flow from '@/views/marketplace/components/minting/MintingV3Flow'
import PaymentTrigger from '@/views/marketplace/components/off-chain/PaymentTrigger'

export default {
  name: 'PunkMintHelper',
  components: {
    MintingV3Flow,
    PaymentTrigger
  },
  props: ['loopRun', 'mintPasses', 'commissions'],
  data () {
    return {
      batchOption: 1,
      loaded: false,
      loadedInFlights: false,
      inFlightPayments: [],
      commission: null
    }
  },
  watch: {
    'batchOption' () {
    }
  },
  mounted () {
    const data = {
      contractId: this.loopRun.contractId,
      stxAddress: this.profile.stxAddress
    }
    this.$store.dispatch('merchantStore/fetchPurchases', data).then((payments) => {
      this.inFlightPayments = payments
      this.loadedInFlights = true
    })
    this.commission = this.commissions.find((o) => o.name === 'unwrapped-stx-token') || this.commissions[0]
    this.$store.commit(APP_CONSTANTS.SET_PURCHASE_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, commission: this.commission })
    this.loaded = true
  },
  methods: {
    transactionData () {
      const comm = this.commissions.find((o) => o.tokenContractId.indexOf('unwrapped-stx-token') > -1)
      return {
        type: 'admin-mint-nft',
        price: comm.price,
        batchOption: 1,
        contractId: this.loopRun.contractId,
        tokenContractAddress: comm.tokenContractId.split('.')[0],
        tokenContractName: comm.tokenContractId.split('.')[1],
        nftIndex: null,
        recipient: null,
        sender: this.profile.stxAddress,
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
      this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'minting-flow' })
      this.$store.commit('merchantStore/setDisplayCard', 100)
      this.$bvModal.show('minting-modal')
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    },
    mintCounter () {
      const counter = this.loopRun.tokenCount
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    },
    mintingAllowed () {
      return this.loopRun.status !== 'inactive' && this.loopRun.status !== 'disabled'
    },
    available () {
      return this.loopRun.versionLimit - this.mintCounter
    },
    purchases () {
      return this.loopRun.spinsPerDay - this.inFlightPayments.length
    },
    hasMintPass () {
      return this.available > 0 && this.mintPasses > 0
    }
  }
}
</script>
<style lang="scss">
</style>
