<template>
  <b-row style="height: 100%;" v-if="commissions">
    <b-col cols="12" align-self="end">
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
              <PaymentNftTransferTrigger class="w-100 text-white" :transactionData="transactionData()"/>
            </b-col>
          </b-row>
        </div>
        <div v-else>
          Minting Unavailable
        </div>
      </div>
      <div class="mt-4 pt-4 border-top text-right"><img width="100%" :src="iconLN" /></div>
    </b-col>
    <b-modal size="lg" id="minting-modal">
      <MintingV3Flow v-if="loopRun.marketplaceVersion === 3" @update="update" :commissions="commissions" :loopRun="loopRun" :batchOption="batchOption"/>
      <template #modal-footer class="text-center"><div class="w-100"></div></template>
    </b-modal>
  </b-row>
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
      commissions: null
    }
  },
  watch: {
    'batchOption' () {
    }
  },
  mounted () {
    const data = {
      contractId: this.loopRun.contractId
    }
    this.$store.dispatch('rpayMarketGenFungStore/getCommissionTokensByContract', data).then((commissions) => {
      if (commissions) {
        this.tokenContractId = commissions[0].tokenContractId
        this.commissions = commissions
        this.commission = commissions[0]
        this.$store.commit(APP_CONSTANTS.SET_PURCHASE_FLOW, { flow: 'nft-mint-flow', loopRun: this.loopRun, commission: this.commission })
        this.$notify({ type: 'success', title: 'Mint Commission', text: 'Mint commission: ' + commissions.length })
      }
      this.loading = false
    })
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
    canMint () {
      return this.available > 0 && this.mintPasses > 0
    }
  }
}
</script>
<style lang="scss">
</style>
