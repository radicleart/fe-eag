<template>
  <b-card-group>
    <b-card class="p-3" style="width: 100%;" bg-variant="white" header-tag="header" footer-tag="footer">
      <b-card-text class="text-right">
        <div class="mb-4 pb-4"><img width="60%" :src="iconLN" /></div>
      </b-card-text>
      <b-card-text class="">
        <h2 class="text-upper pointer mb-4 border-bottom">Recipient</h2>
        <div class="mb-4">
          <b-input-group append="ADDRESS" class="mb-3">
            <b-form-input v-model="nftRecipient" placeholder="Address of the NFT owner"></b-form-input>
          </b-input-group>
          <p class="text-xsmall">The NFT recipients stacks address
            <span><b-link router-tag="span" v-b-tooltip.hover="{ variant: 'light', customClass: 'my-tooltip-class' }" :title="'Your address if your purchasing for yourself or a friends address if this is a gift?'" class="ml-2" variant="outline-success"><b-icon icon="question-circle"/></b-link></span>
          </p>
        </div>
        <div class="p-0 offset-10 col-2 text-right mb-5">
          <b-button class="w-100" variant="outline-dark" @click="$emit('showPayment', { recipient: nftRecipient })">Next</b-button>
        </div>
      </b-card-text>
    </b-card>
  </b-card-group>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'StacksAddressModal',
  components: {
  },
  data () {
    return {
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo grey.png'),
      nftRecipient: null
    }
  },
  mounted () {
    this.nftRecipient = this.profile.stxAddress
  },
  methods: {
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    }
  }
}
</script>
<style lang="scss">
</style>
