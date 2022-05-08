<template>
<div>
  <div class="pt-2 w-100 cp-totals" v-show="showSpinner">
    <div class="pb-b"><b-icon class="text-info" icon="arrow-clockwise" animation="spin" font-scale="4"></b-icon></div>
  </div>
  <div class="pt-3 mx-auto cp-totals" v-show="!showSpinner">
    <form id="payment-form">
      <div id="card-container"></div>
      <div class="d-flex justify-content-center">
        <b-button class="button-credit-card" style="width: 60%;" v-if="paying" @click="paying = !paying"><b-icon class="mr-2" icon="circle" animation="throb"/>click to reset</b-button>
        <b-button :disabled="disabled" v-else id="card-button" @click="handlePaymentMethodSubmission" class="button-credit-card" style="width: 40%;" variant="payments">Pay <span class="" v-html="fiatSymbol"></span> {{formattedFiat}}</b-button>
      </div>
    </form>
    <div id="payment-status-container"></div>
  </div>
  <b-card-text v-if="testMode">
    <div class="mt-2 d-flex justify-content-around mt-5">
      <div><a href="#" class="rpay-text-secondary" @click.prevent="showTestPayments = !showTestPayments">Test Numbers</a></div>
    </div>
  </b-card-text>
  <TestPayments class="text-small" v-if="showTestPayments" />
</div>
</template>

<script>
import TestPayments from './components/TestPayments'
import Vue from 'vue'

const appId = process.env.VUE_APP_SQUARE_APPLICATION_ID
const locationId = process.env.VUE_APP_SQUARE_LOCATION_ID

export default {
  name: 'SquareWebFormPaymentScreen',
  components: {
    TestPayments
  },
  props: ['id', 'configuration', 'showPaymentForm', 'transactionData'],
  data () {
    return {
      disabled: false,
      card: null,
      loaded: false,
      errors: [],
      paying: false,
      showSpinner: false,
      showTestPayments: false,
      applePay: false,
      masterpass: false,
      submitUrl: '/mesh/v2/stacksmate/square/charge',
      internalId: null
    }
  },
  watch: {
    showPaymentForm: function () {
      if (!this.showPaymentForm) {
        return 1
      }
      this.paymentForm.build()
    }
  },
  mounted: function () {
    if (!window.Square) {
      throw new Error('Square.js failed to load properly')
    }
    try {
      // LA14YJ0CQM53A
      this.amountFiat = this.configuration.payment.amountFiat * this.configuration.payment.creditAttributes.start * 100
      const payments = window.Square.payments(appId, locationId)
      const $self = this
      Vue.nextTick(function () {
        payments.card().then((card) => {
          $self.card = card
          $self.loaded = true
          card.attach('#card-container')
        })
      }, this)
    } catch {
      const statusContainer = document.getElementById(
        'payment-status-container'
      )
      statusContainer.className = 'missing-credentials'
      statusContainer.style.visibility = 'visible'
    }
  },
  methods: {
    handlePaymentMethodSubmission (event) {
      event.preventDefault()
      // disable the submit button as we await tokenization and make a payment request.
      this.disabled = true
      this.tokenize(this.card).then((token) => {
        this.createPayment(token).then((paymentResults) => {
          this.disabled = false
          this.displayPaymentResults('SUCCESS')
          console.debug('Payment Success', paymentResults)
          paymentResults.opcode = 'fiat-payment-success'
          this.$emit('rpayEvent', paymentResults)
        }).catch(e => {
          this.disabled = false
          this.displayPaymentResults('FAILURE')
          console.error(e.message)
          const paymentResults = { opcode: 'fiat-payment-error' }
          this.$emit('rpayEvent', paymentResults)
        })
      }).catch(e => {
        this.disabled = false
        this.displayPaymentResults('FAILURE')
        console.error(e.message)
      })
    },
    createPayment (token) {
      return new Promise((resolve, reject) => {
        const body = JSON.stringify({
          nonce: token,
          idempotencyKey: this.uuidv4(),
          // sourceId: token,
          currency: this.configuration.payment.currency,
          amountFiat: this.amountFiat, // amounts are in smallest denomination (cents, pence, etc)
          transactionData: this.transactionData,
          locationId: this.configuration.payment.squarePay.locationId
        })
        this.$emit('rpayEvent', { opcode: 'square-payment-begun' })
        fetch(this.configuration.risidioBaseApi + this.submitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body
        }).then((paymentResponse) => {
          if (paymentResponse.ok) {
            resolve(paymentResponse.json())
          }
          paymentResponse.text().then((errorBody) => {
            reject(new Error(errorBody))
          })
        })
      })
    },
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    tokenize (paymentMethod) {
      return new Promise((resolve, reject) => {
        paymentMethod.tokenize().then((tokenResult) => {
          if (tokenResult.status === 'OK') {
            resolve(tokenResult.token)
          } else {
            let errorMessage = `Tokenization failed with status: ${tokenResult.status}`
            if (tokenResult.errors) {
              errorMessage += ` and errors: ${JSON.stringify(
                tokenResult.errors
              )}`
            }
            reject(new Error(errorMessage))
          }
        })
      })
    },
    displayPaymentResults: async (status) => {
      const statusContainer = document.getElementById(
        'payment-status-container'
      )
      if (status === 'SUCCESS') {
        statusContainer.classList.remove('is-failure')
        statusContainer.classList.add('is-success')
      } else {
        statusContainer.classList.remove('is-success')
        statusContainer.classList.add('is-failure')
      }
      statusContainer.style.visibility = 'visible'
    }
  },
  computed: {
    formattedFiat () {
      const configuration = this.configuration
      // const amountFiat = (configuration.payment) ? configuration.payment.amountFiat : '0'
      const amountFiat = configuration.payment.amountFiat // * configuration.payment.creditAttributes.start
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      })
      const ffiat = formatter.formatToParts(amountFiat) /* $2,500.00 */
      return ffiat[1].value + '.' + ffiat[3].value
    },
    fiatSymbol () {
      const configuration = this.configuration
      const fc = (configuration.payment) ? configuration.payment.currency : '???'
      if (fc === 'EUR') {
        return '&euro;'
      } else if (fc === 'GBP') {
        return '&pound;'
      } else {
        return '&dollar;'
      }
    },
    testMode () {
      const configuration = this.configuration
      return configuration.payment.squarePay.applicationId.indexOf('sandbox') > -1
    }
  },
  created () {
  }
}
</script>

