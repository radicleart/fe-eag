<template>
<b-card-group class="">
  <b-card header-tag="header" footer-tag="footer" class="bg-light">
    <b-card-text class="m-4">
      <b-form>
        <div class="row">
          <div class="col-md-12">
            <h2 for="description">Admin Mint</h2>
            <p>Enter up to 200 stacks address token id pairs.</p>
            <p>you must be logged in with the <span class="text-danger">admin mint pass</span> address for this to work - see admin mint pass in the mint pass tab</p>
          </div>
          <div class="col-md-12">
            <p>Mint Address/Token Id format: address1::tokenId1 address2::tokenId2 etc</p>
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
        <b-button @click="update()" class="w-50 mr-2" variant="warning">Update</b-button>
      </div>
    </b-card-text>
  </b-card>
</b-card-group>
</template>

<script>
import {
  PostConditionMode
} from '@stacks/transactions'

export default {
  name: 'AdminMint',
  components: {
  },
  props: ['loopRun'],
  data () {
    return {
      mintPassess: null,
      result: null
    }
  },
  watch: {
    tender: function () {
      this.fetch()
    }
  },
  mounted () {
  },
  methods: {
    cancel: function () {
      this.$emit('update', { opcode: 'cancel' })
    },
    update: function () {
      if (!this.mintPassess) {
        this.$notify({ type: 'warning', title: 'Data Missing', text: 'Please enter a value to change' })
        return
      }
      this.mintPassess.replaceAll('\n', '')
      const members = this.mintPassess.split(' ')
      const entries = []
      for (let i = 0; i < 200; i++) {
        if (members[i]) {
          entries.push({ recipient: members[i].split('::')[0], nftIndex: members[i].split('::')[1] })
        }
      }
      const data = {
        postConditionMode: PostConditionMode.Deny,
        contractId: this.loopRun.contractId,
        functionName: 'admin-mint-many',
        recipient: entries[0].recipient,
        nftIndex: entries[0].nftIndex,
        entries: entries
      }
      this.$store.dispatch('rpayMarketGenFungStore/adminMintNFT', data).then((result) => {
        if (result.txStatus) {
          this.$notify({ type: 'success', title: 'Admin Mint', text: 'Sent request to mint ' + this.mintPasses })
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
