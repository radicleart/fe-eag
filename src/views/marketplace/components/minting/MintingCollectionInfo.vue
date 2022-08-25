<template>
<div class="">
  <b-row style="height: 95%;">
    <b-col cols="6" align-self="start"><img @contextmenu="handler($event)" style="" width="100%" :src="getCollectionImageUrl(loopRun)"/></b-col>
    <b-col cols="6" align-self="center">
      <CollectionDataMinting :commissions="commissions" :loopRun="loopRun" />
    </b-col>
  </b-row>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import CollectionDataMinting from '@/views/marketplace/components/gallery/CollectionDataMinting'

export default {
  name: 'MintingCollectionInfo',
  components: {
    CollectionDataMinting
  },
  props: ['item', 'loopRun', 'commissions'],
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
      return this.$store.getters['stacksAuthStore/getMyProfile']
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
