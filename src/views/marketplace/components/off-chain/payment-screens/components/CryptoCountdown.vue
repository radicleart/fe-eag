<template>
<b-container>
    <div v-if="finished" class="">
      <b-link class="text-danger" @click.prevent="$emit('rpayEvent', { opcode: 'crypto-payment-expired' })">Expired - start over</b-link>
    </div>
    <div v-else>
      <div>{{ display }}</div>
    </div>
</b-container>
</template>

<script>
import { Duration, DateTime } from 'luxon'
import { APP_CONSTANTS } from '@/app-constants'

// noinspection JSUnusedGlobalSymbols
export default {
  name: 'CryptoCountdown',
  components: {
  },
  props: ['configuration'],
  data () {
    return {
      now: DateTime.local(),
      expires: DateTime.local().plus({ seconds: 10 }),
      tick: null,
      expired: false,
      timeout: this.$store.getters[APP_CONSTANTS.KEY_INVOICE_EXPIRY] // { hours: 0, minutes: 1, seconds: 0 }
    }
  },
  watch: {
    now () {
      if (this.finished) {
        this.$emit('rpayEvent', { opcode: 'crypto-payment-expired' })
        clearInterval(this.tick)
      }
    }
  },
  mounted () {
    this.timeout = this.$store.getters[APP_CONSTANTS.KEY_INVOICE_DURATION]
    const invoice = this.$store.getters[APP_CONSTANTS.KEY_INVOICE]
    if (!invoice) return
    if (invoice.lightning_invoice) this.expires = DateTime.fromMillis(invoice.lightning_invoice.expires_at * 1000)
    if (this.finished || this.expired) {
      this.$emit('rpayEvent', { opcode: 'crypto-payment-expired' })
    }
    this.tick = setInterval(() => {
      this.now = DateTime.local()
    }, 100)
  },
  methods: {
    evPaymentExpired () {
      this.$emit('rpayEvent', { opcode: 'crypto-payment-expired' })
    },
    clockReset () {
      this.expired = true
      this.$emit('rpayEvent', { opcode: 'crypto-payment-expired' })
    }
  },
  computed: {
    finished () {
      return this.now >= this.expires.minus({ seconds: 1 })
    },
    remaining () {
      return this.expires.diff(this.now).toObject()
    },
    display () {
      return Duration.fromObject(this.remaining).toFormat('hh:mm:ss')
    },
    expiresDisplay () {
      return this.expires.toFormat('dd MMM yy hh:mm:ss')
    }
  }
}
</script>
<style lang="scss" scoped>
.tab-content {
  padding-top: 0px;
}
</style>
