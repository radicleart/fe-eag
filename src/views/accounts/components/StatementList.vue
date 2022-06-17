<template>
<div>
  <h4 class="mb-4 text-upper">Purchase History</h4>
  <b-row>
    <b-col>Created</b-col>
    <b-col>Status</b-col>
    <b-col>Amount</b-col>
    <b-col>Type</b-col>
    <b-col></b-col>
  </b-row>
  <div v-for="(invoice, index) in payments" :key="index">
    <LineItem :invoice="invoice"/>
  </div>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import LineItem from './LineItem'

export default {
  name: 'InFlightPaymentModal',
  components: {
    LineItem
  },
  props: ['payments'],
  data () {
    return {
    }
  },
  mounted () {
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
