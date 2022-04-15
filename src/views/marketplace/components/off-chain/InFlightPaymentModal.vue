<template>
  <b-card-group>
    <b-card class="p-3" style="width: 100%;" bg-variant="white" header-tag="header" footer-tag="footer">
      <b-card-text>
        <div class="text-right"><img width="60%" :src="iconLN" /></div>
      </b-card-text>
      <b-card-text class="">
        <h4 class="pointer mb-4 border-bottom text-upper">Purchase History</h4>
        <div class="" v-for="(payment, index) in payments" :key="index">
          <PaymentDetails :payment="payment"/>
        </div>
      </b-card-text>
    </b-card>
  </b-card-group>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import PaymentDetails from './PaymentDetails'

export default {
  name: 'InFlightPaymentModal',
  components: {
    PaymentDetails
  },
  props: ['payments'],
  data () {
    return {
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo grey.png'),
      nftRecipient: null
    }
  },
  mounted () {
    this.nftRecipient = this.profile.stxAddress
  },
  methods: {
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style lang="scss">
</style>
