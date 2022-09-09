const payment = {
  forceNew: false,
  amountFiat: 2,
  amountEth: 2,
  amountBtc: 2,
  amountStx: 2,
  currency: 'GBP',
  paymentCode: 'po-12324',
  allowMultiples: false,
  stxPaymentAddress: process.env.VUE_APP_STACKS_PAYMENT_ADDRESS,
  ethPaymentAddress: process.env.VUE_APP_ETH_PAYMENT_ADDRESS,
  ethNetworkId: Number(process.env.VUE_APP_ETH_NETWORK_ID),
  paymentOption: 'bitcoin',
  paymentOptions: [
    { allowFiat: false, disabled: true },
    { allowPaypal: false, disabled: true },
    { allowBitcoin: true, disabled: false },
    { allowLightning: true, disabled: false },
    { allowStacks: false, disabled: true },
    { allowLSAT: false, disabled: true },
    { allowEthereum: false, disabled: false }
  ],
  creditAttributes: {
    start: 2,
    step: 2,
    min: 2,
    max: 20
  },
  squarePay: {
    applicationId: process.env.VUE_APP_SQUARE_APPLICATION_ID,
    locationId: process.env.VUE_APP_SQUARE_LOCATION_ID,
    squareUrl: process.env.VUE_APP_VUE_APP_SQUARE_URL
  }
}
const appDetails = {
  name: 'StacksMate and the User Owned Internet',
  icon: origin + '/img/logo/logo.png'
}
const setup = function (data) {
  let risidioCardMode = 'purchase-flow'
  if (data.flow) {
    risidioCardMode = data.flow
  }
  const NETWORK = process.env.VUE_APP_NETWORK
  // let beneficiaries = []
  const risidioBaseApi = process.env.VUE_APP_RISIDIO_API
  const configuration = {
    priceInStx: data.priceInStx,
    asset: data.asset,
    loopRun: data.loopRun,
    appDetails: appDetails,
    payment: payment,
    minter: {},
    network: NETWORK,
    risidioBaseApi: risidioBaseApi,
    risidioStacksApi: process.env.VUE_APP_STACKS_API,
    risidioWalletMac: process.env.VUE_APP_WALLET_MAC,
    risidioWalletSky: process.env.VUE_APP_WALLET_SKY,
    risidioCardMode: risidioCardMode
  }
  // window.risidioPaymentConfig = JSON.stringify(configuration)
  return configuration
}

const storeUtils = {
  getConfig: function (data) {
    return setup(data)
  }
}
export default storeUtils
