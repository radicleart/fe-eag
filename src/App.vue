<template>
<div id="app" :style="getBackground()" class="">
  <RouterView name="header" class="" />
  <RouterView :class="(isHomePage) ? '' : 'ml-5 pb-5'" id="page" @openModal="openModal"/>
  <footer class="mt-auto ml-5 bg-light">
    <RouterView name="footer" />
  </footer>
  <MessageTicker :tickerId="tickerId + '-inner'"/>
  <b-modal size="lg" id="purchase-modal" class="text-left">
    <PurchaseFlow :gaiaAsset="asset" :loopRun="loopRun"/>
  </b-modal>
  <notifications :duration="5000" classes="r-notifs" position="bottom left" width="70%"/>
</div>
</template>
<script>
import { APP_CONSTANTS } from '@/app-constants'
import MessageTicker from '@/views/marketplace/components/gallery/common/MessageTicker'
import PurchaseFlow from '@/views/marketplace/components/toolkit/purchasing/PurchaseFlow'

export default {
  name: 'App',
  components: {
    MessageTicker,
    PurchaseFlow
  },
  data () {
    return {
      background: 'url(https://images.prismic.io/radicle/ca78cb01-2a48-44ea-8945-d72e41fdbc96_EAG+-+WEB+banner+assets-03-sm.jpg?auto=compress,format)',
      loading: true,
      tickerId: 'anti-app',
      loopRun: null,
      asset: null
    }
  },
  beforeCreate () {
    this.$store.commit(APP_CONSTANTS.SET_RPAY_FLOW, { flow: 'config-flow', asset: this.gaiaAsset })
    this.$store.dispatch('initApplication').then(() => {
      document.getElementById(this.tickerId).style.display = 'none'
    })
  },
  mounted () {
    this.readPrismicContent()
  },
  methods: {
    openModal (data) {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      if (!profile.loggedIn) {
        this.$store.dispatch('stacksAuthStore/startLogin').then(() => {
        }).catch((err) => {
          console.log(err)
          // https://chrome.google.com/webstore/detail/stacks-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj
          this.webWalletNeeded = true
        })
      } else {
        if (data.opcode === 'open-purchase') {
          this.asset = data.asset
          this.loopRun = data.loopRun
          this.$bvModal.show('purchase-modal')
        }
      }
    },
    getBackground () {
      if (this.$route.name === 'home') {
        return {
          'z-index': 10,
          width: '100%',
          'background-size': 'cover',
          'background-image': this.background,
          'background-position': 'center'
        }
      }
    },
    readPrismicContent () {
      this.$prismic.client.getSingle('homepage').then(document => {
        if (document) {
          this.$store.commit('contentStore/addHomeContent', document.data)
        }
      })
      this.$prismic.client.getSingle('mainfooter').then((document) => {
        if (document) {
          this.$store.commit('contentStore/addMainFooter', document.data)
        }
        this.$prismic.client.getSingle('dialogs').then(document => {
          if (document) {
            this.$store.commit('contentStore/addDialogs', document.data)
          }
          this.$prismic.client.getSingle('emails').then(document => {
            if (document) {
              this.$store.commit('contentStore/addEmails', document.data)
            }
            this.$prismic.client.getSingle('tooltips').then(document => {
              if (document) {
                this.$store.commit('contentStore/addTooltips', document.data)
              }
            })
          })
        })
      })
      this.$prismic.client.query(
        this.$prismic.Predicates.at('document.type', 'information_page'),
        { pageSize: 40, page: 1 }
      ).then((response) => {
        this.$store.commit('contentStore/addInformation', response.results)
      })
    }
  },
  computed: {
    isHomePage () {
      return this.$route.name === 'home'
    },
    appConfig () {
      const appConfig = this.$store.getters[APP_CONSTANTS.KEY_RPAY_CONFIGURATION]
      return appConfig
    }
  }
}
</script>

<style lang="scss">
</style>
