<template>
      <b-card bg-variant="ligth" header-tag="header" footer-tag="footer">
        <!-- <SellingHeader :allowEdit="true"/> -->
        <b-card-text>
          <label for="unit-price" class="">Contract Id:</label>
          <b-input-group class="mb-3">
            <b-form-input id="unit-price" :value="contractId" v-model="contractId" class="input"></b-form-input>
          </b-input-group>
          <b-form-checkbox size="lg"
            v-model="allowed"
            value="true"
            checked-value="true"
            unchecked-value="false"
          >
            <div class="pointer"><b>Allowed</b></div>
          </b-form-checkbox>

        </b-card-text>
        <template v-slot:footer>
          <div class="">
            <b-button @click="allow()" class="w-50 ml-1" variant="outline-light">Send</b-button>
          </div>
        </template>
      </b-card>
</template>

<script>

export default {
  name: 'AllowAssetContract',
  components: {
  },
  data () {
    return {
      allowed: true,
      contractId: null
    }
  },
  mounted () {
    this.contractId = process.env.VUE_APP_REGISTRY_CONTRACT_ADDRESS + '.'
  },
  methods: {
    allow () {
      const data = {
        allow: this.allowed,
        contractAddress: this.contractId.split('.')[0],
        contractName: this.contractId.split('.')[1]
      }
      this.$store.dispatch('stacksPurchaseStore/allowList', data).then((result) => {
        this.$emit('processAdminChainEvent', { opcode: 'allowed', result })
      }).catch((error) => {
        console.log(error)
      })
    }
  },
  computed: {
  }
}
</script>
<style lang="scss" scoped>
</style>
