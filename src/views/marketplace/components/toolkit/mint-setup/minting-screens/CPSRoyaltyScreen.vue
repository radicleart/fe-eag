<template>
<b-card-group>
  <b-card v-if="!loading" class="text-whiter text-small bg-dark" style="min-height: 30vh;" header-tag="header" footer-tag="footer">
    <b-card-text>
      <p class="text-bold" v-if="item">{{item.name}}</p>
      <div class="w-100 mb-3" role="group" v-if="commissions">
        <label for="status-name">Mint With Token</label>
        <b-form-select @change="changeToken" id="status-name" v-model="tokenContractId" :options="commissionTokens()"></b-form-select>
      </div>
      <div>
        Minting: {{batchOption}} @ <span v-if="commission">{{commission.price}} {{commission.sipTenToken.name}}</span><span v-else>{{loopRun.mintPrice}} STX</span>
      </div>
      <div class="mt-5 d-flex justify-content-between">
        <b-button @click="saveData()" class="rounded w-50 mr-2" variant="outline-light">Cancel</b-button>
        <b-button v-if="minting" class="w-50 ml-2" variant="warning"><span><b-icon icon="three-dots" animation="cylon" font-scale="1.5"></b-icon></span></b-button>
        <b-button v-else @click="sendMintEvent()" class="w-50 ml-2" variant="warning"><span v-if="mintButtonText">{{mintButtonText}}</span><span v-else>Mint Now</span></b-button>
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
  name: 'CPSRoyaltyScreen',
  components: {
    // EditEditions,
    // ListBeneficiaries
  },
  props: ['batchOption', 'loopRun', 'item', 'errorMessage', 'hidePrimaries', 'mintButtonText'],
  data () {
    return {
      minting: false,
      allowEditEditions: false, // process.env.VUE_APP_ALLOW_EDIT_EDITIONS,
      mintedMessage: null,
      commissions: null,
      tokenContractId: null,
      commission: null,
      loading: true
    }
  },
  mounted () {
    if (this.item) this.allowEditEditions = true
    const data = {
      contractId: this.loopRun.contractId
    }
    this.$store.dispatch('rpayMarketGenFungStore/getCommissionTokensByContract', data).then((commissions) => {
      if (commissions) {
        this.tokenContractId = commissions[0].tokenContractId
        this.commissions = commissions
        this.commission = commissions[0]
        this.$notify({ type: 'success', title: 'Mint Commission', text: 'Mint commission: ' + commissions.length })
      }
      this.loading = false
    })
  },
  methods: {
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
        options.push({ text: o.sipTenToken.symbol, value: o.tokenContractId })
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
