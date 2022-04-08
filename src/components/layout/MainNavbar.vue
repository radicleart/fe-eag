<template>
<div :id="(isHomePage) ? 'wallet-dd-home' : 'wallet-dd'">
<b-navbar class="">
  <b-navbar-brand href="#" to="/">
    <img :src="iconLN" v-if="isHomePage" class="d-none d-md-block pointer" width="350px" height="auto"/>
    <img :src="iconLG"  v-else class="d-none d-md-block pointer" style="width: 350px; height: auto;"/>
    <img :src="iconPG"  class="d-md-none d-sm-block pointer icon"/>
  </b-navbar-brand>
  <!--
  <b-navbar-toggle class="" target="nav-collapse">
    <template v-slot:default="{ expanded }">
      <WalletNeonIcon v-if="expanded && isHomePage" class="pointer icon" style="max-width: 100px; max-height: 100px;"/>
      <WalletNeonIcon v-if="!expanded && isHomePage" class="pointer icon" style="max-width: 100px; max-height: 100px;"/>
      <WalletGreyIcon v-if="expanded && !isHomePage" class="pointer icon" style="max-width: 100px; max-height: 100px;"/>
      <WalletGreyIcon v-if="!expanded && !isHomePage" class="pointer icon" style="max-width: 100px; max-height: 100px;"/>
    </template>
  </b-navbar-toggle>
  -->
  <b-collapse id="nav-collapse" is-nav class="show">
    <b-navbar class="mx-auto">
      <b-nav-item-dropdown style="list-style: none;" class="" left v-if="profile.loggedIn" no-caret>
        <template v-slot:button-content>
          <img :src="iconHN" v-if="!isHomePage" class="ml-5 pointer icon"/>
        </template>
        <b-dropdown-item>JOURNEY</b-dropdown-item>
        <b-dropdown-item>MARKETPLACE</b-dropdown-item>
        <b-dropdown-item>COMMUNITY</b-dropdown-item>
        <b-dropdown-item>CREATE</b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar>
    <b-navbar class="ml-auto">
      <ExchangeRates class="d-none d-sm-block"/>
      <b-nav-item-dropdown style="list-style: none;" class="" right v-if="profile.loggedIn" no-caret>
        <template v-slot:button-content>
          <img :src="iconWN" v-if="isHomePage" class="pointer icon"/>
          <img :src="iconWG" v-else class="pointer icon"/>
        </template>
        <b-dropdown-item>{{username}}</b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item v-if="profile.superAdmin" to="/swaps">STX Swap</b-dropdown-item>
        <b-dropdown-item to="/nft-collections">Collections</b-dropdown-item>
        <b-dropdown-item to="/my-nfts">My NFTs</b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item class="text-left text-small">
          <OwnerInfo :owner="profile.stxAddress" />
        </b-dropdown-item>
        <b-dropdown-item v-if="profile.accountInfo" class="text-right text-small">
          <span>Balance: {{profile.accountInfo.balance}} STX</span>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item>
          <span @click="startLogin()">Switch Account</span>
        </b-dropdown-item>
        <b-dropdown-item>
          <span @click="startLogout()">Logout</span>
        </b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item style="list-style: none;" class="nav-text" v-else>
        <a href="#" class="text-info" v-if="isHomePage" @click="startLogin()">Connect Wallet</a>
        <a href="#" v-else @click="startLogin()">Connect Wallet</a>
      </b-nav-item>
    </b-navbar>
  </b-collapse>
</b-navbar>
<!--
<b-navbar toggleable="md" type="light" class="m-0 p-0" style="height: 60px;">
  <b-navbar-brand href="#">
    <div style="width: 100px; height: 100px;">
      <HamburgerIcon class="icon" style="width: 100px; height: 100px;"/>
    </div>
  </b-navbar-brand>
</b-navbar>
-->
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import ExchangeRates from '@/components/tokens/ExchangeRates'
import OwnerInfo from '@/views/marketplace/components/gallery/common/OwnerInfo'

