<template>
<div>
  <b-popover placement="topleft" triggers="hover" variant="transparent" :target="'popover-image-' + index" custom-class="my-popover-class sub-menu">
    <div class="bg-dark" style="height: 100%;">
      <div class="p-2 px-3 mb-1 bg-light"><b-link class="text-primary" :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
      <div class="text-lower p-2 px-3 mb-1 bg-white"><span class="text-secondary">by:</span> {{loopRun.makerName}}</div>
      <div class="text-lower p-2 px-3 mb-1 bg-white">LIMIT: {{loopRun.versionLimit}}</div>
      <div class="text-lower p-2 px-3 mb-1 bg-white">MINTED: {{mintCounter}}</div>
    <div class="p-2 px-3 mb-1 bg-light"><a class="text-primary" :href="transactionUrl()" target="_blank">EXPLORER <!--<b-icon class="text-info" font-scale="1.5" icon="arrow-up-right-circle"/>--></a></div>
    </div>
  </b-popover>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'CollectionData',
  components: {
  },
  props: ['loopRun', 'index'],
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
      const application = this.$store.getters[APP_CONSTANTS.KEY_APPLICATION_FROM_REGISTRY_BY_CONTRACT_ID](this.loopRun.contractId)
      const counter = (application && application.tokenContract) ? application.tokenContract.mintCounter : 0
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    }
  }
}
</script>
<style scoped>

</style>
