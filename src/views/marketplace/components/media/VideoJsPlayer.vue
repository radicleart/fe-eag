<template>
  <div class="video-frame" v-touch:tap="clickedMe" @click.prevent="clickedMe" @mouseover="playMe()" @mouseout="pauseMe()" :style="options.dimensions">
    <video :style="displayImage" :poster="poster()" ref="videoPlayer" class="poster-img video-js vjs-theme-city vjs-big-play-centered"></video>
  </div>
</template>

<script>
import videojs from 'video.js'

export default {
  name: 'VideoJsPlayer',
  props: {
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      player: null
    }
  },
  mounted () {
    console.log(this.options)
    const $self = this
    this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady () {
      console.log('onPlayerReady', this)
      $self.player.controls($self.options.controls)
    })
    if (this.options.autoplay) {
      this.player.play()
    }
    this.player.on('pause', function () {
      this.bigPlayButton.show()
      // Now the issue is that we need to hide it again if we start playing
      // So every time we do this, we can create a one-time listener for play events.
    })
    this.player.on('play', function () {
      this.bigPlayButton.hide()
    })
  },
  beforeDestroy () {
    if (this.player) {
      this.player.dispose()
    }
  },
  methods: {
    playMe: function () {
      if (this.options.bigPlayer) return
      if (this.options.emitOnHover) {
        this.$emit('videoHover', this.options)
      }
      if (this.options.playOnHover) {
        this.player.play()
      }
    },
    pauseMe: function () {
      if (this.options.bigPlayer) return
      if (this.options.emitOnHover) {
        this.$emit('videoHoverOut', this.options)
      }
      if (this.options.playOnHover) {
        this.player.pause()
      }
    },
    clickedMe: function () {
      if (this.options.bigPlayer) return
      this.player.pause()
      this.$emit('videoClicked')
    },
    poster: function () {
      if (this.options.poster) {
        return this.options.poster
      }
    }
  },
  computed: {
    displayImage () {
      return {
        width: '100%;',
        'min-height': 'auto;'
      }
    }
  }
}
</script>

<style>
  .video-js {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
}
.vjs-paused.vjs-big-play-button {
  display: none;
}
.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: none;
}
.video-js .vjs-big-play-button {
  text-align: center;
}
.video-js .vjs-big-play-button:hover {
  background-color: #000 !important;
}

.poster-img {
  border:solid 0px;
  border-bottom-color:#ffe;
  border-left-color:#eed;
  border-right-color:#eed;
  border-top-color:#ccb;
  max-height:100%;
  max-width:100%;
  min-height: 90%;
  min-width: 90%;
}

.video-frame {
  background-color:#ddc;
  border:solid 1.5vmin #eee;
  border-bottom-color:#fff;
  border-left-color:#eee;
  border-radius:2px;
  border-right-color:#eee;
  border-top-color:#ddd;
  box-shadow:0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0,0,0,.25);
  box-sizing:border-box;
  display:inline-block;
  margin: 0 2vh 4vh 0vw;
  height:auto;
  min-width:200px;
  min-height:200px;
  width:100%;
  padding:0vmin;
  position:relative;
  text-align:center;
}

</style>
