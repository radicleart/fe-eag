<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      <h2>Freeze Meta Data</h2>
        <div class="mb-4">
          <div class="d-flex justify-content-between">
            <div class="text2"><span v-b-tooltip.hover="{ variant: 'warning' }" title="Token URI">Freeze Meta Data</span></div>
          </div>
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
  name: 'FreezeMetaData',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    update: function () {
      const data = {
        contractId: this.loopRun.contractId,
        tokenUri: this.tokenUri
      }
      this.$store.dispatch('rpayPurchaseStore/freezeMetaData', data).then((result) => {
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
