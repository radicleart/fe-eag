<template>
<div class="rpay-sq-payment-box action-section">
  <div>
    <div id="sq-ccbox">
      <!--
        You should replace the action attribute of the form with the path of
        the URL you want to POST the nonce to (for example, "/process-card")
      -->
    </div>
  </div>
  <div class="pt-5 w-100 cp-totals" v-show="showSpinner">
    <div class="pt-4" id="spiner"><b-icon class="text-info" icon="arrow-clockwise" animation="spin" font-scale="4"></b-icon></div>
  </div>
  <div class="pt-3 mx-auto cp-totals" v-show="!showSpinner">
    <form id="nonce-form" novalidate :action="submitUrl" method="post">
      <div class="errorbox">
        <div class="error" v-for="(error, index) in errors" :key="index">
          {{error}}
        </div>
      </div>
      <div id="card-tainer">
        <div class="cardfields card-number" :id="internalId+'-sq-card-number'">o</div>
        <div class="cardfields expiration-date" :id="internalId+'-sq-expiration-date'">e</div>
        <div class="cardfields cvv" :id="internalId+'-sq-cvv'">e</div>
        <div class="cardfields postal-code" :id="internalId+'-sq-postal-code'">e</div>
      </div>

      <input type="hidden" id="card-nonce" name="nonce">
      <div class="mt-0" id="sq-walletbox">
        <button v-show=applePay :id="id+'-sq-apple-pay'" class="button-apple-pay"></button>
        <button v-show=masterpass :id="id+'-sq-masterpass'" class="button-masterpass"></button>
      </div>
    </form>
    <div class="mt-3 d-flex justify-content-center">
      <b-button class="button-credit-card" style="width: 40%;" variant="warning" @click.prevent="requestCardNonce($event)">Send <span class="" v-html="fiatSymbol"></span> {{formattedFiat}}</b-button>
    </div>
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

export default {
  name: 'paymentForm',
  components: {
    TestPayments
  },
  props: ['id', 'configuration', 'showPaymentForm'],
  data () {
    return {
      errors: [],
      showSpinner: true,
      showTestPayments: false,
      applePay: false,
      masterpass: false,
      submitUrl: '/mesh/v1/square/charge',
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
    const configuration = this.configuration
    this.internalId = Math.floor(Math.random() * Math.floor(1000000))
    const idempotencyKey = this.uuidv4()
    const locationId = configuration.payment.squarePay.locationId
    const applicationId = configuration.payment.squarePay.applicationId // 'sq0idp-gbQhcOCpmb2X4W1588Ky7A'
    const that = this
    // eslint-disable-next-line no-undef
    this.paymentForm = new SqPaymentForm({
      autoBuild: false,
      applicationId: applicationId,
      locationId: locationId,
      idempotency_key: idempotencyKey,
      inputClass: 'sq-input',
      // Initialize the payment form elements

      // Customize the CSS for SqPaymentForm iframe elements
      inputStyles: [
        {
          fontSize: '.9em'
        }
      ],

      // Initialize Apple Pay placeholder ID
      applePay: {
        elementId: that.id + '-sq-apple-pay'
      },

      // Initialize Masterpass placeholder ID
      masterpass: {
        elementId: that.id + '-sq-masterpass'
      },

      // Initialize the credit card placeholders
      cardNumber: {
        elementId: that.id + '-sq-card-number',
        placeholder: 'XXXX XXXX XXXX XXXX'
      },
      cvv: {
        elementId: that.id + '-sq-cvv',
        placeholder: 'CVV'
      },
      expirationDate: {
        elementId: that.id + '-sq-expiration-date',
        placeholder: 'MM / YY'
      },
      postalCode: {
        elementId: that.id + '-sq-postal-code',
        placeholder: 'Zip Code'
      },

      // SqPaymentForm callback functions
      callbacks: {
        createPaymentRequest: function () {
          return {
            requestShippingAddress: false,
            requestBillingInfo: true,
            shippingContact: {
              familyName: 'Buyer',
              givenName: 'The',
              email: 'info@risidio.com',
              country: 'USA',
              region: 'CA',
              city: 'San Francisco',
              addressLines: [
                '123 Main St'
              ],
              postalCode: '94114'
            },
            currencyCode: 'USD',
            countryCode: 'US',
            total: {
              label: 'devs-Acceptance',
              amount: '1',
              pending: false
            }
          }
        },
        /*
           * callback function: methodsSupported
           * Triggered when: the page is loaded.
           */
        methodsSupported: function (methods) {
          // Only show the button if Apple Pay for Web is enabled
          // Otherwise, display the wallet not enabled message.
          that.applePay = methods.applePay
          // that.masterpass = methods.masterpass
        },

        /*
           * callback function: cardNonceResponseReceived
           * Triggered when: SqPaymentForm completes a card nonce request
           */
        cardNonceResponseReceived: function (errors, nonce, cardData) {
          if (errors) {
            errors.forEach(function (error) {
              that.errors.push(error.message)
            })
            return
          }
          // Assign the nonce value to the hidden form field
          document.getElementById('card-nonce').value = nonce

          // POST the nonce form to the payment processing page
          // document.getElementById('nonce-form').submit()
          const configuration = that.configuration
          const amountFiat = configuration.payment.amountFiat * configuration.payment.creditAttributes.start * 100
          fetch(configuration.risidioBaseApi + that.submitUrl, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              nonce: nonce,
              idempotencyKey: idempotencyKey,
              currency: configuration.payment.currency,
              amountFiat: amountFiat, // amounts are in smallest denomination (cents, pence, etc)
              locationId: configuration.payment.squarePay.locationId
            })
          }).catch(err => {
            alert('Network error: ' + err)
          }).then(response => {
            if (!response.ok) {
              return response.json().then(
                errorInfo => Promise.reject(errorInfo))
            }
            return response.json()
          }).then(data => {
            // console.log(data)
            data.opcode = 'fiat-payment-success'
            data.numbCredits = configuration.payment.creditAttributes.start
            data.status = 'paid'
            that.$store.commit('rpayStore/setInvoice', data)
            that.$emit('rpayEvent', data)
          }).catch(err => {
            // console.error(err)
            const data = {
              opcode: 'fiat-payment-error',
              reason: err
            }
            that.$emit('rpayEvent', data)
          })
        },
        /*
           * callback function: paymentFormLoaded
           * Triggered when: SqPaymentForm is fully loaded
           */
        paymentFormLoaded: function () {
          // console.log('paymentFormLoaded')
          // document.getElementById('spiner').classList.add('loaded')
          that.showSpinner = false
        }
      }
    })
    this.paymentForm.build()
  },
  methods: {
    // Generate a random UUID as an idempotency key for the payment request
    // length of idempotency_key should be less than 45
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    requestCardNonce: function (event) {
      // Don't submit the form until SqPaymentForm returns with a nonce
      event.preventDefault()

      // Request a nonce from the SqPaymentForm object
      this.paymentForm.requestCardNonce()
    }
  },
  computed: {
    formattedFiat () {
      const configuration = this.configuration
      // const amountFiat = (configuration.payment) ? configuration.payment.amountFiat : '0'
      const amountFiat = configuration.payment.amountFiat * configuration.payment.creditAttributes.start
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
  height: 230px;
  background: #F0EFEF 0% 0% no-repeat padding-box;
  border-radius: 16px;
  opacity: 1;
  padding: 5px 20px;
  margin-bottom: 80px;
  text-align: center;
}

</style>
