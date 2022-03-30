<template>
  <div :id="(isHomePage) ? 'wallet-dd-home' : 'wallet-dd'" class="py-4 mx-4 text-primary d-flex justify-content-between" v-if="showFooter">
    <div class="d-flex">
      <div class="text-700 mr-3">Electric Art Gallery &copy; 2022</div>
      <div class="d-none d-md-block text-300">Brighton, England, X0 0XX • UK • info@electricart.gallery</div>
    </div>
    <div>
      <img :src="iconPG"  class="icon"/>
    </div>
  </div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'MainFooter',
  components: {
  },
  data () {
    return {
      iconPG: require('@/assets/img/EAG - WEB UX assets - png/EAG - plug bot grey.png'),
      webWalletNeeded: false
    }
  },
  methods: {
    startLogout () {
      this.$store.dispatch('rpayAuthStore/startLogout').then(() => {
        // localStorage.clear()
        // sessionStorage.clear()
        if (this.$route.name !== 'splash') {
          this.$router.push('/')
        }
      })
    },
    startLogin () {
      this.$store.dispatch('rpayAuthStore/startLogin').then(() => {
        if (this.$route.name !== 'my-nfts') {
          this.$router.push('/my-nfts')
        }
      }).catch((err) => {
        console.log(err)
        // https://www.hiro.so/wallet/install-web
        this.webWalletNeeded = true
      })
    }
  },
  computed: {
    isHomePage () {
      return this.$route.name === 'home'
    },
    showFooter () {
      return this.$route.name !== 'home'
    },
    webWalletLink () {
      if (this.$browserDetect.isFirefox) {
        return this.$store.getters[APP_CONSTANTS.KEY_WEB_WALLET_LINK_FIREFOX]
      }
      return this.$store.getters[APP_CONSTANTS.KEY_WEB_WALLET_LINK_CHROME]
    },
    loggedIn () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile.loggedIn
    },
    content () {
      const content = this.$store.getters['contentStore/getMainFooter']
      return content
    }
  }
}
</script>

<style lang="scss">
</style>
