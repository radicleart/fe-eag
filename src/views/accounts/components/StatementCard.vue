<template>
    <b-card-group>
      <b-card class="p-3" style="width: 100%;" bg-variant="white" header-tag="header" footer-tag="footer">
        <b-card-text>
          <div class="text-right"><img width="60%" :src="iconLN" /></div>
        </b-card-text>
        <b-card-text class="">
          <StatementList :payments="payments"/>
        </b-card-text>
      </b-card>
    </b-card-group>
</template>

<script>
import StatementList from '@/views/accounts/components/StatementList'

export default {
  name: 'StatementCard',
  components: {
    StatementList
  },
  props: ['payments'],
  data () {
    return {
      iconLN: require('@/assets/img/EAG - WEB UX assets - png/EAG - logo grey.png')
    }
  },
  mounted () {
  },
  methods: {
  },
  computed: {
  }
}
</script>
<style lang="scss">
</style>
