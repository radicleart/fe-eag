import axios from 'axios'

const contentStore = {
  namespaced: true,
  state: {
    content: {
      artists: [],
      charities: [],
      mainFooter: null,
      information: null,
      navigation: null,
      homepage: null,
      about: null,
      tooltips: null,
      emails: null,
      howItWorks: null
    },
    emailTemplate: '<tr><td style="padding: 20px">CLIENT_TEXT1</td></tr><tr><td style="padding: 20px; text-align: center"><hr></td></tr><tr><td style="text-align: left;"><p class="footer"><strong>Stay in touch</strong></p></td></tr><tr><td style="text-align: center;"><div class="socials"><a href="#"><img width="50px" class="icons" src="https://images.prismic.io/dbid/bdd0533f-36ff-4c68-b733-813c329a478f_instagram-brands.png?auto=compress,format"></a><a href="#"><img width="50px" class="icons" src="https://images.prismic.io/dbid/56c89838-4d79-4f05-81b8-48848278f315_facebook-f-brands.png?auto=compress,format"></a><a href="#"><img class="icons" width="50px" src="https://images.prismic.io/dbid/08015eb7-df23-428c-a68f-d397f65ba15a_twitter-brands.png?auto=compress,format"></a></div></td></tr>',
    defaultArtist: 'chemicalx',
    waitingImage: 'https://images.prismic.io/dbid/c19ad445-eab4-4de9-9b5a-c10eb158dc5e_black_no1.png?auto=compress,format'
  },
  getters: {
    getEmailTemplate: state => {
      return state.emailTemplate
    },
    getPixelBackground: state => {
      if (!state.content.homepage) return
      return state.content.homepage.pixelbackground.url
    },
    getTooltip: state => tooltipId => {
      if (!state.content.tooltips || !state.content.tooltips[tooltipId]) return
      return state.content.tooltips[tooltipId]
    },
    getEmail: state => emailId => {
      if (!state.content.emails || !state.content.emails[emailId]) return
      return state.content.emails[emailId]
    },
    getTransactionDialogMessage: (state, getters) => data => {
      let dKey = data.dKey
      if (data.dKey === 'stx-transaction-finished') dKey = 'tx-success'
      else if (data.dKey === 'stx-transaction-error') dKey = 'tx-failed'
      else if (data.dKey === 'stx-transaction-sent') dKey = 'tx-pending'
      const key = 'getDialog'
      const dialog = getters[key](dKey)
      if (!dialog || dialog.length < 3) return 'Dialog content missing for key: ' + data.dKey
      let msg = '<h1>' + dialog[0].text + '</h1>'
      msg += '<p class="my-5">' + dialog[1].text + '</p>'
      if (data.txId) msg += '<p><a href="https://explorer.stacks.co/txid/' + data.txId + '?chain=' + process.env.VUE_APP_NETWORK + '" target="_blank">' + dialog[2].text + '</p>'
      return msg
    },
    getDialog: state => dialogId => {
      if (!state.content.dialogs || !state.content.dialogs[dialogId]) return
      return state.content.dialogs[dialogId]
    },
    getInformationById: state => id => {
      return (state.content.information) ? state.content.information.find((o) => o.uid === id) : null
    },
    getHomepage: state => {
      return state.content.homepage
    },
    getAbout: state => {
      return state.content.about
    },
    getMainFooter: state => {
      return state.content.mainFooter
    },
    getNavbar: state => {
      return state.content.navigation
    },
    getHowItWorks: state => {
      return state.content.howItWorks
    }
  },
  mutations: {
    addTooltips (state, o) {
      state.content.tooltips = o
    },
    addEmails (state, o) {
      state.content.emails = o
    },
    addDialogs (state, o) {
      state.content.dialogs = o
    },
    addHomeContent (state, o) {
      state.content.homepage = o
    },
    addMainFooter (state, o) {
      state.content.mainFooter = o
    },
    addNavigationContent (state, o) {
      state.content.navigation = o
    },
    addInformation (state, o) {
      state.content.information = o
    }
  },
  actions: {
    sendEmail ({ commit }, data) {
      return new Promise((resolve, reject) => {
        axios.post(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/register/email', data).then(response => {
          resolve(response.data)
        }).catch(() => {
          resolve({ status: 'failed' })
        })
      })
    }
  }
}
export default contentStore
