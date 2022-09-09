<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      <b-row>
        <b-col>
          <h2 for="description">Sip Ten Token</h2>
        </b-col>
        <b-col>
          <label for="status-name">Select Token</label>
          <b-form-select @change="changeToken" id="status-name" v-model="contractId" :options="sipTenTokenOptions()"></b-form-select>
          <b-form-text class="text-warning" id="status-help">Select the token to update or remove or create a new token below.</b-form-text>
          <div class="d-flex justify-content-between" v-if="sipTenToken && sipTenToken.contractId">
            <b-button @click="remove()" class="w-50 mr-2" variant="warning">Remove Token</b-button>
          </div>
        </b-col>
      </b-row>
    </b-card-text>
    <b-card-text class="m-4">
      <b-form>
        <b-row>
          <b-col>
            <div>Enter contract id</div>
            <b-input v-model="sipTenToken.contractId"></b-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <div>Enter name</div>
            <b-input v-model="sipTenToken.name"></b-input>
          </b-col>
          <b-col>
            <div>Enter symbol</div>
            <b-input v-model="sipTenToken.symbol"></b-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <div>Enter description</div>
            <b-textarea v-model="sipTenToken.description"></b-textarea>
          </b-col>
          <b-col>
            <div>Token Uri</div>
            <b-input v-model="sipTenToken.tokenUri"></b-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <div>Balance</div>
            <b-input v-model="sipTenToken.balance" type="number"></b-input>
          </b-col>
          <b-col>
            <div>Decimals</div>
            <b-input v-model="sipTenToken.decimals" type="number"></b-input>
          </b-col>
          <b-col>
            <div>Total Supply</div>
            <b-input v-model="sipTenToken.totalSupply"></b-input>
          </b-col>
        </b-row>
      </b-form>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="update()" class="w-50 mr-2" variant="warning">Update</b-button>
      </div>
    </b-card-text>
  </b-card>
</b-card-group>
</template>

<script>
/**
import {
  cvToHex,
  hexToCV,
  cvToJSON,
  contractPrincipalCV
} from '@stacks/transactions'
**/
// import axios from 'axios'

export default {
  name: 'UpdateMintCommission',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
      contractId: null,
      sipTenToken: {},
      sipTenTokens: null
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    sipTenTokenOptions: function () {
      if (!this.sipTenTokens) return
      const options = []
      this.sipTenTokens.forEach((o) => {
        options.push({ text: o.name, value: o.contractId })
      })
      return options
    },
    changeToken: function (choice) {
      this.sipTenToken = this.sipTenTokens.find((o) => o.contractId === choice)
      this.contractId = this.sipTenToken.contractId
    },
    fetch: function () {
      this.$store.dispatch('rpayMarketGenFungStore/sipTenTokenFindBy').then((result) => {
        this.sipTenTokens = result
        if (this.sipTenTokens) {
          this.sipTenToken = this.sipTenTokens[0] || {}
        }
        this.$notify({ type: 'success', title: 'Sip 10 Token', text: 'Tokens fetched from api' })
      })
    },
    remove: function () {
      if (!this.sipTenToken) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      this.$store.dispatch('rpayMarketGenFungStore/sipTenTokenDelete', this.sipTenToken).then((result) => {
        this.$notify({ type: 'success', title: 'Sip 10 Token', text: 'Token removed from api' })
      })
    },
    update: function () {
      if (!this.sipTenToken || !this.sipTenToken.contractId || !this.sipTenToken.name || !this.sipTenToken.symbol) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      this.sipTenToken.id = null
      this.$store.dispatch('rpayMarketGenFungStore/sipTenTokenUpdate', { sipTenToken: this.sipTenToken }).then((result) => {
        this.$notify({ type: 'success', title: 'Updated', text: 'Token info saved' })
      })
    }
  },
  computed: {
  }
}
</script>
<style lang="scss" scoped>
.text2 {
  text-transform: capitalize;
}

</style>
