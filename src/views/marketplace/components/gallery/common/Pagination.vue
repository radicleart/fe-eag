<template>
<div v-if="doPaging && pagingData.numberOfItems > pagingData.pageSize">
  <div class="fixedElement">
  <b-pagination
    class="page-number"
    v-model="currentPage"
    :total-rows="pagingData.numberOfItems"
    :per-page="pagingData.pageSize"
    aria-controls="my-table"
    @input="gotoPage"
    limit="3"
    hide-ellipsis
    last-number
    first-number
  >
    <template v-slot:page="{ page, active }">
      <span class="text-dark" v-if="active">{{ page }}</span>
      <span class="text-light" v-else>{{ page }}</span>
    </template>
  </b-pagination>
  </div>
</div>
</template>

<script>
export default {
  name: 'Pagination',
  components: {
  },
  watch: {
    page: function () {
      this.currentPage = this.page
    }
  },
  props: ['pagingData'],
  data () {
    return {
      page: 0,
      doPaging: true,
      currentPage: 1
    }
  },
  mounted () {
    if (this.$route.params.offset) this.currentPage = Number(this.$route.params.offset)
  },
  methods: {
    gotoPage () {
      this.$emit('changePage', this.currentPage)
    }
  },
  computed: {
  }
}
</script>
<style>

</style>
