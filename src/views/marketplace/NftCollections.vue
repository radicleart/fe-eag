<template>
<div style="height: 100%" class="bg-light">
  <CollectionsNavigation :filter="filter"/>
  <div class="py-5">
      <b-col cols="12" ref="gallery">
        <vue-horizontal v-if="loaded">
          <div class="pr-5" v-for="(loopRun, index) in allLoopRuns" :key="index">
            <CollectionImage :loopRun="loopRun" :index="index"/>
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
      this.loaded = false
      this.filter = this.$route.query.filter
      this.reload()
    }
  },
  data () {
    return {
      popoverData: {},
      filter: null,
      loaded: false
    }
  },
  mounted () {
    this.reload()
  },
  methods: {
    reload () {
      const $self = this
      Vue.nextTick(function () {
        $self.loaded = true
      }, this)
    }
  },
  computed: {
    allLoopRuns () {
      let loopRuns = this.$store.getters[APP_CONSTANTS.GET_LOOP_RUNS]
      loopRuns = loopRuns.filter((o) => o.status !== 'disabled')
      if (this.filter) {
        loopRuns = loopRuns.filter((o) => o.type !== 'SIP-013')
      } else {
        loopRuns = loopRuns.filter((o) => o.type === 'SIP-013')
      }
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
