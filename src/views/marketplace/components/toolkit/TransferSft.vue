<template>
  <div class="mx-auto">
    <b-card-group>
      <b-card class="border-dark p-3" style="width: 100%;" header-tag="header" footer-tag="footer">
        <b-card-text class="">
          <div class="row mb-4">
            <div class="col-12">Transfer this NFT to another address</div>
          </div>
          <div class="row mb-4" v-if="transactionUrl">
            <div class="col-12">Transferring - <a :href="transactionUrl" target="_blank">track progress here...</a></div>
          </div>
          <div class="row mb-4" v-else-if="transferring">
            <div class="col-12">Transfer begun</div>
          </div>
          <div class="row mb-4" v-else>
            <div class="col-12 mb-3">
              <b-input-group append="ADDR" class="stx-address">
                <b-form-input id="toAddress" @change="lookupAddress" @paste="lookupAddress" v-model="toAddress" placeholder="The recipients Stacks Wallet address"></b-form-input>
              </b-input-group>
              <p v-if="showTransferButton" class="text-small">Recipients currently owns {{recipientBalance}}%</p>
              <p v-else class="text-small">Enter the recipients {{network}} stacks address</p>
              <b-input-group v-if="showTransferButton" append="AMT" class="stx-address">
                <b-form-input @change="onTxAmount" id="amount" :state="showAmountButton" v-model="txAmount" :value="txAmountMax" placeholder="The amount of the SFT to transfer"></b-form-input>
              </b-input-group>
              <p class="text-small" v-if="showTransferButton">Enter the amount to transfer (up to your balance {{txAmountMax}} %)</p>
              <p class="my-3 text-danger" v-if="errorMessage" v-html="errorMessage"></p>
            </div>
            <div class="col-12 text-right" v-if="showTransferButton && showAmountButton">
              <b-link router-tag="span" v-b-tooltip.hover="{ variant: 'danger' }" :title="'Transfer this NFT to another address - can\'t be undone!'" class="text-white mr-3" variant="outline-success"><b-icon class="ml-2" icon="question-circle"/></b-link>
              <b-button variant="outline-primary" style="width: 170px;" @click="transferSft()">Transfer NFT</b-button>
            </div>
          </div>
        </b-card-text>
      </b-card>
    </b-card-group>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'

const NETWORK = process.env.VUE_APP_NETWORK

export default {
  name: 'TransferSft',
  components: {
  },
  props: ['item', 'loopRun'],
  data: function () {
    return {
      toAddress: null,
      showTransferButton: false,
      errorMessage: null,
      network: NETWORK,
      result: {},
      transferring: false,
      txAmount: 0,
      sftDecimals: 0,
      recipientBalance: 0
    }
  },
  mounted () {
    this.txAmount = this.txAmountMax
    this.$store.dispatch('stacksApiStore/fetchDecimals', { contractId: this.loopRun.contractId }).then((sftDecimals) => {
      this.sftDecimals = sftDecimals
      this.loading = false
    })
  },
  methods: {
    onTxAmount: function () {
      this.txAmount = Math.floor(this.txAmount)
    },
    lookupAddress: function () {
      try {
        if (this.toAddress === this.profile.stxAddress) {
          this.$notify({ type: 'error', title: 'Recipient', text: 'Recipient is same as sender - did you want to transfer to someone else?' })
          this.toAddress = null
          return
        }
        utils.convertAddressFrom(this.toAddress)
        const data = {
          contractId: this.loopRun.contractId,
          nftIndex: this.item.contractAsset.nftIndex,
          stxAddress: this.toAddress
        }
        this.$store.dispatch('stacksApiStore/fetchBalance', data).then((res) => {
          this.recipientBalance = res
          this.showTransferButton = true
        })
      } catch (e) {
        this.$notify({ type: 'error', title: 'Recipient', text: 'Not a valid address' })
      }
    },
    transferSft: function () {
      if (!this.txAmount || this.txAmount > this.txAmountMax) {
        this.$notify({ type: 'error', title: 'Amount', text: 'Amount to transfer must be less then the amount you own and more than 0' })
        return
      }
      this.txAmount = Math.floor(this.txAmount)
      this.transferring = 'transfer started...'
      const contractAsset = this.item.contractAsset
      const data = {
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        nftIndex: contractAsset.nftIndex,
        balance: this.txAmountMax,
        amount: this.txAmount,
        assetName: this.loopRun.assetName,
        owner: contractAsset.owner,
        recipient: this.toAddress,
        recipientBalance: this.recipientBalance,
        sftDecimals: this.sftDecimals
      }
      return this.$store.dispatch('stacksPurchaseStore/transferSft', data).then((result) => {
        this.transferring = null
        this.result = result
      }).catch(() => {
        this.transferring = null
      })
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    },
    events () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_MINT_EVENTS_FOR_TOKEN](this.item.contractAsset.nftIndex)
    },
    txAmountMax () {
      return this.item.balance
    },
    ttTransfers () {
      const tooltip = this.$store.getters[APP_CONSTANTS.KEY_TOOL_TIP]('tt-transfers')
      return (tooltip) ? tooltip[0].text : ''
    },
    showAmountButton () {
      return (this.txAmount > 0 && this.txAmount <= this.txAmountMax && typeof this.txAmountMax === 'number')
    },
    transactionUrl: function () {
      if (!this.result || !this.result.txId) return
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + this.result.txId + '?chain=' + process.env.VUE_APP_NETWORK
    }
  }
}
</script>

<style>
#toAddress {
  font-size: 1.0rem !important;
}
.stx-address {
  margin: 10px 0;
}
</style>
