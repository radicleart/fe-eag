<template>
<div class="mx-5 d-flex justify-content-center" v-if="!loading">
  <div class="mx-auto">
    <b-card-group :key="componentKey">
      <b-card class="text-whiter border-dark p-3" bg-variant="dark" header-tag="header" footer-tag="footer">
        <!-- <SellingHeader :allowEdit="true"/> -->
        <b-card-text>
          <div v-if="isListed()">
            Listed for <span class="text-warning">{{getPrice()}}</span> STX
          </div>
          <div class="mt-3">
            Commission:<br/>
            <span class="text-warning">{{loopRun.commissionContractId}}</span>
          </div>
          <div class="w-100 mb-3" role="group" v-if="sipTenTokens">
            <label for="status-name">Mint With Token</label>
            <b-form-select @change="changeToken" id="status-name" v-model="tokenContractId" :options="tokenOptions()"></b-form-select>
          </div>
          <div class="w-100 mb-3" role="group" v-if="sipTenToken">
            <h2 for="status-name">Amount and Price</h2>
            <div v-html="sipTenToken.description"></div>
          </div>
          <b-input-group class="mb-3">
            <label for="unit-price" class="w-25">Unit Price:</label>
            <b-form-input id="unit-price" type="number" v-model="unitPrice" class="input" placeholder="STX"></b-form-input>
          </b-input-group>
          <b-input-group class="mb-3">
            <label for="amount" class="w-25">Amount (max {{this.balance}}):</label>
            <b-form-input id="amount" type="number" v-model="amount" class="input" placeholder="Percentage or quantity or amount to sell"></b-form-input>
          </b-input-group>
          <div>{{errorMessage}}</div>
        </b-card-text>
        <template v-slot:footer>
          <div class="mt-5 d-flex justify-content-between">
            <b-button @click="$emit('processChainEvent', { opcode: 'cancel' })" class="w-50 mr-1" variant="light">Cancel</b-button>
            <b-button @click="listItem()" class="w-50 ml-1" variant="outline-warning">List</b-button>
          </div>
        </template>
      </b-card>
    </b-card-group>
  </div>
</div>
<div v-else>
  Waiting for asset.
</div>
</template>

<script>

export default {
  name: 'ListAsset',
  components: {
  },
  props: ['contractAsset', 'loopRun', 'balance'],
  data () {
    return {
      componentKey: 0,
      errorMessage: null,
      sellingMessage: null,
      loading: true,
      unitPrice: 0,
      amount: 0,
      sipTenTokens: null,
      sipTenToken: null,
      tokenContractId: null
    }
  },
  mounted () {
    if (this.loopRun.marketplaceVersion > 2) {
      this.$store.dispatch('stacksApiStore/sipTenTokenFindBy').then((sipTenTokens) => {
        if (sipTenTokens) {
          this.sipTenTokens = sipTenTokens
          this.sipTenToken = sipTenTokens.find((o) => o.symbol === 'uSTX')
          this.tokenContractId = this.sipTenToken.contractId
          this.$notify({ type: 'success', title: 'Available Tokens', text: 'List NFT for x tokens' })
        }
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  methods: {
    isListed () {
      return this.contractAsset?.listingInUstx?.price > 0 || false
    },
    getPrice () {
      return this.contractAsset?.listingInUstx?.price || 0
    },
    changeToken: function (choice) {
      this.sipTenToken = this.sipTenTokens.find((o) => o.contractId === choice)
      this.tokenContractId = choice
    },
    tokenOptions () {
      const options = []
      this.sipTenTokens.forEach((o) => {
        options.push({ text: o.symbol, value: o.contractId })
      })
      return options
    },
    listItem () {
      this.errorMessage = null
      if (!this.isValid()) return
      const data = {
        sendAsSky: true,
        contractAddress: this.contractAsset.contractId.split('.')[0],
        contractName: this.contractAsset.contractId.split('.')[1],
        commissionContractAddress: this.loopRun.commissionContractId.split('.')[0],
        commissionContractName: this.loopRun.commissionContractId.split('.')[1],
        tokenContractAddress: this.sipTenToken.contractId.split('.')[0],
        tokenContractName: this.sipTenToken.contractId.split('.')[1],
        decimals: this.sipTenToken.decimals,
        nftIndex: this.contractAsset.nftIndex,
        amount: Number(this.amount),
        balance: this.balance,
        unitPrice: Number(this.unitPrice),
        assetName: this.loopRun.assetName,
        owner: this.contractAsset.owner

      }
      if (this.tokenContractId) {
        data.tokenContractAddress = this.tokenContractId.split('.')[0]
        data.tokenContractName = this.tokenContractId.split('.')[1]
      }
      let method = 'stacksPurchaseStore/listInToken'
      if (this.loopRun.type === 'SIP-013') {
        method = 'stacksPurchaseStore/listSFTInToken'
      }
      this.$store.dispatch(method, data).then((result) => {
        this.$emit('processChainEvent', { opcode: 'listed', result })
      }).catch((error) => {
        console.log(error)
        this.sellingMessage = null
      })
    },
    delistItem () {
      const data = {
        sendAsSky: true,
        contractAddress: this.contractAsset.contractId.split('.')[0],
        contractName: this.contractAsset.contractId.split('.')[1],
        nftIndex: this.contractAsset.nftIndex
      }
      this.$store.dispatch('stacksPurchaseStore/unlistInToken', data).then((result) => {
        this.$emit('processChainEvent', { opcode: 'listed', result })
      }).catch((error) => {
        console.log(error)
        this.sellingMessage = null
      })
    },
    isValid: function () {
      this.errorMessage = null
      if (this.amount === 0 || this.unitPrice === 0) {
        this.$notify({ type: 'error', title: 'Listing Error', text: 'Please set the amount (percentage) to sell and the unit price.' })
        return false
      }
      if (this.amount > this.balance) {
        this.$notify({ type: 'error', title: 'Listing Error', text: 'Can\'t sell more than you own!' })
        return false
      }
      return true
    }
  },
  computed: {
  }
}
</script>
<style lang="scss" scoped>
</style>
