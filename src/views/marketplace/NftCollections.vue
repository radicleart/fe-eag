<template>
<div style="height: 100%" class="bg-light">
  <CollectionsNavigation :filter="filter"/>
  <div class="py-5">
      <b-col cols="12" ref="gallery">
        <vue-horizontal v-if="loaded">
          <div class="pr-5" v-for="(loopRun, index) in allLoopRuns" :key="index">
            <CollectionImage :loopRun="loopRun" :index="index" :options="{ 'min-width': '400px' }"/>
          </div>
        </vue-horizontal>
        <b-container v-else>
          No Collections found.
        </b-container>
      </b-col>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import { APP_CONSTANTS } from '@/app-constants'
import utils from '@/services/utils'
import VueHorizontal from 'vue-horizontal'
import CollectionImage from '@/views/marketplace/components/gallery/CollectionImage'
import CollectionsNavigation from '@/views/marketplace/components/gallery/CollectionsNavigation'

export default {
  name: 'NftCollections',
  components: {
    VueHorizontal,
    CollectionImage,
    CollectionsNavigation
  },
  watch: {
    '$route' () {
      this.filter = this.$route.query.filter
    }
  },
  data () {
    return {
      popoverData: {},
      filter: null,
      loaded: false,
      rightSpace: 0
    }
  },
  mounted () {
    const $self = this
    const $ele = this.$refs.gallery
    Vue.nextTick(function () {
      $self.rightSpace = ($ele.clientWidth * 50) / 100
      $self.loaded = true
    }, this)
  },
  methods: {
  },
  computed: {
    allLoopRuns () {
      let loopRuns = this.$store.getters[APP_CONSTANTS.GET_LOOP_RUNS]
      loopRuns = loopRuns.filter((o) => o.status !== 'disabled')
      return utils.sortLoopRuns(loopRuns)
    },
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
<style scoped>
</style>