<style lang="scss">
.error {
  padding: 7px 10px;
  font-size: 0.7rem;
}
.loading-container {
  position: relative;
}
.loading {
  position: absolute;
  height: 82%;
  width: 90%;
  display: flex;
  background-color: #ffffff;
}
.loading svg {
  font-size: 40px;
  margin: auto;
  color: #0277bd;
}
.loaded {
  display: none;
}
#form-container {
  position: relative;
  width: 380px;
  margin: 0 auto;
  top: 50%;
  transform: translateY(-50%);
}

.third {
  float: left;
  width: calc((100% - 32px) / 3);
  padding: 0;
  margin: 0 16px 16px 0;
}

.third:last-of-type {
  margin-right: 0;
}

/* Define how SqPaymentForm iframes should look */
.sq-input {
  height: 56px;
  padding: 17px 10px;
  box-sizing: border-box;
  border: 1px solid #E0E2E3;
  background-color: white;
  border-radius: 6px;
  display: inline-block;
  -webkit-transition: border-color .2s ease-in-out;
     -moz-transition: border-color .2s ease-in-out;
      -ms-transition: border-color .2s ease-in-out;
          transition: border-color .2s ease-in-out;
}

/* Define how SqPaymentForm iframes should look when they have focus */
.sq-input--focus {
  border: 1px solid #4A90E2;
}

/* Define how SqPaymentForm iframes should look when they contain invalid values */
.sq-input--error {
  border: 1px solid #E02F2F;
}

#sq-card-number {
  margin-bottom: 16px;
}

/* Customize the "Pay with Credit Card" button */
.button-credit-card {
  position: relative;
  bottom: -20px;
  width: 100%;
  height: 36px;
  margin-top: 10px;
  background: #4A90E2;
  border-radius: 6px;
  cursor: pointer;
  display: block;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: 0;
  text-align: center;
  -webkit-transition: background .2s ease-in-out;
     -moz-transition: background .2s ease-in-out;
      -ms-transition: background .2s ease-in-out;
          transition: background .2s ease-in-out;
}

.button-credit-card:hover {
  background-color: #4281CB;
}
.cp-totals {
  min-width: 300px;
  background: #F0EFEF 0% 0% no-repeat padding-box;
  border-radius: 16px;
  opacity: 1;
  padding: 5px 20px;
  margin-bottom: 80px;
  text-align: center;
}
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
    -webkit-text-fill-color: black !important;
}
input {
    color: black !important;
}
</style>
