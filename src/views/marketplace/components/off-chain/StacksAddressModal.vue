<template>
  <b-card-group>
    <b-card class="p-3" style="width: 100%;" bg-variant="white" header-tag="header" footer-tag="footer">
      <b-card-text class="text-right">
        <div class="mb-4 pb-4"><img width="60%" :src="iconLN" /></div>
      </b-card-text>
      <b-card-text class="">
        <h2 class="eag-header pointer mb-4">Recipient NFT Stacks Address</h2>
        <div class="mb-4">
          <label for="status-name">Email address for the payment receipt</label>
          <b-input-group class="mb-3">
            <b-form-input id="email" type="email" v-model="email" placeholder="Email address for payment receipt" pattern=".+@globex\.com" size="30"></b-form-input>
          </b-input-group>
        </div>
        <div class="mb-4">
          <b-input-group class="mb-3">
            <b-form-input v-model="nftRecipient" placeholder="Address of the NFT owner"></b-form-input>
          </b-input-group>
          <!--
          <p class="text-xsmall">The NFT recipients stacks address
            <span><b-link router-tag="span" v-b-tooltip.hover="{ variant: 'light', customClass: 'my-tooltip-class' }" :title="'Your address if your purchasing for yourself or a friends address if this is a gift?'" class="ml-2" variant="outline-success"><b-icon icon="question-circle"/></b-link></span>
          </p>
          -->
        </div>
      </b-card-text>
      <b-card-text class="" v-if="transactionData && transactionData.type === 'admin-mint-sft'">
        <label for="status-name">Select percentage of artwork you would like to buy</label>
        <div class="w-100">
          <vue-slider @change="changeToken" v-model="amount" :data="percentages()" :max="transactionData.amount"/>
        </div>
        <div class="w-100">
          <p v-html="paymentMessage" class="my-3"></p>
          <p>{{gaiaAsset.totalSupply}}% is owned by other collectors</p>
        </div>
      </b-card-text>
      <b-card-text>
        <div class="p-0 offset-10 col-2 text-right mb-5">
          <b-button class="w-100" variant="outline-dark" @click="next">Next</b-button>
        </div>
      </b-card-text>
    </b-card>
  </b-card-group>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'

export default {
  name: 'StacksAddressModal',
  components: {
    VueSlider
  },
  props: ['transactionData', 'loopRun', 'gaiaAsset'],
  data () {
    return {
      amount: 50,
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo grey.png'),
      nftRecipient: null,
      email: null
    }
  },
  mounted () {
    this.amount = this.transactionData.amount
    this.nftRecipient = this.profile.stxAddress
  },
  methods: {
    next () {
      if (this.amount > 0 && this.isValid(this.email)) {
        this.$emit('showPayment', { recipient: this.nftRecipient, amount: this.amount, email: this.email })
      } else if (this.amount === 0) {
        this.$notify({ type: 'warning', title: 'Select Amount', text: 'Please select the share of the artwork to buy?' })
      } else {
        this.$notify({ type: 'warning', title: 'Email Address', text: 'Please enter an email for the payment receipt.' })
      }
    },
    isValid: function (email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    changeToken: function (choice) {
      this.amount = choice
      this.$emit('showPayment', { opcode: 'amount-change', amount: this.amount })
      this.$store.dispatch('merchantStore/updateAmount', { amount: this.amount })
    },
    percentages () {
      const options = []
      for (let i = 0; i <= (100 - this.gaiaAsset.totalSupply); i += 10) {
        options.push({ text: i, value: i })
      }
      return options
    }
  },
  computed: {
    paymentMessage () {
      const configuration = this.$store.getters[APP_CONSTANTS.KEY_PURCHASE_CONFIGURATION]
      let msg = 'You are buying ' + this.amount + '% of <span class="text-grey">' + this.loopRun.currentRun + ' #' + this.transactionData.nftIndex + '</span>'
      if (this.amount > 0) msg += ' For ' + (this.amount * this.loopRun.mintPrice) + ' STX (' + configuration.payment.amountFiat + ' ' + configuration.payment.currency + ' / ' + configuration.payment.amountBtc + ' BTC)'
      return msg
    },
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style lang="scss">
$themeColor: #dae0e6;

/* import theme style */
@import '~vue-slider-component/lib/theme/default.scss';

</style>
