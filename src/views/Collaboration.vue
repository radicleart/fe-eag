<template>
  <section class="mt-5 container" v-if="content">
    <b-row>
      <b-col cols="12">
        <prismic-items :prismicItems="content" class="child-information"/>
      </b-col>
      <b-col cols="12">
        <b-input-group class="mb-3">
          <b-form-input id="email" type="email" v-model="email" placeholder="Email address for payment receipt" pattern=".+@globex\.com" size="30"></b-form-input>
        </b-input-group>
        <b-button @click="sendEmail" variant="outline-dark">Subscribe</b-button>
      </b-col>
    </b-row>
  </section>
  <section class="my-5 container" v-else>
    <div class="row">
      <div class="col-12">
        Content missing for key {{getKey()}}
      </div>
    </div>
  </section>
</template>

<script>
import PrismicItems from '@/components/prismic/PrismicItems'
import { APP_CONSTANTS } from '@/app-constants'

export default {
  name: 'Collaboration',
  components: {
    PrismicItems
  },
  data () {
    return {
      email: null
    }
  },
  methods: {
    isValid: function (email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    sendEmail () {
      if (!this.isValid(this.email)) {
        this.$notify({ type: 'warning', title: 'Email Address', text: 'Please enter an email' })
        return
      }
      const template = this.$store.getters[APP_CONSTANTS.KEY_EMAIL_TEMPLATE]
      const data = {
        status: 5,
        domain: location.href,
        emailContent: template.replace('CLIENT_TEXT1', 'We will be in touch!'),
        email: this.email,
        stxAddress: this.profile.stxAddress
      }
      this.$store.dispatch('contentStore/sendEmail', data).then((data) => {
        this.$notify({ type: 'error', title: 'Subscribed', text: data })
      })
    },
    getKey: function () {
      return this.$route.params.infoId
    }
  },
  computed: {
    profile () {
      const profile = this.$store.getters[APP_CONSTANTS.KEY_PROFILE]
      return profile
    },
    content () {
      const content = this.$store.getters[APP_CONSTANTS.KEY_CONTENT_INFO_PAGE](this.$route.name)
      // if (!content) content = this.$store.getters[APP_CONSTANTS.KEY_CONTENT_INFO_PAGE]('info-privacy-policy')
      if (content && content.data && content.data.information) return content.data.information
      return null
    }
  }
}
</script>
<style scoped>
h1 {
  text-transform: uppercase !important;
  color: #000 !important;
  font-size: 4.0rem !important;
}
div >>> .child-information h2 {
  color: #ccc !important;
  font-size: 3.0rem !important;
  font-weight: 900 !important;
  margin-top: 2rem !important;
}
div >>> .child-information h3 {
  font-size: 2.5rem !important;
  margin-top: 3rem !important;
}
div >>> .child-information p {
  max-width: 700px;
  text-align: justify;
}
.child-information {
  margin-bottom: 1rem;
  margin-top: -3rem;
}
</style>
