<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      <h2>Update Signing Key</h2>
        <div class="mb-4">
          <div class="d-flex justify-content-between">
            <div class="text2"><span v-b-tooltip.hover="{ variant: 'warning' }" title="signer - public key 33 bytes">Signer</span></div>
          </div>
          <b-input v-model="signer" placeholder="Signer"></b-input>
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
  name: 'UpdateSigningKey',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
      signer: null
    }
  },
  mounted () {
  },
  methods: {
    update: function () {
      if (!this.signer) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractId: this.loopRun.contractId,
        signer: this.signer
      }
      this.$store.dispatch('rpayPurchaseStore/updateSigner', data).then((result) => {
        this.result = result
        this.$notify({ type: 'success', title: 'Signer', text: 'Transaction sent: ' + result.txId })
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
