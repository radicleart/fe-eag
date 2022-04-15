<template>
<div>
  <b-popover no-caret placement="topleft" triggers="hover" variant="transparent" :target="'popover-image-' + index" custom-class="my-popover-class sub-menu">
    <CollectionData :loopRun="loopRun"/>
  </b-popover>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CollectionData from './CollectionData'

export default {
  name: 'CollectionPopover',
  components: {
    CollectionData
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
