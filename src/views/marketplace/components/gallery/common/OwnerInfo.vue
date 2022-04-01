<template>
<div>
  <b-link class="text-primary" router-tag="span" v-b-tooltip.hover="{ variant: 'dark' }" :title="'Copy full stacks address'">
    <span ref="flashee" class="mr-3">{{getAddress}}</span>
    <a v-if="owner" href="#" class="pointer" @click.prevent="copyAddress()"><b-icon icon="file-earmark"/></a>
    <input class="mr-3 fake-input" id="copy-address" readonly v-model="owner"/>
  </b-link>
</div>
</template>
<script>

export default {
  name: 'OwnerInfo',
  components: {
  },
  props: ['owner'],
  data () {
    return {
      stxAddress: null
    }
  },
  mounted () {
    this.stxAddress = this.owner
    this.$store.dispatch('rpayStacksContractStore/fetchBnsNames', [this.owner]).then((bnsNames) => {
      if (bnsNames && bnsNames.length > 0) {
        this.bnsName = bnsNames[0].bnsEntry
      }
    })
  },
  methods: {
    copyAddress (value) {
      const copyText = document.querySelector('#copy-address')
      copyText.select()
      document.execCommand('copy')
      this.doFlash()
      this.$notify({ type: 'success', title: 'Copied Address', text: 'Copied to clipboard: ' + copyText.value })
    },
    splitAddress (address) {
      if (!address) return 'unclaimed'
      if (this.$route.name === 'nft-preview' || this.$route.name === 'asset-by-index') return address
      return address.substring(0, 5) + '..' + address.substring(address.length - 5)
    },
    doFlash () {
      const flasher = this.$refs.flashee
      flasher.classList.add('flasher')
      setTimeout(function () {
        flasher.classList.remove('flasher')
      }, 1000)
    }
  },
  computed: {
    getAddress: function () {
      if (this.bnsName) {
        return this.bnsName
      }
      return this.splitAddress(this.owner)
    }
  }
}
</script>
<style scoped>
.flasher {
  border-bottom: 2pt solid #FFCE00;
}

</style>
