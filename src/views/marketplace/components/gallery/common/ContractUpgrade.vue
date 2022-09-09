<template>
  <b-modal class="bg-light text-dark" size="md" id="upgrade-modal">
    <div v-if="clicked">
      <div v-if="getUpgradeContract() && getUpgradeContract().indexOf('thisisnumberone-v2') > -1">
        <div class="mt-2">Request sent - thank you.</div>
        <div class="mt-4">Transferring this NFT to a burn address.
          You can claim the new upgraded NFT once the Tx completes.
        </div>
        <div class="mt-4">
          <a :href="transactionUrl()" target="_blank"><span class="text-warning ml-3">Track via the explorer</span></a>
        </div>
        <div class="mt-4">How to read your transaction status: If your transaction is pending, it will go through, just please wait a while. Once your transaction status is picked up by the micro-block, it will go into the anchor block, and you have successfully upgraded. The NFTs will take some time to display back here.</div>
      </div>
      <div v-else>
        <div class="mt-2">Upgrade request sent - thank you. Your NFTs will be upgraded shortly...</div>
        <div class="mt-4">Remember to logout and log back in once the transaction finishes / <span class="pointer" @click="dismiss">dismiss this message</span></div>
        <div class="mt-4">
          <a :href="transactionUrl()" target="_blank"><span class="text-warning ml-3">Track via the explorer</span></a>
        </div>
        <div class="mt-4">How to read your transaction status: If your transaction is pending, it will go through, just please wait a while. Once your transaction status is picked up by the micro-block, it will go into the anchor block, and you have successfully upgraded. The NFTs will take some time to display back here.</div>
      </div>
    </div>
    <div v-else class="text-center">
      <div>
        <h1>NFT Upgrade Required</h1>
      </div>
      <div class="my-4">
        Please click the upgrade button to burn this NFT - the new one will then be sent to you
        <span @click="showInfo = !showInfo" class="pointer"><i>more</i> / <span class="pointer" @click="dismiss">dismiss this message</span></span>
      </div>
      <div v-if="showInfo">
        <p>The upgrade fixes long term storage of your NFT - which are now stored in
        the IPFS decentralised storage system. It also fixes a potential bug in the
        contract that can happen when the item is listed on multiple marketplaces.
        </p>
      </div>
      <div class="my-4"><b-button @click="nftUpgrade" variant="outline-success">Upgrade Your NFTs!</b-button></div>
      <!-- <div class="text-right"><a class="mr-2" href="https://discord.gg/qvuxB9P" target="_blank">Contact us on discord <b-icon icon="discord"/></a></div> -->
      <div id="my-table" class="row">
        <div class="col-12" v-for="(asset, index) of resultSet" :key="index">
          <MyUpgradeItem :parent="'list-view'" :loopRun="loopRun" :asset="asset"/>
        </div>
      </div>
      <div>
        <div class="my-5" v-if="loopRun && profile.superAdmin">
          from<br/>
          {{loopRun.contractId}}
          <br/>to<br/>
          {{getUpgradeContract()}}
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import {
  uintCV, listCV, NonFungibleConditionCode, makeStandardNonFungiblePostCondition, createAssetInfo
} from '@stacks/transactions'
import MyUpgradeItem from './MyUpgradeItem'

