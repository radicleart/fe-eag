<template>
<div class="d-flex flex-column align-items-center">
  <div class="text-center">
    <CryptoCountdown :configuration="configuration" class="text-danger" v-on="$listeners" />
  </div>
  <div class="mb-3 mx-auto">
    <canvas ref="lndQrcode"></canvas>
  </div>
  <!--
  <div class="rd-text mb-3 d-flex justify-content-center">
    <span><small>Send the indicated amount to the address below</small></span>
  </div>
  -->

  <div class="d-flex justify-content-center">
    <p><a href="#" class="pointer" @click.prevent="copyAmount()">COPY PAYMENT AMOUNT</a></p>
    <input class="fake-input" id="copy-amount" readonly v-model="paymentAmount"/>
    <!-- <p>{{paymentAmount}} <a href="#" class="pointer" @click.prevent="copyAmount()"><b-icon icon="file-earmark"/></a></p> -->
  </div>
  <div class="d-flex justify-content-center">
    <p><a href="#" class="pointer" @click.prevent="copyAddress()">COPY PAYMENT ADDRESS</a></p>
    <!-- <p>{{paymentAddress}} <a href="#" class="pointer" @click.prevent="copyAddress()"><b-icon icon="file-earmark"/></a></p> -->
    <input class="fake-input" id="copy-address" readonly v-model="paymentAddress"/>
  </div>
</div>
</template>

<script>
import QRCode from 'qrcode'
import { APP_CONSTANTS } from '@/app-constants'
import CryptoCountdown from './CryptoCountdown'
import utils from '@/services/utils'

export default {
  name: 'BitcoinPaymentAddress',
  components: {
    CryptoCountdown
  },
  props: ['configuration'],
  data () {
    return {
      paymentAmount: 0,
      paymentAddress: null
    }
  },
  watch: {
    'paymentAmount' () {
      // this.addQrCode()
    }
  },
  mounted () {
    const invoice = this.$store.getters[APP_CONSTANTS.KEY_INVOICE]
    this.paymentAmount = invoice.amount / 100000000
    this.paymentAddress = invoice.address
    this.addQrCode()
  },
  computed: {
  },

  methods: {
    paymentUri () {
      const invoice = this.$store.getters[APP_CONSTANTS.KEY_INVOICE]
      let uri = 'bitcoin:' + invoice.address
      uri += '?amount=' + utils.fromSatoshi(invoice.amount)
      uri += '&label=' + encodeURI(invoice.description)
      return uri
    },
    addQrCode () {
      const element = this.$refs.lndQrcode
      const paymentUri = this.paymentUri()
      QRCode.toCanvas(
        element, paymentUri, { errorCorrectionLevel: 'H' },
        function () {})
    },
    copyAmount () {
      const copyText = document.querySelector('#copy-amount')
      copyText.select()
      document.execCommand('copy')
      this.doFlash()
      this.$notify({ type: 'success', title: 'Copied Amount', text: 'Copied to clipboard: ' + copyText.value })
    },
    copyAddress (value) {
      const copyText = document.querySelector('#copy-address')
      copyText.select()
      document.execCommand('copy')
      this.doFlash()
      this.$notify({ type: 'success', title: 'Copied Address', text: 'Copied to clipboard: ' + copyText.value })
    },
    doFlash () {
      const flasher = this.$refs.lndQrcode
      flasher.classList.add('flasher')
      setTimeout(function () {
        flasher.classList.remove('flasher')
      }, 1000)
    }
  }
}
</script>
<style lang="scss" scoped>
.tab-content {
  padding-top: 0px;
}
</style>
