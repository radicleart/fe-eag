<template>
    <div class="mt-5">
      <h1 class="d-flex justify-content-center">Quantity needed?</h1>
      <div class="mt-5 d-flex justify-content-center" style="margin-top: 20px; text-align: center; width: 100%;">
        <span @click.prevent="countDown">
          <b-icon v-if="fadeMin" class="cp-stepper" icon="caret-down"/>
          <b-icon v-else class="cp-stepper" icon="caret-down-fill"/>
        </span>
        <input class="mx-3 picker-input" @input="updateCredits($event)" id="input-horizontal1" v-model="localCredits" placeholder="$$$"/>
        <span @click.prevent="countUp">
          <b-icon v-if="fadeMax" class="cp-stepper" icon="caret-up"/>
          <b-icon v-else class="cp-stepper" icon="caret-up-fill"/>
        </span>
      </div>
      <div class="mt-3 text-center text-bold">
        Select the amount
      </div>
      <div class="cp-totals-outer">
        <div class="cp-totals">
          <div>
            <p class="text-bold">Your total</p>
            <div>
              <span class="text-two text-bold symbol" v-html="fiatSymbol"></span> <span class="text-bold">{{formattedFiat}}</span>
            </div>
            <div class="mt-1">
              <span class="text-two text-bold symbol" v-html="currentSymbol"></span> <span class="text-bold">{{currentAmount}}</span>
            </div>
          </div>
        </div>
        <div class="mt-0 text-left">
          <a class="text-small" href="#" @click.prevent="rpayCancel()"><b-icon class="text-dark" icon="chevron-left"/> Back</a>
        </div>
      </div>
      <div class="text-center mx-auto border-radius w-75">
        <b-button class="cp-btn-order" style="width: 100%;" variant="payments" @click.prevent="continueToPayment()">Place Your Order</b-button>
      </div>
    </div>
</template>

<script>

export default {
  name: 'CryptoStepper',
  components: {
  },
  props: ['paymentOption', 'configuration'],
  data () {
    return {
      localCredits: 0,
      loading: false
    }
  },
  mounted () {
    const config = this.configuration
    this.localCredits = config.payment.creditAttributes.start
  },
  methods: {
    continueToPayment () {
    },
    rpayCancel () {
      this.$emit('rpayEvent', { opcode: 'payment-canceled' })
    },
    countDown () {
      const config = this.configuration
      if (this.localCredits <= config.payment.creditAttributes.min) {
        return
      }
      if (this.localCredits < config.payment.creditAttributes.min + config.payment.creditAttributes.step) {
        this.localCredits = config.payment.creditAttributes.min
      } else {
        this.localCredits -= config.payment.creditAttributes.step
      }
      this.updateCredits()
    },
    countUp () {
      const config = this.configuration
      if (this.localCredits >= config.payment.creditAttributes.max) {
        return
      }
      this.localCredits += config.payment.creditAttributes.step
      this.updateCredits()
    },
    updateCredits (evt) {
      const config = this.configuration
      let numbC = 0
      try {
        if (this.localCredits.length === 0) {
          return
        }
        if (isNaN(this.localCredits)) {
          // this.$notify({ type: 'warn', title: 'Number of Credits', text: 'Credits must be a number between ' + config.payment.creditAttributes.min + ' and ' + config.payment.creditAttributes.max + '!' })
          this.localCredits = config.payment.creditAttributes.start
          return
        }
        numbC = Number(this.localCredits)
        if (numbC < config.payment.creditAttributes.min || numbC > config.payment.creditAttributes.max) {
          // this.$notify({ type: 'warn', title: 'Number of Credits', text: 'Credits must be a number between ' + config.payment.creditAttributes.min + ' and ' + config.payment.creditAttributes.max + '!' })
          this.localCredits = config.payment.creditAttributes.start
        }
      } catch (e) {
        // this.$notify({ type: 'warn', title: 'Number of Credits', text: 'Credits must be a number between ' + config.payment.creditAttributes.min + ' and ' + config.payment.creditAttributes.max + '!' })
        this.localCredits = config.payment.creditAttributes.start
      }
      this.$store.dispatch('merchantStore/updateAmount', { numbCredits: this.localCredits })
    }
  },
  computed: {
    quantityLabel () {
      return 'Spins'
    },
    config () {
      const configuration = this.configuration
      return configuration
    },
    fadeMin () {
      const configuration = this.configuration
      return this.localCredits === configuration.payment.creditAttributes.min
    },
    fadeMax () {
      const configuration = this.configuration
      return this.localCredits === configuration.payment.creditAttributes.max
    },
    currentSymbol () {
      if (this.paymentOption === 'ethereum') {
        return 'Ξ'
      } else if (this.paymentOption === 'stacks') {
        return '&#931;'
      } else {
        return '&#8383;' // '&#x20BF;' // '&#8383;'
      }
    },
    formattedFiat () {
      const configuration = this.configuration
      const amount = configuration.payment.amountFiat * configuration.payment.creditAttributes.start
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      })
      const ffiat = formatter.formatToParts(amount) /* $2,500.00 */
      return ffiat[1].value + '.' + ffiat[3].value
    },
    fiatSymbol () {
      const configuration = this.configuration
      const fc = configuration.payment.currency
      if (fc === 'EUR') {
        return '&euro;'
      } else if (fc === 'GBP') {
        return '&pound;'
      } else {
        return '&dollar;'
      }
    },
    amountFiat () {
      const configuration = this.configuration
      const amount = configuration.payment.amountFiat * configuration.payment.creditAttributes.start
      return amount
    },
    fiatCurrency () {
      const configuration = this.configuration
      return configuration.payment.currency
    },
    currentAmount () {
      const configuration = this.configuration
      const precision = 100000000
      return Math.round(configuration.payment.amountBtc * configuration.payment.creditAttributes.start * precision) / precision
    }
  }
}
</script>
<style lang="scss" scoped>
.ff-label {
  text-align: left;
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 0px;
  color: #000000;
  opacity: 1;
}
p.ff-total {
  text-align: left;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0px;
  color: #000000;
  opacity: 1;
  margin-bottom: 10px;
}
.symbol {
  font-size: 24px;
}
</style>
