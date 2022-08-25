<template>
<div class="ml-5 bg-light" :key="componentKey" v-if="loaded">
  <CollectionsNavigationMyNfts :context="'my-nfts'" :loopRun="loopRun" />
  <b-container fluid class="px-5 mt-5 bg-light" >
    <b-row>
      <b-col cols="12">
        <MyPageableItems :loopRun="loopRun"/>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script>
import MyPageableItems from '@/views/marketplace/components/gallery/MyPageableItems'
import CollectionsNavigationMyNfts from '@/views/marketplace/components/gallery/CollectionsNavigationMyNfts'

export default {
  name: 'MyNftLibrary',
  components: {
    MyPageableItems,
    CollectionsNavigationMyNfts
  },
  data () {
    return {
      loaded: false,
      componentKey: 0,
      currentRunKey: null,
      loopRun: null,
      filter: null
    }
  },
  watch: {
    '$route' () {
      this.currentRunKey = this.$route.params.collectionId
      this.loadLoop(true)
    }
  },
  mounted () {
    this.currentRunKey = this.$route.params.collectionId
    this.loadLoop()
  },
  methods: {
    loadLoop (reset) {
      if (!this.currentRunKey) {
        this.loopRun = null
        this.loaded = true
        if (reset) this.componentKey++
      } else {
        this.$store.dispatch('stacksApiStore/fetchLoopRun', this.currentRunKey).then((loopRun) => {
          this.loopRun = loopRun
          this.loaded = true
          if (reset) this.componentKey++
        })
      }
    }
  },
  computed: {
  }
}
</script>
<style scoped>
</style>
