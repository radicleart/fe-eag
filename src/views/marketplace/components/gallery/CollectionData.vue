<template>
<div class="bg-light" style="height: 100%;">
  <div class="p-2 px-3 bg-light" style="margin-bottom: 0.1rem;"><b-link class="text-primary" :to="'/nft-collection/' + loopRun.contractId">{{loopRun.currentRun}}</b-link></div>
  <div class="text-lower p-1 px-3 bg-white" style="margin-bottom: 0.1rem;"><span class="text-secondary">by:</span> {{loopRun.makerName}}</div>
  <div class="text-lower p-1 px-3 bg-white" style="margin-bottom: 0.1rem;">LIMIT: {{loopRun.versionLimit}}</div>
  <div class="text-lower p-1 px-3 bg-white" style="margin-bottom: 0.1rem;">MINTED: {{mintCounter}}</div>
  <div class="p-1 px-3 bg-white" style="margin-bottom: 0.1rem;"><a class="text-primary" :href="transactionUrl()" target="_blank">EXPLORER <!--<b-icon class="text-info" font-scale="1.5" icon="arrow-up-right-circle"/>--></a></div>
</div>
</template>

<script>
export default {
  name: 'CollectionData',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
      showOverlay: false
    }
  },
  mounted () {
  },
  methods: {
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
