<template>
<section id="asset-details-section" v-if="loaded">
  <b-container class="center-section" style="min-height: 50vh;">
    <b-row align-h="center" :style="'min-height: ' + videoHeight + 'px'">
      <b-col lg="7" sm="12" class="mb-5">
        <MediaItemGeneral :classes="'hash1-image'" v-on="$listeners" :options="videoOptions" :asset="gaiaAsset"/>
      </b-col>
      <b-col lg="5" sm="12" class="my-5">
        <ListingInfo class="my-5" :classes="'bg-white text-primary mr-5 text-small'" v-on="$listeners" :asset="gaiaAsset" :loopRun="loopRun" :context="'collection'"/>
        <b-row  v-if="gaiaAsset.description" class="py-2 border-bottom text-primary">
          <b-col cols="12">
            <div v-html="preserveWhiteSpace(gaiaAsset.description)"></div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</section>
</template>

<script>
import { APP_CONSTANTS } from '@/app-constants'
import { DateTime } from 'luxon'
import Vue from 'vue'
import ListingInfo from '@/views/marketplace/components/gallery/common/ListingInfo'
import MediaItemGeneral from '@/views/marketplace/components/media/MediaItemGeneral'

export default {
  name: 'NftDisplay',
  components: {
    ListingInfo,
    MediaItemGeneral
  },
  props: ['gaiaAsset', 'loopRun'],
  data () {
    return {
      loaded: false,
      nftIndex: -1,
      videoHeight: 0,
      componentKey: 0
    }
  },
  watch: {
    '$route' () {
      this.componentKey++
    }
  },
  mounted () {
    this.nftIndex = Number(this.$route.params.nftIndex)
    this.$store.dispatch('stacksApiStore/fetchMetaData', this.gaiaAsset).then((metaData) => {
      this.gaiaAsset.image = metaData.image
      if (metaData.properties && metaData.properties.full_size_image) {
        this.gaiaAsset.image = metaData.properties.full_size_image
      }
      this.loaded = true
    })
    Vue.nextTick(function () {
      const vid = document.getElementById('video-column')
      if (vid) this.videoHeight = vid.clientHeight
    }, this)
  },
  methods: {
    transactionData () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return {
        type: 'purchase',
        contractId: this.loopRun.contractId,
        nftIndex: this.gaiaAsset.contractAsset.nftIndex,
        recipient: profile.stxAddress,
        owner: this.gaiaAsset.contractAsset.owner,
        assetName: this.loopRun.assetName
      }
    },
    created () {
      if (this.gaiaAsset && this.gaiaAsset.mintInfo && this.gaiaAsset.mintInfo.timestamp) {
        return DateTime.fromMillis(this.gaiaAsset.mintInfo.timestamp).toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      } else if (this.gaiaAsset && this.gaiaAsset.updated) {
        return DateTime.fromMillis(this.gaiaAsset.updated).toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      }
      return ''
    },
    mintedEvent (data) {
      this.$bvModal.hide('edition-modal')
      this.$emit('mintedEvent', data)
    },
    getSocialLinks: function () {
      const content = this.$store.getters[APP_CONSTANTS.KEY_CONTENT_CHARITY_BY_ARTIST_ID](this.artistId)
      if (content && content.length > 0 && content[0].data.social_links && content[0].data.social_links.length > 0) {
        return content.data.social_links
      }
      return [
        {
          social_link: [{
            text: 'type=twitter'
          }]
        },
        {
          social_link: [{
            text: 'type=facebook'
          }]
        }
      ]
    },
    update () {
      this.componentKey++
    },
    resizeContainers () {
      let resizeTimer
      const $self = this
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(function () {
          const vid = document.getElementById('video-column')
          if (vid) $self.videoHeight = vid.clientHeight
        }, 400)
      })
    },
    preserveWhiteSpace: function (content) {
      return '<span class="text-description" style="white-space: break-spaces;">' + content + '</span>'
    },
    back: function () {
      this.$bvModal.hide('result-modal')
    },
    targetItem: function () {
      return this.$store.getters[APP_CONSTANTS.KEY_TARGET_FILE_FOR_DISPLAY](this.gaiaAsset)
    },
    dimensions () {
      const dims = { width: '100%', height: '100%' }
      return 'max-width: ' + dims.height + '; max-height: ' + dims.height + ';'
    },
    poster: function () {
      return this.$store.getters[APP_CONSTANTS.KEY_ASSET_IMAGE_URL](this.gaiaAsset)
    },
    emailText () {
      const emailText = this.$store.getters[APP_CONSTANTS.KEY_EMAIL_TEXT]('registeremail')
      const answer = (emailText) ? emailText[0].text : 'Interest Registered'
      return answer
    }
  },
  computed: {
    editionMessage () {
      if (this.gaiaAsset.contractAsset && this.gaiaAsset.contractAsset.tokenInfo.maxEditions > 1) {
        return '(' + this.gaiaAsset.contractAsset.tokenInfo.edition + ' of ' + this.gaiaAsset.contractAsset.tokenInfo.maxEditions + ')'
      }
      return null
    },
    videoOptions () {
      const videoOptions = {
        emitOnHover: true,
        playOnHover: false,
        bigPlayer: true,
        autoplay: false,
        muted: false,
        controls: true,
        showMeta: false,
        dimensions: 'max-width: 100%; max-height: auto;',
        aspectRatio: '1:1',
        poster: this.gaiaAsset.image,
        sources: [
          { src: (this.gaiaAsset.properties) ? this.gaiaAsset.properties.animation_url : null }
        ],
        fluid: false
      }
      return videoOptions
    },
    owner () {
      return this.gaiaAsset.contractAsset.owner
    }
  }
}
</script>

<style>
.more-link {
  border: 1pt solid #fff;
  padding: 3px 10px;
  text-align: center;
  font-size: 1.2rem;
}
.on-auction-text {
  text-transform: capitalize;
  font-weight: 700;
  font-size: 1.5rem;
}
#asset-offer-modal .modal-body {
  background-color: #fff;
  text-align: left !important;
}
#asset-offer-modal .modal-content {
  color: #000;
}
#asset-offer-modal .modal-dialog {
  background-color: #fff;
  color: #000;
  text-align: left !important;
}
</style>
