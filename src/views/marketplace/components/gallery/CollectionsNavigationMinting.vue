<template>
<b-container id="col-nav" fluid class="py-0 mx-0 px-0 bg-light">
  <div class="d-flex text-primary">
    <div :id="'popover-image-1'" class="bg-white py-2 px-4 border-right">Minting</div>
    <CollectionData :loopRun="loopRun" :index="'1'"/>
  </div>
</b-container>
</template>

<script>
import CollectionData from './CollectionData'

export default {
  name: 'CollectionsNavigationMinting',
  components: {
    CollectionData
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
