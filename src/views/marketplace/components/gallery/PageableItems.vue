<template>
<div class="mb-4" v-if="resultSet">
  <vue-horizontal>
    <div v-for="(asset, index) of resultSet" :key="index">
      <NftImage v-on="$listeners" @update="update" :loopRun="loopRun" :asset="asset"/>
    </div>
  </vue-horizontal>
</div>
</template>

<script>
import NftImage from './NftImage'
import { APP_CONSTANTS } from '@/app-constants'
import VueHorizontal from 'vue-horizontal'

export default {
  name: 'PageableItems',
  components: {
    NftImage,
    VueHorizontal
  },
  props: ['loopRun', 'resultSet'],
  data () {
    return {
      loading: true,
      containerHeight: 0
    }
  },
  mounted () {
    console.log(this.resultSet)
  },
  methods: {
    update (data) {
      if (data.opcode === 'report-height') {
        this.containerHeight = Math.max(this.containerHeight, data.containerHeight)
      }
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
.myItemsIntroText {font-weight: 200; font-size: 1.1rem; color: #fff;}
.grid {
  background: #fff;
  max-width: 100%;
}
.mp-info {
  width: 100%;
  height: 100%;
  color: #fff !important;
  /* background: rgb(2,0,36);
  background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(0,1,255,1) 49%, rgba(78,65,142,1) 100%, rgba(11,193,241,1) 100%);
  */
  background: #ccc;
  padding: 50px 10px;
  border: 0px solid green;
  border-radius: 5px;
  text-align: center;
}
/* clearfix */
.grid:after {
  content: '';
  display: block;
  clear: both;
}

/* ---- grid-item ---- */

.grid-item {
  margin: 0 5px 10px 5px;
  min-width: 40%;
  min-height: 120px;
  float: left;
  background: #fff;
  border: 0px solid #ccc;
  border-color: hsla(0, 0%, 0%, 0.5);
  border-radius: 5px;
}

.grid-item--width2 { width: 320px; }
.grid-item--width3 { width: 480px; }
.grid-item--width4 { width: 640px; }

.grid-item--height2 { height: 200px; }
.grid-item--height3 { height: 260px; }
.grid-item--height4 { height: 360px; }

.grid-item--gigante {
  width: 320px;
  height: 360px;
  z-index: 2; /* above other items */
}

.grid-item:hover {
  background: #A2C;
  border-color: white;
  cursor: pointer;
}
</style>
