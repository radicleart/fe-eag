<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4  border-bottom">
      <b-form>
        <div class="row">
          <div class="col-md-12">
            <h2 for="description">Admin Mint Address</h2>
          </div>
          <div class="col-md-12">
            <p>Enter address</p>
            <b-input v-model="stxAddress"></b-input>
            <p v-if="stxAddress">{{mintPasses}} passes</p>
          </div>
        </div>
      </b-form>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="saveAdminMintAddress()" class="w-50 mr-2" variant="light">Update</b-button>
      </div>
    </b-card-text>

    <b-card-text class="m-4 border-bottom">
      <b-form>
        <div class="row">
          <div class="col-md-12">
            <h2 for="description">Mint Passes</h2>
          </div>
          <div class="col-md-12">
            <p>Mint Passes format: address1::limit1 address2::limit2 etc</p>
            <b-textarea
              ref="mintPassess"
              v-model="mintPassess"
              rows="5"
            ></b-textarea>
          </div>
        </div>
      </b-form>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="update()" class="w-50 mr-2" variant="light">Update</b-button>
      </div>
    </b-card-text>
    <b-card-text class="m-4 border-top">
      <b-form>
        <div class="row">
          <div class="col-md-12">
            <h2 for="description">Lookup Mint Pass Balance</h2>
          </div>
          <div class="col-md-12">
            <p>Enter address</p>
            <b-input v-model="stxAddress"></b-input>
            <p v-if="mintPasses && stxAddress">{{mintPasses}} passes</p>
          </div>
        </div>
      </b-form>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="fetch()" class="w-50 mr-2" variant="light">Fetch</b-button>
      </div>
    </b-card-text>

  </b-card>
</b-card-group>
</template>

<script>

import {
  listCV,
  uintCV,
  tupleCV,
  standardPrincipalCV
} from '@stacks/transactions'

export default {
  name: 'UpdateMintPass',
  components: {
  },
  props: ['contractId'],
  data () {
    return {
      mintPassess: null,
      stxAddress: null,
      mintPasses: null
    }
  },
  mounted () {
  },
  methods: {
    cancel: function () {
      this.$emit('update', { opcode: 'cancel' })
    },
    fetch: function () {
      if (!this.stxAddress) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        stxAddress: this.stxAddress,
        contractAddress: this.contractId.split('.')[0],
        contractName: this.contractId.split('.')[1]
      }
      this.$store.dispatch('stacksPurchaseStore/lookupMintPassBalance', data).then((result) => {
        if (result && result.result && result.result.value) {
          this.mintPasses = Number(result.result.value)
          this.$notify({ type: 'success', title: 'Mint Passes', text: this.mintPasses + ' at address ' + this.stxAddress })
        }
      })
    },
    saveAdminMintAddress () {
      if (!this.stxAddress) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractAddress: this.contractId.split('.')[0],
        contractName: this.contractId.split('.')[1],
        functionName: 'set-admin-mint-pass',
        functionArgs: [standardPrincipalCV(this.stxAddress)]
      }
      this.$store.dispatch('stacksPurchaseStore/callContractBlockstack', data).then((response) => {
        this.response = response
        this.$notify({ type: 'success', title: 'Admin Mint Address', text: 'Saved! - ' + response })
      }).catch(() => {
        this.$notify({ type: 'error', title: 'Guest List', text: 'Guest List error!' })
        this.$emit('update', { opcode: 'cancel' })
      })
    },
    update: function () {
      if (!this.mintPassess) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      this.mintPassess.replaceAll('\n', '')
      const members = this.mintPassess.split(' ')
      const memberList = []
      for (let i = 0; i < 200; i++) {
        if (members[i]) {
          const tupCV = tupleCV({
            account: standardPrincipalCV(members[i].split('::')[0]),
            limit: uintCV(members[i].split('::')[1])
          })
          memberList.push(tupCV)
        }
      }
      const data = {
        contractAddress: this.contractId.split('.')[0],
        contractName: this.contractId.split('.')[1],
        functionName: 'batch-set-mint-pass',
        functionArgs: [listCV(memberList)]
      }
      this.$store.dispatch('stacksPurchaseStore/callContractBlockstack', data).then((gl) => {
        this.guestList = gl
        this.$notify({ type: 'success', title: 'Guest List', text: 'Guest List saved!' })
        this.$emit('update', { opcode: 'cancel' })
      }).catch(() => {
        this.$notify({ type: 'error', title: 'Guest List', text: 'Guest List error!' })
        this.$emit('update', { opcode: 'cancel' })
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
