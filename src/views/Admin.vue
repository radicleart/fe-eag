<template>
<b-container id="admin-page" style="height: 100vh;">
  <b-row>
    <b-col >
      <AllowAssetContract />
    </b-col>
  </b-row>
</b-container>
</template>

<script>
import AllowAssetContract from '@/views/admin/AllowAssetContract'

export default {
  name: 'Home',
  components: {
    AllowAssetContract
  },
  data () {
    return {
      foreground2: 'url(https://images.prismic.io/radicle/f6ceb80b-27d3-42ff-846d-233fd6ed5153_EAG+-+WEB+banner+assets-07-sm.png?auto=compress,format)',
      foreground1: 'url(https://images.prismic.io/radicle/f093502f-8b27-46bd-ab26-0c4dfbb2cb85_EAG+-+WEB+banner+assets-06-sm.png?auto=compress,format)'
    }
  },
  methods: {
    getForeground1 () {
      if (this.$route.name === 'home') {
        return {
          'z-index': 20,
          width: '100%',
          height: '100%',
          'background-repeat': 'no-repeat',
          'background-size': '95%',
          'background-image': this.foreground1,
          'background-position': 'center'
        }
      }
    },
    getForeground2 () {
      if (this.$route.name === 'home') {
        return {
          'z-index': 30,
          width: '100%',
          height: '100%',
          'background-size': '50%',
          'background-repeat': 'no-repeat',
          'background-image': this.foreground2,
          'background-position': 'center'
        }
      }
    }
  }
}
</script>
<style scoped>
</style>
