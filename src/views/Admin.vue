<template>
<b-container id="admin-page" style="height: 100vh;">
  <b-row>
    <b-col >
      <b-card bg-variant="ligth" header-tag="header" footer-tag="footer">
        <!-- <SellingHeader :allowEdit="true"/> -->
        <b-card-text>
          <label for="targetContractId" class="">Target Contract Id:</label>
          <b-input-group class="mb-3">
            <b-form-input id="targetContractId" :value="targetContractId" v-model="targetContractId" class="input"></b-form-input>
          </b-input-group>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
  <b-container>
    <b-tabs small card left content-class="mt-3 text-small">
      <b-tab title="Allow List">
        <UpdateAllowedContracts :contractId="targetContractId"/>
      </b-tab>
      <b-tab title="Token URI">
        <UpdateTokenUri :contractId="targetContractId"/>
      </b-tab>
      <b-tab title="Mint Passes">
        <UpdateMintPass :contractId="targetContractId"/>
      </b-tab>
      <!--
      <b-tab title="Manage Sip Tens">
        <UpdateSipTenToken :loopRun="loopRun"/>
      </b-tab>
      <b-tab title="Mint Commissions">
        <UpdateMintCommission :loopRun="loopRun"/>
      </b-tab>
      <b-tab title="Mint Price">
        <UpdateMintPrice :loopRun="loopRun"/>
      </b-tab>
      <b-tab title="Freeze Meta">
        <FreezeMetaData :loopRun="loopRun"/>
      </b-tab>
      <b-tab title="Signing Key">
        <UpdateSigningKey :loopRun="loopRun"/>
      </b-tab>
      <b-tab title="Admin Mint">
        <AdminMint :loopRun="loopRun"/>
      </b-tab>
      -->
    </b-tabs>
  </b-container>
</b-container>
</template>

<script>
import UpdateAllowedContracts from '@/views/admin/sandbox/UpdateAllowedContracts'
import UpdateTokenUri from '@/views/admin/sandbox/UpdateTokenUri'
import UpdateMintPass from '@/views/admin/sandbox/UpdateMintPass'

export default {
  name: 'Home',
  components: {
    UpdateAllowedContracts,
    UpdateMintPass,
    UpdateTokenUri
  },
  data () {
    return {
      targetContractId: process.env.VUE_APP_STACKS_CONTRACT_ADDRESS + '.' + process.env.VUE_APP_STACKS_CONTRACT_NAME
    }
  },
  methods: {
    getForeground1 () {
      if (this.$route.name === 'home') {
        return {
          'z-index': 20,
          width: '100%',
          height: '100%',
          'background-repeat': 'no-repeat',
          'background-size': '95%',
          'background-image': this.foreground1,
          'background-position': 'center'
        }
      }
    },
    getForeground2 () {
      if (this.$route.name === 'home') {
        return {
          'z-index': 30,
          width: '100%',
          height: '100%',
          'background-size': '50%',
          'background-repeat': 'no-repeat',
          'background-image': this.foreground2,
          'background-position': 'center'
        }
      }
    }
  }
}
</script>
<style scoped>
</style>
