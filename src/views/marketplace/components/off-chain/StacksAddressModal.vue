<template>
  <b-card-group>
    <b-card class="p-3" style="width: 100%;" bg-variant="white" header-tag="header" footer-tag="footer">
      <b-card-text class="text-right">
        <div class="mb-4 pb-4"><img width="60%" :src="iconLN" /></div>
      </b-card-text>
      <b-card-text class="">
        <h2 class="text-upper pointer mb-4 border-bottom">Recipient</h2>
        <div class="mb-4">
          <b-input-group append="ADDRESS" class="mb-3">
            <b-form-input v-model="nftRecipient" placeholder="Address of the NFT owner"></b-form-input>
          </b-input-group>
          <p class="text-xsmall">The NFT recipients stacks address
            <span><b-link router-tag="span" v-b-tooltip.hover="{ variant: 'light', customClass: 'my-tooltip-class' }" :title="'Your address if your purchasing for yourself or a friends address if this is a gift?'" class="ml-2" variant="outline-success"><b-icon icon="question-circle"/></b-link></span>
          </p>
        </div>
      </b-card-text>
      <b-card-text class="" v-if="transactionData && transactionData.type === 'admin-mint-sft'">
        <label for="status-name">Select percent of artwork to buy</label>
        <div class="w-100">
          <vue-slider @change="changeToken" v-model="amount" :data="percentages()" :max="transactionData.amount"/>
        </div>
        <div class="w-100 text-xsmall">
          <span v-html="paymentMessage"></span>
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
      nftRecipient: null
    }
  },
  mounted () {
    this.amount = this.transactionData.amount
    this.nftRecipient = this.profile.stxAddress
  },
  methods: {
    next () {
      if (this.amount > 0) {
        this.$emit('showPayment', { recipient: this.nftRecipient, amount: this.amount })
      } else {
        this.$notify({ type: 'warning', title: 'Select Amount', text: 'Please select the share of the artwork to buy?' })
      }
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
      let msg = 'Buying ' + this.amount + '% of <span class="text-grey">' + this.loopRun.currentRun + ' #' + this.transactionData.nftIndex + '</span> For ' + configuration.payment.amountStx + ' stx (' + configuration.payment.amountFiat + ' ' + configuration.payment.currency + ' / ' + configuration.payment.amountBtc + ' btc)'
      msg += ' <br/>' + (100 - this.gaiaAsset.totalSupply) + '% bought by other collectors'
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