export default {
  name: 'MainNavbar',
  props: {
    transparent: Boolean,
    colorOnScroll: Number
  },
  components: {
    ExchangeRates,
    OwnerInfo
  },
  watch: {
  },
  data () {
    return {
      iconHN: require('@/assets/img/EAG - WEB UX assets - png/EAG - hamburger grey.png'),
      iconWN: require('@/assets/img/EAG - WEB UX assets - png/EAG - wallet neon.png'),
      iconWG: require('@/assets/img/EAG - WEB UX assets - png/EAG - wallet grey.png'),
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo neon.png'),
      iconLG: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo grey.png'),
      iconPG: require('@/assets/img/EAG - WEB UX assets - png/EAG - plug bot grey.png'),
      localPlayMode: false
    }
  },
  methods: {
    balance () {
      const profile = this.profile
      return (profile && profile.wallet) ? profile.wallet.balance : 0
    },
    stxAddress () {
      const profile = this.profile
      if (profile.wallet && profile.wallet.keyInfo.address) {
        return profile.wallet.keyInfo.address.substring(0, 5) + '...' + profile.wallet.keyInfo.address.substring(profile.wallet.keyInfo.address.length - 5)
      }
      return 'n/a'
    },
    startLogout () {
      // this.$emit('updateEventCode', { eventCode: 'connect-logout' })
      this.$store.dispatch('rpayAuthStore/startLogout').catch((err) => {
        console.log(err)
        this.$store.commit(APP_CONSTANTS.SET_WEB_WALLET_NEEDED)
      })
    },
    startLogin () {
      // this.$emit('updateEventCode', { eventCode: 'connect-login' })
      const myProfile = this.$store.getters['rpayAuthStore/getMyProfile']
      if (myProfile.loggedIn) {
        // this.$emit('connect-login', myProfile)
        this.$store.dispatch('rpayAuthStore/startLogout').then(() => {
          this.$store.dispatch('rpayAuthStore/startLogin').catch(() => {
            // https://www.hiro.so/wallet/install-web
            this.$store.commit(APP_CONSTANTS.SET_WEB_WALLET_NEEDED)
          })
        })
      } else {
        this.$store.dispatch('rpayAuthStore/startLogin').catch(() => {
          // https://www.hiro.so/wallet/install-web
          this.$store.commit(APP_CONSTANTS.SET_WEB_WALLET_NEEDED)
        })
      }
    },
    changeProvider (provider) {
      if (provider) {
        this.$store.commit(APP_CONSTANTS.COMMIT_PROVIDER, provider)
        this.$store.dispatch('initApplication').then(() => {
          this.$store.dispatch('fetchWalletBalances')
          this.$notify({ type: 'success', title: 'Provider', text: 'Network provider has been updated - the provider determines how transactions are broadcast to the blockchain!' })
        })
      }
    },
    isActive (route) {
      return (this.$route.name === route) ? 'active' : 'text-light'
    },
    changeNetworkId (networkId) {
      if (networkId && networkId === 'testnet') {
        this.$store.commit(APP_CONSTANTS.COMMIT_NETWORK_ID, networkId)
      } else {
        this.$notify({ type: 'warning', title: 'Networks', text: 'Stacks 2.0 is not yet live!' })
      }
    }
  },
  computed: {
    isHomePage () {
      return this.$route.name === 'home'
    },
    stxRate () {
      const stxRate = this.$store.getters[APP_CONSTANTS.KEY_STX_RATE]
      return stxRate
    },
    // playMode () {
    // const playMode = this.$store.getters[APP_CONSTANTS.KEY_PLAY_MODE]
    // return playMode
    // },
    provider () {
      const provider = this.$store.getters[APP_CONSTANTS.KEY_PROVIDER]
      return provider
    },
    networkId () {
      const networkId = this.$store.getters[APP_CONSTANTS.KEY_NETWORK_ID]
      return networkId
    },
    username () {
      const profile = this.profile
      return profile.name || profile.stxAddress
    },
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile || {}
    }
  }
}
</script>

<style lang="scss">
</style>
