<template>
<div v-if="loaded" class="ml-5 bg-light">
  <CollectionsNavigation :context="'my-nfts'" :loopRun="loopRun" />
  <b-container :key="componentKey" fluid class="px-5 text-white mt-5">
    <b-row>
      <b-col cols="12">
        <MyPageableItems/>
      </b-col>
    </b-row>
  </b-container>
</div>
<b-container v-else>
  No NFTs found.
</b-container>
</template>

<script>
import MyPageableItems from '@/views/marketplace/components/gallery/MyPageableItems'
import CollectionsNavigation from '@/views/marketplace/components/gallery/CollectionsNavigation'

export default {
  name: 'MyNftLibrary',
  components: {
    MyPageableItems,
    CollectionsNavigation
  },
  data () {
    return {
      componentKey: 0,
      loaded: false
    }
  },
  watch: {
    '$route' () {
      this.componentKey++
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
  }
}
</script>
<style scoped>
</style>
