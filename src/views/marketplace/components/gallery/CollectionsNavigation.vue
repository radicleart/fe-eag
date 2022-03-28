<template>
<b-container fluid class="py-0 mx-0 px-0 bg-light" v-if="context && context === 'my-nfts'">
  <div class="d-flex text-primary">
    <div class="py-2 px-4 bg-white border-right"><b-link to="/my-nfts">My NFTs</b-link></div>
    <div v-if="loopRun">
      <div class="py-2 px-4 mx-0 border-right"><b-link :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
    </div>
    <div v-if="gaiaAsset">
      <div class="py-2 px-4 mx-0 border-right"># {{gaiaAsset.contractAsset.nftIndex}}</div>
    </div>
    <div class="d-flex text-primary" v-if="!loopRun">
      <div class="py-2 px-4 mx-0 border-right">Featured</div>
      <div class="py-2 px-4 mx-0 border-right">Latest Listings</div>
      <div class="py-2 px-4 mx-0 border-right">Upcoming</div>
    </div>
  </div>
</b-container>
<b-container fluid class="py-0 mx-0 px-0 bg-light" v-else>
  <div class="d-flex text-primary">
    <div class="py-2 px-4 bg-white border-right"><b-link to="/nft-collections">Collections</b-link></div>
    <div v-if="loopRun">
      <div class="py-2 px-4 mx-0 border-right"><b-link :to="'/nft-collection/' + loopRun.currentRunKey">{{loopRun.currentRun}}</b-link></div>
    </div>
    <div v-if="gaiaAsset">
      <div class="py-2 px-4 mx-0 border-right"># {{gaiaAsset.contractAsset.nftIndex}}</div>
    </div>
    <div class="d-flex text-primary" v-if="!loopRun">
      <div class="py-2 px-4 mx-0 border-right">Featured</div>
      <div class="py-2 px-4 mx-0 border-right">Latest Listings</div>
      <div class="py-2 px-4 mx-0 border-right">Upcoming</div>
    </div>
  </div>
</b-container>
</template>

<script>
export default {
  name: 'CollectionsNavigation',
  components: {
  },
  props: ['loopRun', 'gaiaAsset', 'context'],
  data () {
    return {
      loaded: false
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
<style scoped>
</style>
