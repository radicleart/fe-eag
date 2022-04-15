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
      <div class="d-flex mt-4" v-if="available > 0 && loadedInFlights">
        <div class="w-50 mr-1 pt-2 text-right text-upper">
          <!-- {{purchases}} purchase<span v-if="purchases !== 1"></span> left -->
          <span v-if="hasMintPass">Other</span><span v-else>Purchase</span> Options
        </div>
        <div class="w-50 ml-1" v-if="loaded">
          <PaymentNftTransferTrigger class="w-100 text-white" :loopRun="loopRun" :transactionData="transactionData()" :inFlightPayments="inFlightPayments"/>
        </div>
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
import PaymentNftTransferTrigger from '@/views/marketplace/components/off-chain/PaymentNftTransferTrigger'

export default {
  name: 'PunkMintHelper',
  components: {
    MintingV3Flow,
    PaymentNftTransferTrigger
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
    this.$store.dispatch('merchantStore/fetchPayments', data).then((payments) => {
      this.loadedInFlights = true
      if (payments && payments.opennode.filter((o) => o.status !== 'unpaid').length > 0) {
        this.inFlightPayments = payments.opennode.filter((o) => o.status !== 'unpaid')
        this.inFlightPayments = payments.square.filter((o) => o.status !== 'unpaid')
      }
    })
    this.commission = this.commissions.find((o) => o.name === 'unwrapped-stx-token') || this.commissions[0]
    this.$store.commit(APP_CONSTANTS.SET_PURCHASE_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, commission: this.commission })
    this.loaded = true
  },
  methods: {
    transactionData () {
      const comm = this.commissions.find((o) => o.tokenContractId.indexOf('unwrapped-stx-token') > -1)
      return {
        type: 'mint-with',
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
      const data = {
        stxAddress: this.profile.stxAddress,
        contractId: this.loopRun.contractId,
        currentRunKey: this.loopRun.currentRunKey
      }
      this.$store.dispatch('rpayCategoryStore/checkGuestList', data).then((result) => {
        if (result) {
          this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'minting-flow' })
          this.$store.commit('merchantStore/setDisplayCard', 100)
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
