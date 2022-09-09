<template>
<div>
<div>
  <label for="unit-price" class="">Contract id to add to allow-list:</label>
  <b-input-group class="mb-3">
    <b-form-input id="unit-price" :value="allowedContractId" v-model="allowedContractId" class="input"></b-form-input>
  </b-input-group>
  <b-form-checkbox size="lg"
    v-model="allowed"
    value="true"
    checked-value="true"
    unchecked-value="false">
    <div class="pointer"><b>Allowed</b></div>
  </b-form-checkbox>
</div>
  <div>
    <div class="">
      <b-button @click="allow()" class="w-50 ml-1" variant="outline-light">Send</b-button>
    </div>
  </div>
</div>
</template>

<script>

export default {
  name: 'UpdateAllowedContracts',
  components: {
  },
  props: ['contractId'],
  data () {
    return {
      allowed: true,
      allowedContractId: process.env.VUE_APP_STACKS_CONTRACT_ADDRESS + '.'
    }
  },
  mounted () {
  },
  methods: {
    allow () {
      const data = {
        allowed: this.allowed,
        contractAddress: this.contractId.split('.')[0],
        contractName: this.contractId.split('.')[1],
        allowedContractAddress: this.allowedContractId.split('.')[0],
        allowedContractName: this.allowedContractId.split('.')[1]
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
