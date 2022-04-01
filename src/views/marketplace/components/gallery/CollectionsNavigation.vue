<template>
<b-container id="col-nav" fluid class="py-0 mx-0 px-0 bg-light">
  <div class="d-flex justify-content-between">
    <div class="d-flex text-primary">
      <div :class="(!filter) ? 'bg-white' : ''" class="py-2 px-4 border-right"><b-link to="/nft-collections">Collections</b-link></div>
      <div class="d-flex text-primary" v-if="!loopRun">
        <div :class="(filter ===  'featured') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right pointer"><b-link to="/nft-collections?filter=featured">Featured</b-link></div>
        <div :class="(filter ===  'latest') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right pointer"><b-link to="/nft-collections?filter=latest">Latest Listings</b-link></div>
        <div :class="(filter ===  'upcoming') ? 'bg-white' : ''" class="py-2 px-4 mx-0 border-right pointer"><b-link to="/nft-collections?filter=upcoming">Upcoming</b-link></div>
      </div>
    </div>
  </div>
</b-container>
</template>

<script>
export default {
  name: 'CollectionsNavigation',
  components: {
  },
  props: ['loopRun', 'asset', 'context', 'filter', 'pagingData'],
  data () {
    return {
      iconSN: require('@/assets/img/EAG - WEB UX assets - png/EAG - search neon.png'),
      iconSG: require('@/assets/img/EAG - WEB UX assets - png/EAG - search grey.png'),
      searching: false,
      currentRunKey: null
    }
  },
  mounted () {
    this.currentRunKey = this.$route.params.collectionId
  },
  methods: {
  },
  computed: {
  }
}
</script>
<style scoped>
</style>
