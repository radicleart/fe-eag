<template>
<div v-if="loading" class="d-flex justify-content-center">
  Loading data...
</div>
<div v-else :key="componentKey">
  <div class="mx-auto">
    <b-card-group class="">
      <b-card header-tag="header" footer-tag="footer">
        <template #header>
          <b-row class="mx-2">
            <b-col cols="2" v-if="configuration.risidioCardMode === 'nft-purchase-flow'">
              <img width="100%" :src="configuration.asset.image">
            </b-col>
            <b-col cols="10" style="">
              <div class="text-xsmall" v-html="paymentMessage"></div>
            </b-col>
          </b-row>
        </template>
        <div>
          <div>
            <OrderInfo :configuration="configuration" v-if="configuration.payment.allowMultiples" class="pb-4" @rpayEvent="rpayEvent($event)"/>
            <div class="d-flex flex-column align-items-center">
              <CryptoOptions :configuration="configuration" @rpayEvent="rpayEvent($event)"/>
              <p class="mt-2 mx-4 text-center text-message" v-html="swapMessage"></p>
              <p v-if="paying" class="mt-2 mx-4 text-center text-message">
                <b-icon icon="circle" animation="throb" font-scale="1"></b-icon> Payment in Progress
                <br/><span class="text-danger text-small">Please leave this tab open until we get the response</span>
              </p>
              <CryptoPaymentScreen :transactionData="transactionData" :configuration="configuration" @rpayEvent="rpayEvent($event)"/>
            </div>
          </div>
        </div>
        <template v-slot:footer>
          <FooterView class="mx-4" :paymentStage="paymentStage" @rangeEvent="rangeEvent"/>
        </template>
      </b-card>
    </b-card-group>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CryptoPaymentScreen from './payment-screens/CryptoPaymentScreen'
import CryptoOptions from './payment-screens/components/CryptoOptions'
import OrderInfo from './payment-screens/components/OrderInfo'
import FooterView from './FooterView'

