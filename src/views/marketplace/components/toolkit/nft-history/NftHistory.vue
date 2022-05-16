<template>
<div v-if="events">
  <h6>NFT Activity</h6>
  <b-table hover :items="values()" :fields="fields()" class="text-xsmall bg-white text-primary">
    <template #cell(Status)="data">
      <span v-b-tooltip.hover="{ variant: 'light' }"  :title="'view on blockchain explorer'">
        <a :href="transactionUrl(data)" target="_blank"><b-icon :animation="getAnimation(data)" :class="getClass(data)" font-scale="1.5" :icon="getIcon(data)"/></a>
      </span>
    </template>
    <template #cell(from)="data">
      <div :ref="'from_' + data.index">
        <span class="pointer mr-1" @click.prevent="copy('from', data)">{{data.value}}</span>
        <span class="pointer" v-show="data.value.length > 0" @click.prevent="copy('from', data)"><b-icon icon="file-earmark"/></span>
      </div>
    </template>
    <template #cell(to)="data">
      <div :ref="'to_' + data.index">
        <span class="pointer mr-1" @click.prevent="copy('to', data)">{{data.value}}</span>
        <span class="pointer" v-show="data.value.length > 0" @click.prevent="copy('to', data)"><b-icon icon="file-earmark"/></span>
      </div>
    </template>
  </b-table>
  <input class="fake-input" style="visibility: hidden;" id="copy-address" readonly v-model="paymentAddress"/>
</div>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'NFTHistroy',
  components: {
  },
  props: ['gaiaAsset', 'loopRun'],
  data: function () {
    return {
      paymentAddress: null,
      timer: null,
      previouslyPending: false
    }
  },
  mounted () {
  },
  methods: {
    getAnimation: function (data) {
      return 'none'
    },
    getClass: function (data) {
      return 'text-success'
    },
    copy (type, data) {
      const copyText = document.getElementById('copy-address')
      const value = this.events[data.index][type]
      copyText.value = value
      copyText.select()
      navigator.clipboard.writeText(value).then(() => {
        this.doFlash(type, data.index)
        this.$notify({ type: 'info', title: 'Copied to Clipboard', text: 'Copied address to clipboard: ' + copyText.value })
      })
    },
    doFlash (type, index) {
      const flasher = this.$refs[type + '_' + index]
      flasher.classList.add('flasher')
      setTimeout(function () {
        flasher.classList.remove('flasher')
      }, 1000)
    },
    checkTx: function (data) {
      const txId = this.events[data.index].txId
      this.$store.dispatch('rpayTransactionStore/fetchTransactionFromChainByTxId', txId).then((result) => {
        this.$notify({ type: 'warning', title: 'Check Status', text: 'Transaction status is ' + result.txStatus })
      })
    },
    showThrobber: function (data) {
      // if (!data.value || data.value === 'pending') return true
      return false
    },
    transactionUrl1: function (data) {
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + this.loopRun.contractId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    transactionUrl: function (data) {
      if (!data) data = { index: 1 }
      let txId = this.events[data.index].tx_id
      if (!txId.startsWith('0x')) txId = '0x' + txId
      const stacksApiUrl = process.env.VUE_APP_STACKS_EXPLORER
      return stacksApiUrl + '/txid/' + txId + '?chain=' + process.env.VUE_APP_NETWORK
    },
    getTitle: function (data) {
      if (this.events[data.index].asset_event_type === 'mint') return 'Mint event'
      return 'Transfer event'
    },
    getIcon: function (data) {
      return 'arrow-up-right-square'
    },
    truncAddress (address) {
      return address.substring(0, 3) + '..' + address.substring(address.length - 4)
    },
    fields () {
      return ['event', 'amount%', 'from', 'to', 'Status']
    },
    values () {
      let mapped = []
      const $self = this
      mapped = this.events.map(function (transaction) {
        return {
          // timestamp: DateTime.fromMillis(transaction.timestamp).toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          event: transaction.asset_event_type,
          'amount%': transaction.balance,
          from: '',
          to: (transaction.recipient) ? $self.truncAddress(transaction.recipient) : '',
          Status: $self.truncAddress(transaction.tx_id)
        }
      })
      return mapped
    }
  },
  computed: {
    events () {
      return this.$store.getters[APP_CONSTANTS.KEY_SAS_MINT_EVENTS_FOR_TOKEN](this.gaiaAsset.contractAsset.nftIndex)
    }
  }
}
</script>

<style>
.flasher {
  border-bottom: 2pt solid #FFCE00;
  padding: 0px;
}
</style>
