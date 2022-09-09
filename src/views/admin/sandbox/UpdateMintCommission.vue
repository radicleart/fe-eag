<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      {{result}}
    </b-card-text>
    <b-card-text class="m-4">
      <b-form>
        <div class="row">
          <div class="col-md-12">
            <h2 for="description">Mint Commission</h2>
          </div>
          <div class="col-md-12">
            <div>Enter tender</div>
            <b-input v-model="tender"></b-input>
          </div>
          <div class="col-md-12">
            <div>Enter price</div>
            <b-input v-model="price" type="number"></b-input>
          </div>
          <div class="col-md-12">
            <div>Enter Creator Address</div>
            <b-input v-model="address"></b-input>
          </div>
          <div class="col-md-12">
            <div>Enter Commission Address</div>
            <b-input v-model="commissionAddress"></b-input>
          </div>
          <div class="col-md-12">
            <div>Enter Commission Rate</div>
            <b-input v-model="commissionRate"></b-input>
          </div>
        </div>
      </b-form>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="update()" class="w-50 mr-2" variant="warning">Update</b-button>
      </div>
    </b-card-text>
    <b-card-text class="m-4">
      <b-form>
        <div class="row">
          <div class="col-md-12">
            <h2 for="description">Remove Mint Commission</h2>
          </div>
          <div class="col-md-12">
            <div>Enter tender</div>
            <b-input v-model="tender"></b-input>
          </div>
        </div>
      </b-form>
    </b-card-text>
    <b-card-text class="mx-4">
      <div class="d-flex justify-content-between">
        <b-button @click="remove()" class="w-50 mr-2" variant="warning">Remove Tender</b-button>
      </div>
    </b-card-text>
  </b-card>
</b-card-group>
</template>

<script>
/**
import {
  cvToHex,
  hexToCV,
  cvToJSON,
  contractPrincipalCV
} from '@stacks/transactions'
**/
// import axios from 'axios'

export default {
  name: 'UpdateMintCommission',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
      tender: 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.unwrapped-stx-token',
      price: 100,
      address: 'ST2M92VAE2YJ1P5VZ1Q4AFKWZFEKDS8CDA1TC4PAG',
      commissionAddress: 'ST132K8CVJ9B2GEDHTQS5MH3N7BR5QDMN1P1RZG3Y',
      commissionRate: 20,
      result: null
    }
  },
  watch: {
    tender: function () {
      this.fetch()
    }
  },
  mounted () {
    this.fetch()
    // axios.get(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/mint-commissions-by-contract/' + this.loopRun.contractId).then((response) => {
    //  this.tenders = response.data
    // })
  },
  methods: {
    cancel: function () {
      this.$emit('update', { opcode: 'cancel' })
    },
    fetch: function () {
      if (!this.tender) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        tokenContractAddress: this.tender.split('.')[0],
        tokenContractName: this.tender.split('.')[1]
      }
      /**
      const callData = {
        path: '/v2/map_entry/' + data.contractAddress + '/' + data.contractName + '/mint-commission',
        httpMethod: 'post',
        mapKey: cvToHex(contractPrincipalCV(data.tokenContractAddress, data.tokenContractName))
      }
      const url = process.env.VUE_APP_RISIDIO_API + '/mesh/v2/map-data'
      axios.post(url, callData).then(response => {
        const cvVer = hexToCV(response.data.data)
        this.result = cvToJSON(cvVer)
      })
      **/

      this.$store.dispatch('rpayMarketGenFungStore/getMintCommission', data).then((result) => {
        this.result = result
        this.$notify({ type: 'success', title: 'Mint Commission', text: 'Mint commission: ' + result })
      })
    },
    remove: function () {
      if (!this.tender) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        tokenContractAddress: this.tender.split('.')[0],
        tokenContractName: this.tender.split('.')[1]
      }
      this.$store.dispatch('rpayMarketGenFungStore/removeMintCommission', data).then((result) => {
        this.$notify({ type: 'success', title: 'Mint Commission', text: 'Transaction sent - see tx ' + result.txId + ' tx status: ' + result.txStatus })
      })
    },
    update: function () {
      if (!this.tender || !this.price || !this.address || !this.commissionAddress || !this.commissionRate) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      const data = {
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        tokenContractAddress: this.tender.split('.')[0],
        tokenContractName: this.tender.split('.')[1],
        price: this.price,
        address: this.address,
        commissionAddress: this.commissionAddress,
        commissionRate: this.commissionRate
      }

      this.$store.dispatch('rpayMarketGenFungStore/setMintCommission', data).then((result) => {
        if (result && result.result && result.result.value > 0) {
          this.mintPasses = Number(result.result.value)
          this.$notify({ type: 'success', title: 'Mint Commission', text: 'Added mint commission to contract ' + this.tender })
        }
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
