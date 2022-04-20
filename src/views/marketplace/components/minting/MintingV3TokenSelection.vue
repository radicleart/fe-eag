<template>
<b-card-group>
  <b-card v-if="!loading" class="" style="min-height: 30vh;" header-tag="header" footer-tag="footer">
    <b-card-text>
      <p class="text-bold" v-if="item">{{item.name}}</p>
      <div class="w-100 mb-3" role="group" v-if="commissions && commissions.length > 1">
        <label for="status-name">Mint With</label>
        <div class="">
          <div v-for="(commission, index) in commissions" :key="index">
            <b-button variant="outline-dark" @click="changeToken(commission.sipTenToken.contractId)" :disabled="(commission.sipTenToken.contractId === tokenContractId)">{{getSymbol(commission.sipTenToken)}}</b-button>
          </div>
        </div>
      </div>
      <div class="text-100 text-small">
        Minting: {{batchOption}} @ <span v-if="commission">{{commission.price}} {{tokenName()}}</span><span v-else>{{loopRun.mintPrice}} STX</span>
      </div>
      <div class="mt-5 d-flex justify-content-between">
        <b-button @click="saveData()" class="text-upper rounded w-50 mr-2" variant="outline-light">Cancel</b-button>
        <b-button v-if="minting" class="text-upper w-50 ml-2" variant="light"><span><b-icon icon="three-dots" animation="cylon" font-scale="1.5"></b-icon></span></b-button>
        <b-button v-else @click="sendMintEvent()" class="text-upper w-50 ml-2" variant="light"><span v-if="mintButtonText">{{mintButtonText}}</span><span v-else>Mint Now</span></b-button>
      </div>
    </b-card-text>
  </b-card>
</b-card-group>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
// import Beneficiaries from './Beneficiaries'
// import EditEditions from './EditEditions'
// import ListBeneficiaries from '@/views/marketplace/components/toolkit/ListBeneficiaries'

export default {
  name: 'MintingV3TokenSelection',
  components: {
    // EditEditions,
    // ListBeneficiaries
  },
  props: ['commissions', 'batchOption', 'loopRun', 'item', 'errorMessage', 'hidePrimaries', 'mintButtonText'],
  data () {
    return {
      minting: false,
      allowEditEditions: false, // process.env.VUE_APP_ALLOW_EDIT_EDITIONS,
      mintedMessage: null,
      tokenContractId: null,
      commission: null,
      loading: true
    }
  },
  mounted () {
    if (this.item) this.allowEditEditions = true
    if (this.commissions) {
      // this.commissions = this.commissions.filter((o) => o.sipTenToken)
      this.tokenContractId = this.commissions[0].tokenContractId
      this.commission = this.commissions[0]
    } else {
      this.$notify({ type: 'error', title: 'Mint Commission', text: 'Mint commission not set' })
    }
    this.loading = false
  },
  methods: {
    getSymbol: function (sipTenToken) {
      if (sipTenToken.contractId.indexOf('unwrapped-stx-token') > -1) {
        return 'STX'
      }
      return sipTenToken.symbol
    },
    tokenName: function (choice) {
      if (this.tokenContractId.indexOf('unwrapped-stx') > -1) return 'STX'
      return this.commission.sipTenToken.name
    },
    changeToken: function (choice) {
      this.commission = this.commissions.find((o) => o.tokenContractId === choice)
      this.tokenContractId = choice
    },
    saveData: function () {
      window.eventBus.$emit('rpayEvent', { opcode: 'cancel-minting' })
    },
    sendMintEvent: function () {
      this.minting = true
      this.$emit('mintToken', this.commissions.find((o) => o.tokenContractId === this.tokenContractId))
    },
    commissionTokens () {
      const options = []
      this.commissions.forEach((o) => {
        if (o.sipTenToken) options.push({ text: o.sipTenToken.name, value: o.tokenContractId })
      })
      return options
    }
  },
  computed: {
    displayCard () {
      const displayCard = this.$store.getters[APP_CONSTANTS.KEY_DISPLAY_CARD]
      return displayCard
    },
    enableRoyalties () {
      // const configuration = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      return true
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
