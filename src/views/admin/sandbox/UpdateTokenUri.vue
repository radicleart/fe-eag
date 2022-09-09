<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      <h2>Update Base Token URI</h2>
        <div class="mb-4">
          <div class="d-flex justify-content-between">
            <div class="text2"><span v-b-tooltip.hover="{ variant: 'warning' }" title="Token URI">Default token uri</span></div>
          </div>
          <b-input v-model="tokenUri" placeholder="ipfs://QmVXvcdKHUcg1RcsxAASmdAJAJtnxdE4YngcDiuAXcREZN/thisisnumberone-{id}.json"></b-input>
          <div class="text-xsmall">e.g. ipfs://QmVXvcdKHUcg1RcsxAASmdAJAJtnxdE4YngcDiuAXcREZN/thisisnumberone-{id}.json</div>
        </div>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="update()" class="w-50 mr-2" variant="light">Update</b-button>
      </div>
    </b-card-text>
  </b-card>
</b-card-group>
</template>

<script>
export default {
  name: 'UpdateTokenUri',
  components: {
  },
  props: ['contractId'],
  data () {
    return {
      tokenUri: null
    }
  },
  mounted () {
  },
  methods: {
    update: function () {
      if (!this.tokenUri) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractId: this.contractId,
        tokenUri: this.tokenUri
      }
      this.$store.dispatch('stacksPurchaseStore/updateTokenUri', data).then((result) => {
        this.result = result
        this.$notify({ type: 'success', title: 'Token URI', text: 'Transaction sent: ' + result.txId })
      })
    }
  },
  computed: {
  }
}
</script>
<style lang="scss" scoped>
.text2 {
  text-transform: capitalize;
}

</style>