export default {
  name: 'ContractUpgrade',
  components: {
    MyUpgradeItem
  },
  props: ['loopRun'],
  data () {
    return {
      clicked: false,
      result: null,
      resultSet: null,
      showInfo: false,
      currentRunKey: null,
      debugAddress: null
    }
  },
  mounted () {
    this.currentRunKey = this.$route.params.collection
    if (this.currentRunKey) {
      const data = {
        contractId: this.loopRun.contractId,
        stxAddress: this.profile.stxAddress
      }
      if (this.profile.stxAddress === 'SP3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSQP2HGT6') {
        data.stxAddress = 'SP1B7J71AJYYG77Y1H80G7DRNJXT4J39164JEHF8X'
      }
      this.$store.dispatch('rpayTransactionStore/fetchByContractIdAndFrom', data).then((results) => {
        if (results) {
          const tx = results.find((o) => o.txStatus === 'pending' && o.functionName === 'batch-upgrade-v1-to-v2')
          if (tx) {
            this.clicked = true
          }
        }
      })
      const upgradeContractId = this.getUpgradeContract(this.currentRunKey)
      if (upgradeContractId) {
        if (upgradeContractId && this.loopRun) {
          const data1 = {
            asc: true,
            page: 0,
            pageSize: 130,
            contractId: upgradeContractId,
            stxAddress: data.stxAddress
          }
          /**
          if (this.profile.stxAddress === 'SP3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSQP2HGT6') {
            data1.stxAddress = 'SP1QVFBBR73G5HNWWR72GZZ9SHJV2H9HY4SESGFCH'
          }
          **/
          this.$store.dispatch('rpayStacksContractStore/fetchMyTokens', data1).then((results) => {
            if (results && results.tokenCount > 0) {
              if (upgradeContractId.indexOf('thisisnumberone-v2') > -1) {
                this.resultSet = results.gaiaAssets.filter((o) => o.contractAsset && o.contractAsset.nftIndex < 5)
              } else {
                this.resultSet = results.gaiaAssets
              }
              if (this.resultSet && this.resultSet.length > 0) {
                this.$bvModal.show('upgrade-modal')
              }
            }
          })
          if (this.limitReached) {
            this.$emit('loopRun', { opcode: 'limit-reached' })
          }
        }
      }
    }
  },
  methods: {
    dismiss () {
      this.$bvModal.hide('upgrade-modal')
    },
    getUpgradeContract () {
      if (process.env.VUE_APP_NETWORK === 'mainnet') {
        if (this.currentRunKey === 'loopbomb_genesis') {
          return 'SP3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSQP2HGT6.loopbomb-stx-v1'
        } else if (this.currentRunKey === 'crash_punks') {
          return 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v1'
        } else if (this.currentRunKey === 'genesis') {
          return 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.thisisnumberone-v2'
        }
      } else {
        if (this.currentRunKey === 'loopbomb_genesis') {
          return 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.loopbomb-stx-t1'
        } else if (this.currentRunKey === 'crash_punks') {
          return 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.crashpunks-t8'
        } else if (this.currentRunKey === 'genesis') {
          return 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.thisisnumberone-v2'
        }
      }
      return false
    },
    getAssetName () {
      if (this.loopRun.contractId === 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.crashpunks-v2') {
        return 'crashpunks'
      } else if (this.loopRun.contractId === 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.crashpunks-v21') {
        return 'crashpunks'
      } else if (this.loopRun.contractId === 'SP3N4AJFZZYC4BK99H53XP8KDGXFGQ2PRSQP2HGT6.loopbomb-genesis') {
        return 'loopbomb'
      } else if (this.loopRun.contractId === 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.loopbomb') {
        return 'loopbomb'
      } else if (this.loopRun.contractId === 'SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ.thisisnumberone-genesis') {
        return 'thisisnumberone'
      }
      return null
    },
    transactionUrl: function () {
      if (!this.result) return
      let txId = this.result.txId
      if (!txId.startsWith('0x')) txId = '0x' + txId
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    getPostCondition (nftIndex) {
      const upgradeContractId = this.getUpgradeContract()
      const nonFungibleAssetInfo = createAssetInfo(
        upgradeContractId.split('.')[0],
        upgradeContractId.split('.')[1],
        this.getAssetName()
      )
      return makeStandardNonFungiblePostCondition(
        this.profile.stxAddress,
        NonFungibleConditionCode.DoesNotOwn,
        nonFungibleAssetInfo,
        uintCV(nftIndex)
      )
    },
    nftUpgrade () {
      const upgradeContractId = this.getUpgradeContract()
      if (!upgradeContractId) {
        this.$notify({ type: 'warning', title: 'Upgrade Not Supported!', text: 'Can\'t uprade this contract - ' + this.loopRun.contractId })
        return
      }
      if (upgradeContractId.indexOf('thisisnumberone-v2') > -1) {
        this.nftUpgradeHashOne(upgradeContractId)
      } else {
        this.nftUpgradeLoopbomb()
      }
    },
    nftUpgradeLoopbomb () {
      const postConditions = []
      const upgradeList = []
      this.resultSet.forEach((o) => {
        upgradeList.push(uintCV(o.nftIndex))
        postConditions.push(this.getPostCondition(o.nftIndex))
      })
      const callData = {
        postConditions: postConditions,
        contractAddress: this.loopRun.contractId.split('.')[0],
        contractName: this.loopRun.contractId.split('.')[1],
        functionName: 'batch-upgrade-v1-to-v2',
        functionArgs: [listCV(upgradeList)]
      }
      this.$store.dispatch('stacksPurchaseStore/callContractBlockstack', callData).then((result) => {
        this.clicked = true
        this.result = result
        this.$notify({ type: 'success', title: 'Upgrade in Progress', text: 'Check the explorer - your upgrade will be ready soon!' })
      }).catch(() => {
        this.$notify({ type: 'Error', title: 'Upgrade Failed', text: 'Thanks for your patience while we investigate!' })
      })
    },
    nftUpgradeHashOne (upgradeContractId) {
      const contractAsset = this.resultSet[0].contractAsset
      const data = {
        contractAddress: upgradeContractId.split('.')[0],
        contractName: upgradeContractId.split('.')[1],
        nftIndex: contractAsset.nftIndex,
        owner: contractAsset.owner,
        recipient: 'SP000000000000000000002Q6VF78',
        assetName: 'my-nft'
      }
      return this.$store.dispatch('stacksPurchaseStore/transferAsset', data).then((result) => {
        this.clicked = true
        this.result = result
        this.$notify({ type: 'success', title: 'Upgrade in Progress', text: 'Check the explorer - your upgrade will be ready soon!' })
      }).catch(() => {
        this.$notify({ type: 'Error', title: 'Upgrade Failed', text: 'Thanks for your patience while we investigate!' })
      })
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style>
.btn {
  width: auto;
}
</style>
