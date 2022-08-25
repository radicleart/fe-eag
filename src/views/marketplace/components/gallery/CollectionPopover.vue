<template>
<div>
  <b-popover no-caret placement="bottom" triggers="hover" variant="transparent" :target="'popover-image-' + index" custom-class="my-popover-class sub-menu">
    <CollectionData :loopRun="loopRun" style="top: -300px;"/>
  </b-popover>
</div>
</template>

<script>
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
