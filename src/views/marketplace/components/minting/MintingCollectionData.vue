<template>
<div class="text-whiter mt-2 text-small">
  <b-row>
    <b-col cols="6"><img @contextmenu="handler($event)" style="" width="100%" :src="getCollectionImageUrl(loopRun)"/></b-col>
    <b-col cols="6">
      <b-row>
        <b-col cols="12">{{loopRun.currentRun}}</b-col>
        <b-col cols="12">
          by <span class="text-warning text-xsmall" v-b-tooltip.hover="{ variant: 'warning' }"  :title="'Collection key: ' + loopRun.currentRunKey">{{loopRun.makerName}}</span>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'MintingCollectionData',
  components: {
  },
  props: ['item', 'loopRun'],
  data () {
    return {
      hashone: require('@/assets/img/marketplace/STX_icon.svg')
    }
  },
  methods: {
    getCollectionImageUrl (item) {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](item)
    },
    handler: function (e) {
      e.preventDefault()
    }
  },
  computed: {
    profile () {
      return this.$store.getters['rpayAuthStore/getMyProfile']
    },
    image () {
      if (!this.item) {
        return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL]({})
      }
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.item)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
