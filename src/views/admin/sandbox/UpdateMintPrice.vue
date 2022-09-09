<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      <h2>Update Default Mint Price</h2>
        <div class="mb-4">
          <div class="d-flex justify-content-between">
            <div class="text2"><span v-b-tooltip.hover="{ variant: 'warning' }" title="mint price in ustx">Default mint price in ustx</span></div>
          </div>
          <b-input type="number" v-model="mintPrice" placeholder="mint price in micro stx"></b-input>
      </div>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="update()" class="w-50 mr-2" variant="warning">Update</b-button>
      </div>
    </b-card-text>
  </b-card>
</b-card-group>
</template>

<script>
export default {
  name: 'UpdateMintPrice',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
      mintPrice: null
    }
  },
  mounted () {
  },
  methods: {
    update: function () {
      if (!this.mintPrice) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractId: this.loopRun.contractId,
        mintPrice: this.mintPrice
      }
      this.$store.dispatch('rpayPurchaseStore/updateMintPrice', data).then((result) => {
        this.result = result
        this.$notify({ type: 'success', title: 'Mint Price', text: 'Transaction sent: ' + result.txId })
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
