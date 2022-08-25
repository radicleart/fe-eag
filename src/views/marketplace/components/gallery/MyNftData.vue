<template>
<div v-if="asset">
  <b-popover :container="`#${'popover-my-nft-' + asset.contractAsset.contractId + '-' + asset.contractAsset.nftIndex}`" placement="topleft" triggers="hover" variant="light" :target="'popover-my-nft-' + asset.contractAsset.contractId + '-' + asset.contractAsset.nftIndex" custom-class="my-popover-class sub-menu">
    <template #title>My NFT</template>
    <ListingInfo v-on="$listeners" :asset="asset" :classes="''"/>
  </b-popover>
</div>
<div v-else>
  <b-popover placement="topleft" triggers="hover" variant="light" target="'popover-my-nft-' + loopRun.currentRunKey + '-' + asset.contractAsset.nftIndex" custom-class="my-popover-class sub-menu">
    <template #title>My NFTs</template>
    <div class="py-2">All NFTs owned by your address</div>
    <div class="py-2">EAG doesn't support all the projects where these NFTs were minted.</div>
  </b-popover>
</div>
</template>

<script>
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'

export default {
  name: 'MyNftData',
  components: {
    ListingInfo
  },
  props: ['loopRun', 'asset'],
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
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
<style scoped>

</style>
