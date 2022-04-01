<template>
<b-container id="home-page" style="height: 100vh;">
  <b-row align-v="center" align-h="center" style="height: 100%;">
    <b-col class="text-center"><b-link class="text-info" to="/nft-collections">Collections</b-link></b-col>
    <b-col md="8" sm="none" class="text-center" :style="getForeground1()"><div :style="getForeground2()"></div></b-col>
    <b-col class="text-center"><b-link class="text-info" to="/artists">Artists</b-link></b-col>
  </b-row>
</b-container>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  components: {
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
