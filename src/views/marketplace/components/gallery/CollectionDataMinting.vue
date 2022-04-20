<template>
<div class="bg-light" style="height: 100%;">
  <div class="text-upper p-2 px-3 mb-1 bg-darkish text-white"><b-link class="text-white" :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
  <div class="text-upper p-2 px-3 mb-1 bg-white d-flex justify-content-between">
    <div><span class="text-secondary"></span> {{loopRun.makerName}}</div>
    <div @click="showAdditional = !showAdditional" class="pointer">
      <b-icon v-if="showAdditional" icon="arrow-down-right-circle"/>
      <b-icon v-else icon="arrow-up-right-circle"/>
    </div>
  </div>
  <div v-if="showAdditional">
    <div class="d-flex justify-content-between">
      <div class="w-50 p-2 mr-1 px-3 mb-1 bg-white">AVAILABLE</div>
      <div class="w-50 p-2 ml-0 px-3 mb-1 bg-white">{{loopRun.versionLimit - mintCounter}} of {{loopRun.versionLimit}}</div>
    </div>
    <div class="p-2 px-3 mb-1 bg-white" v-if="commission">PRICE {{commission.price}} {{getSymbol(commission.sipTenToken)}}</div>
    <div class="p-2 px-3 mb-1 bg-white"><a class="text-primary" :href="transactionUrl()" target="_blank">EXPLORER <!--<b-icon class="text-info" font-scale="1.5" icon="arrow-up-right-circle"/>--></a></div>
  </div>
</div>
</template>

<script>

export default {
  name: 'CollectionDataMinting',
  components: {
  },
  props: ['loopRun', 'commissions'],
  data () {
    return {
      showAdditional: false,
      commission: null
    }
  },
  mounted () {
    this.commission = (this.commissions) ? this.commissions.find((o) => o.sipTenToken.contractId.indexOf('unwrapped-stx-token') > -1) : null
  },
  methods: {
    getSymbol: function (sipTenToken) {
      if (sipTenToken.contractId.indexOf('unwrapped-stx-token') > -1) {
        return 'STX'
      }
      return sipTenToken.symbol
    },
    transactionUrl: function (data) {
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + this.loopRun.contractId + '?chain=' + process.env.VUE_APP_NETWORK
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    },
    mintCounter () {
      // const application = this.$store.getters[APP_CONSTANTS.KEY_APPLICATION_FROM_REGISTRY_BY_CONTRACT_ID](this.loopRun.contractId)
      // const counter = (application && application.tokenContract) ? application.tokenContract.mintCounter : 0
      const counter = this.loopRun.tokenCount
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    }
  }
}
</script>
<style scoped>

</style>
