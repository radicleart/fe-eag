<template>
<div v-if="loaded">
  <div class="frame">
    <img :src="imageSrc" />
  </div>
</div>
</template>

<script>
export default {
  name: 'FramedDisplayImage',
  components: {
  },
  props: ['imageSrc'],
  data () {
    return {
      loaded: false,
      // frameWP: 'url(https://images.prismic.io/dbid/381a6482-a6e3-4c6d-854d-bc1b156bb600_EAG+-+White+Blank+Frame+Portrait.jpg?auto=compress,format)',
      frameWidth: null,
      frameHeight: null,
      imageWidth: null,
      imageHeight: null,
      renderedWidth: null,
      renderedHeight: null,
      parentWidth: null,
      parentHeight: null
    }
  },
  mounted () {
    this.parentWidth = this.$parent.$el.clientWidth
    this.loaded = true
  },
  methods: {
  },
  computed: {
  }
}
</script>
<style scoped>
img {
  border:solid 0px;
  border-bottom-color:#ffe;
  border-left-color:#eed;
  border-right-color:#eed;
  border-top-color:#ccb;
  width:100%;
  min-height: 90%;
  min-width: 90%;
}

.frame {
  background-color:#fbfbfb;
  border:solid 1.5vmin #eee;
  border-bottom-color:#fff;
  border-left-color:#eee;
  border-radius:2px;
  border-right-color:#eee;
  border-top-color:#ddd;
  box-shadow:0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0,0,0,.25);
  box-sizing:border-box;
  display:inline-block;
  margin: 0 0vh 0vh 0vw;
  min-width:200px;
  min-height:200px;
  width:100%;
  padding:5vmin;
  position:relative;
  text-align:center;
}
</style>
