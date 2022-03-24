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
    defaultArtist: 'chemicalx',
    waitingImage: 'https://images.prismic.io/dbid/c19ad445-eab4-4de9-9b5a-c10eb158dc5e_black_no1.png?auto=compress,format'
  },
  getters: {
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
  }
}
export default contentStore
