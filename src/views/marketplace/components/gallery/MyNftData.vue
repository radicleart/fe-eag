<template>
<div>
  <b-popover placement="topleft" triggers="hover" variant="light" target="popover-my-nfts" custom-class="my-popover-class">
    <template #title>My NFTs</template>
    <div class="py-2">All NFTs owned by your address</div>
    <div class="py-2">EAG doesn't support all the projects where these NFTs were minted.</div>
  </b-popover>
</div>
</template>

<script>

export default {
  name: 'MyNftData',
  components: {
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
    profile () {
      const profile = this.$store.getters['rpayAuthStore/getMyProfile']
      return profile
    }
  }
}
</script>
<style scoped>
.my-popover-class {
    position: relative;
    top: -20px;
    left: -200px;
}

</style>
