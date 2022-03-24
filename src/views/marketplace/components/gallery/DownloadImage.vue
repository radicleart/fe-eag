<template>
<span>
  <span v-b-tooltip.bottom title="Download image to share on social media!" class="pointer" @click.prevent="download">
    <b-icon class="text-info arrow-repeat" font-scale="1" icon="arrow-down-circle"></b-icon>
  </span>
  <!-- <a v-b-tooltip.bottom title="Download" class="text-info text-light ml-3" href="#" @click.prevent="download"><b-icon class="text-info arrow-repeat" font-scale="1" icon="arrow-down-circle"></b-icon></a> -->
</span>
</template>

<script>
// import imageDataURI from 'image-data-uri'

export default {
  name: 'DownloadImage',
  components: {
  },
  props: ['image', 'name'],
  data () {
    return {
      // downloadIcon: require('@/assets/img/download_icon.png')
    }
  },
  methods: {
    toDataUrl (url, callback) {
      var xhr = new XMLHttpRequest()
      xhr.onload = function () {
        var reader = new FileReader()
        reader.onloadend = function () {
          callback(reader.result)
        }
        reader.readAsDataURL(xhr.response)
      }
      xhr.open('GET', url)
      xhr.responseType = 'blob'
      xhr.send()
    },
    download () {
      const $self = this
      this.toDataUrl(this.image, function (dataUrl) {
        const image = dataUrl.replace('image/png', 'image/octet-stream')
        const link = document.createElement('a')
        link.download = $self.name + '.png'
        link.href = image
        link.click()
      })
      /**
      const extUrl = this.image
      imageDataURI.encodeFromURL(extUrl).then(dataUrl => {
        const image = dataUrl.replace('image/png', 'image/octet-stream')
        const link = document.createElement('a')
        link.download = this.name + '.png'
        link.href = image
        link.click()
      }).catch(() => {
        imageDataURI.encodeFromURL(extUrl).then(dataUrl => {
          // RETURNS image data URI :: 'data:image/pngbase64,PNGDATAURI/'
          const image = dataUrl.replace('image/png', 'image/octet-stream')
          const link = document.createElement('a')
          link.download = this.name + '.png'
          link.href = image
          link.click()
        })
      })
      **/
    }
  },
  computed: {
  }
}
</script>
<style scoped>
</style>
