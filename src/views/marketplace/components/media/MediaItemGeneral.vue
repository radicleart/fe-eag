<template>
<div>
  <div v-if="contentType === 'threed'" id="video-demo-container">
    <img :class="classes" v-on="$listeners" :src="asset.properties.animation_url" @error="setAltImg">
  </div>
  <div v-else-if="contentType === 'video'" id="video-demo-container">
    <VideoJsPlayer :class="classes" v-on="$listeners"  @error="setAltImg" :options="options"/>
  </div>
  <div v-else-if="contentType === 'audio'" id="audio-demo-container">
    <img :class="classes" v-on="$listeners" :src="asset.properties.animation_url" @error="setAltImg" >
    <audio v-on="$listeners" controls :src="asset.properties.animation_url">
      Your browser does not support the <code>audio</code> element.
    </audio>
  </div>
  <div v-else-if="contentType === 'document'">
    <img :class="classes" v-on="$listeners" :src="asset.properties.animation_url" @error="setAltImg">
  </div>
  <div v-else-if="contentType === 'image'">
    <img :class="classes" v-on="$listeners" :src="image()" @error="imageError()">
  </div>
</div>
</template>

<script>
import VideoJsPlayer from './VideoJsPlayer'
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'MediaItemGeneral',
  components: {
    VideoJsPlayer
  },
  props: ['classes', 'options', 'asset'],
  data () {
    return {
      mediaObjects: [],
      waitingImage: 'https://images.prismic.io/radsoc/f60d92d0-f733-46e2-9cb7-c59e33a15fc1_download.jpeg?auto=compress,format',
      missing: '/img/logo/logo.png',
      contentType: null
    }
  },
  mounted () {
    if (this.asset) {
      this.image()
      this.contentType = 'image'
      if (this.asset.properties && this.asset.properties.animation_url) {
        if (this.asset.properties.animation_url.endsWith('pdf')) {
          this.contentType = 'document'
        } else if (this.asset.properties.animation_url.endsWith('mp4')) {
          this.contentType = 'video'
        } else if (this.asset.properties.animation_url.endsWith('mp3')) {
          this.contentType = 'audio'
        } else if (this.asset.properties.animation_url.endsWith('gltf') || this.asset.properties.animation_url.endsWith('glb')) {
          this.contentType = 'threed'
        }
      }
    }
  },
  computed: {
  },
  methods: {
    setAltImg: function (event) {
      event.target.src = this.waitingImage
    },
    image () {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.asset)
    },
    dimensions: function () {
      if (this.dims) {
        return 'width: 100%; max-height: 300px; min-height: 50px;'
      }
      return 'width: 100%; height: auto'
    },
    imageError () {
      this.image = this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.asset)
    }
  }
}
</script>
<style scoped>

</style>
