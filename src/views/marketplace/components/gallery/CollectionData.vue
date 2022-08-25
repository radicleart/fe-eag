<template>
<div class="bg-light" style="height: 100%;">
  <div class="p-2 px-3 bg-light" style="margin-bottom: 0.1rem;"><b-link class="text-primary" :to="'/nft-collection/' + loopRun.contractId">{{loopRun.currentRun}}</b-link></div>
  <div class="p-1 px-3 bg-white" style="margin-bottom: 0.1rem;"><span class="text-secondary">By:</span> {{loopRun.makerName}}</div>
  <div class="p-1 px-3 bg-white" style="margin-bottom: 0.1rem;">Collection of {{loopRun.versionLimit}}</div>
  <!--<div class="p-1 px-3 bg-white" style="margin-bottom: 0.1rem;">Minted: {{mintCounter}}</div>-->
  <div class="p-1 px-3 bg-white" style="margin-bottom: 0.1rem;"><a class="text-secondary" :href="transactionUrl()" target="_blank">Show on Explorer <!--<b-icon class="text-info" font-scale="1.5" icon="arrow-up-right-circle"/>--></a></div>
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
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    },
    mintCounter () {
      const counter = this.loopRun.tokenCount
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    }
  }
}
</script>
<style scoped>

</style>
