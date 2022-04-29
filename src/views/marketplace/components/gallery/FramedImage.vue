<template>
<div v-if="loaded">
  <div class="frame" :class="(forSale) ? 'frame-for-sale' : ''">
    <img :style="displayOptions" :src="imageSrc" />
  </div>
</div>
</template>

<script>
export default {
  name: 'FramedImage',
  components: {
  },
  props: ['imageSrc', 'options', 'forSale'],
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
    displayOptions () {
      return this.options || ''
    }
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
  max-height:100%;
  max-width:100%;
  min-height: 90%;
  min-width: 90%;
}

.frame {
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
  max-width:100%;
  min-width:90%;
  padding:5vmin;
  position:relative;
  text-align:center;
}
.frame-for-sale {
  border-bottom-color:rgb(94, 92, 92);
  border-left-color:rgb(70, 66, 66);
  border-right-color:rgb(71, 60, 60);
  border-top-color:#000;
}
</style>
