<template>
<div>
  <b-link router-tag="span" v-b-tooltip.hover="{ variant: 'warning' }"  :title="'Owners stacks name/address' + owner">
    {{getAddress}}
  </b-link>
</div>
</template>
<script>

export default {
  name: 'OwnerInfo',
  components: {
  },
  props: ['owner'],
  data () {
    return {
    }
  },
  mounted () {
    this.$store.dispatch('rpayStacksContractStore/fetchBnsNames', [this.owner]).then((bnsNames) => {
      if (bnsNames && bnsNames.length > 0) {
        this.bnsName = bnsNames[0].bnsEntry
      }
    })
  },
  methods: {
  },
  computed: {
    getAddress: function () {
      return this.bnsName || this.owner
    }
  }
}
</script>
<style>
</style>
