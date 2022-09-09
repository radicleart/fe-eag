<template>
<div class="bg-light" v-if="allowed">
  <b-container fluid class="text-primary p-3" v-if="available">
    <div v-if="mintPasses < 0">Checking for mint passes</div>
    <div v-else-if="canMint">{{available}} available - you have {{mintPasses}} mint passes - <b-link :to="'/minting/' + loopRun.makerUrlKey + '/' + loopRun.currentRunKey">mint here</b-link></div>
    <div v-else-if="canMintForFiat">{{available}} available - <b-link :to="'/minting/' + loopRun.makerUrlKey + '/' + loopRun.currentRunKey">mint here</b-link></div>
    <div v-else>No mint pass</div>
  </b-container>
</div>
</template>

<script>
export default {
  name: 'MintPassChecker',
  components: {
  },
  watch: {
    '$route' () {
    }
  },
  props: ['loopRun'],
  data () {
    return {
      resultSet: null,
      componentKey: 0,
      mintPasses: -1,
      minted: false
    }
  },
  mounted () {
    if (this.allowed && this.profile.loggedIn && this.loopRun.status !== 'unrevealed') {
      const data = {
        stxAddress: this.profile.stxAddress,
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        currentRunKey: this.loopRun.currentRunKey
      }
      this.$store.dispatch('stacksPurchaseStore/lookupMintPassBalance', data).then((result) => {
        if (result && result.result && result.result.value > 0) {
          this.mintPasses = Number(result.result.value)
        } else {
          this.mintPasses = 0
        }
      }).catch(() => {
        this.mintPasses = 0
      })
    }
  },
  methods: {
  },
  computed: {
    allowed () {
      return this.loopRun && this.loopRun.type !== 'SIP-013'
    },
    available () {
      return this.loopRun.versionLimit - this.mintCounter
    },
    canMint () {
      return this.available > 0 && this.mintPasses > 0
    },
    canMintForFiat () {
      return this.available > 0
    },
    mintCounter () {
      const counter = this.loopRun.tokenCount
      if (this.loopRun.offset === 0) return counter + 1
      return counter
    },
    availableMessage () {
      if (this.mintPasses > 0 && this.available > 0) {
        return this.available + ' left - you can mint ' + this.mintPasses
      } else if (this.available > 0) {
        return this.available + ' available to mint - note you can only mint with a mint pass!'
      } else {
        return this.loopRun.versionLimit + ' minted'
      }
    },
    profile () {
      const profile = this.$store.getters['stacksAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
