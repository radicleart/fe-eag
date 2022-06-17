<template>
<b-container v-if="loaded" class="mt-5">
  <StatementList :payments="payments"/>
</b-container>
<b-container v-else>
  Looking for purchases..
</b-container>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import StatementList from '@/views/accounts/components/StatementList'

export default {
  name: 'Invoices',
  components: {
    StatementList
  },
  data () {
    return {
      loaded: false,
      payments: null
    }
  },
  mounted () {
    const data = {
      stxAddress: this.profile.stxAddress
    }
    this.$store.dispatch('merchantStore/fetchPurchases', data).then((payments) => {
      this.payments = payments
      this.loaded = true
    })
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
