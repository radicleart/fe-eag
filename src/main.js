import Vue from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './router'
import store from './store'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// custom definitions
import '@/assets/scss/custom.scss'
import Vue2TouchEvents from 'vue2-touch-events'
import Notifications from 'vue-notification'
import PrismicVue from 'prismic-vue'
import linkResolver from './prismic/link-resolver'
import htmlSerializer from './prismic/html-serializer'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

if (!window.eventBus) {
  window.eventBus = new Vue()
}

Vue.config.productionTip = false
Vue.use(PrismicVue, {
  endpoint: 'https://dbid.cdn.prismic.io/api/v2',
  linkResolver,
  htmlSerializer
})
Vue.use(Vue2TouchEvents)
Vue.use(Notifications, { closeOnClick: true, duration: 6000 })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