export default {
  name: 'PaymentFlow',
  components: {
    FooterView,
    CryptoPaymentScreen,
    OrderInfo,
    CryptoOptions
  },
  props: ['transactionData'],
  data () {
    return {
      paymentStage: 0,
      passport: 'https://images.prismic.io/digirad/ba438fd3-a07d-4fce-8483-aaf46b975c4b_alexander-sinn-KgLtFCgfC28-unsplash+%281%29%402x.png?auto=compress,format',
      page: 'payment-page',
      message: null,
      paying: false,
      componentKey: 0,
      loading: true,
      successMessage1: 'Payment made - thank you.',
      errorMessage: 'Payment may have been cancelled - please check you are connected to the right network and have sufficient funds in your wallet.'
    }
  },
  mounted () {
    this.initPayment()
    const $self = this
    window.eventBus.$on('rpayEvent', function (data) {
      if (data.opcode === 'eth-payment-pending') {
        $self.paying = true
      } else if (data.opcode === 'btc-crypto-payment-success') {
        $self.doTransfer(data)
      }
    })
  },
  beforeDestroy () {
    this.$store.dispatch('merchantStore/stopCheckPayment')
  },
  methods: {
    initPayment: function () {
      this.$store.dispatch('merchantStore/initialisePaymentFlow', this.transactionData).then((invoice) => {
        this.page = 'payment-page'
        if (invoice) {
          if (invoice && (invoice.status === 'paid' || invoice.status === 'processing')) {
            // this.page = 'payment-result'
          }
          this.configuration = this.$store.getters[APP_CONSTANTS.KEY_PURCHASE_CONFIGURATION]
          this.loading = false
        }
      })
    },
    rangeEvent () {
      this.paymentStage = this.paymentStage++
      this.componentKey++
    },
    getPaymentId (data) {
      if (data.opcode === 'eth-crypto-payment-success') {
        return data.txId
      }
    },
    rpayEvent: function (data) {
      this.paying = false
      if (data.opcode === 'crypto-payment-expired') {
        this.paymentExpired()
      } else if (data.opcode === 'payment-restart') {
        this.paymentExpired()
      } else if (data.opcode.indexOf('-payment-error') > -1) {
        this.$notify({ type: 'danger', title: 'Payments', text: 'Payment was not recieved due to an unexpected error.' })
      } else if (data.opcode.indexOf('-payment-cancelled') > -1) {
        this.$notify({ type: 'warning', title: 'Payments', text: this.errorMessage })
      } else if (data.opcode === 'change-payment-method') {
        this.paymentStage = 1
        this.componentKey++
      } else if (data.opcode.indexOf('-payment-success') > -1) {
        // this.$emit('stacksMateEvent', data)
      }
      this.$emit('stacksMateEvent', data)
    },
    paymentExpired () {
      this.$store.dispatch('merchantStore/initialisePaymentFlow').then(() => {
        this.componentKey += 1
        this.loading = false
      })
    }
  },
  computed: {
    swapMessage () {
      if (!this.sufficientFunds && this.configuration.risidioCardMode.indexOf('nft-') === -1) {
        return 'Funds in the StacksMate Wallet are too low to make transfers at this time'
      }
      let sm = 'Send us <span class="text-danger">'
      if (this.configuration.payment.paymentOption === 'ethereum') {
        sm += this.configuration.payment.amountEth + '</span> ETH to us. '
      } else if (this.configuration.payment.paymentOption === 'bitcoin' || this.configuration.payment.paymentOption === 'lightning') {
        sm += this.configuration.payment.amountBtc + '</span> BTC / <span class="text-danger">' + this.configuration.payment.amountStx + '</span> STX. '
      } else {
        sm += this.configuration.payment.amountFiat + '</span> ' + this.configuration.payment.currency + ' / <span class="text-danger">' + this.configuration.payment.amountStx + '</span> STX. '
      }
      if (this.configuration.risidioCardMode === 'nft-purchase-flow') {
        sm += '<br/>We send <span class="text-xsmall text-danger">#' + this.configuration.asset.contractAsset.nftIndex + '</span> to ' + this.configuration.transactionData.recipient
      } else if (this.configuration.risidioCardMode === 'nft-mint-flow') {
        sm += '<br/>We send your NFT to <span class="text-danger">' + this.configuration.transactionData.recipient + '</span>. '
      } else {
        sm += '<br/>We send <span class="text-danger">' + this.configuration.payment.amountStx + '</span> STX to you. '
      }
      return sm
    },
    sufficientFunds () {
      if (this.configuration.risidioCardMode === 'nft-purchase-flow') return true
      const stxAddress = process.env.VUE_APP_STACKS_TRANSFER_ADDRESS
      const wallet = this.$store.getters[APP_CONSTANTS.KEY_ACCOUNT_INFO](stxAddress)
      return (wallet && wallet.accountInfo.balance >= (this.configuration.payment.amountStx * 4))
    },
    paymentMessage () {
      if (this.transactionData.type === 'admin-mint-sft') {
        return 'Mint ' + this.transactionData.amount + '% of <span class="text-danger">' + this.configuration.loopRun.currentRun + ' #' + this.transactionData.nftIndex + '</span><br/>For ' + this.configuration.payment.amountBtc + ' btc / ' + this.configuration.payment.amountStx + ' stx' + '<br/><span>To:</span> <span class="text-danger">' + this.configuration.transactionData.recipient + '</span>'
      }
      if (this.configuration.risidioCardMode === 'nft-purchase-flow') {
        return 'Purchasing <span class="text-danger">' + this.configuration.loopRun.currentRun + ' #' + this.configuration.asset.contractAsset.nftIndex + '</span><br/>For ' + this.configuration.payment.amountBtc + ' btc / ' + this.configuration.payment.amountStx + ' stx' + '<br/><span>To:</span> <span class="text-danger">' + this.configuration.transactionData.recipient + '</span>'
      } else if (this.configuration.risidioCardMode === 'nft-mint-flow') {
        return 'Mint <span class="text-danger">' + this.configuration.loopRun.currentRun + ' #' + this.transactionData.nftIndex + '</span><br/>For ' + this.configuration.payment.amountBtc + ' btc / ' + this.configuration.payment.amountStx + ' stx' + '<br/><span>To:</span> <span class="text-danger">' + this.configuration.transactionData.recipient + '</span>'
      }
      return 'Swap <span class="text-danger">' + this.configuration.payment.amountFiat + '</span> ' + this.configuration.payment.currency + ' for <span class="text-danger">' + this.configuration.payment.amountStx + '</span> STX<br/><span>to:</span> <span class="text-danger">' + this.configuration.transactionData.recipient + '</span>'
    },
    displayCard () {
      const displayCard = this.$store.getters[APP_CONSTANTS.KEY_DISPLAY_CARD]
      return displayCard
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
