export const APP_CONSTANTS = {
  SET_FIAT_CURRENCY: 'setFiatCurrency',
  KEY_RPAY_CONFIGURATION: 'getRpayConfiguration',
  KEY_APP_CONFIGURATION: 'getLocalConfiguration',
  SET_RPAY_FLOW: 'setRpayFlow',
  KEY_AMOUNTS: 'getAmounts',
  KEY_WEB_WALLET_NEEDED: 'getWebWalletNeeded',
  SET_WEB_WALLET_NEEDED: 'setWebWalletNeeded',
  KEY_WEB_WALLET_LINK_CHROME: 'getWebWalletLinkChrome',
  KEY_WEB_WALLET_LINK_FIREFOX: 'getWebWalletLinkFirefox',

  KEY_SAS_GAIA_ASSET: 'stacksApiStore/getGaiaAsset',
  KEY_SAS_CURRENT_COLLECTION: 'stacksApiStore/getCurrentCollection',
  KEY_SAS_MINT_EVENTS: 'stacksApiStore/getMintEvents',
  KEY_SAS_MINT_EVENTS_FOR_TOKEN: 'stacksApiStore/getMintEventsForToken',
  KEY_SAS_NFT_EVENTS_FOR_TOKEN: 'stacksApiStore/getNftEventsForToken',
  KEY_SAS_MY_HOLDINGS: 'stacksApiStore/getMyHoldings',
  KEY_SAS_MY_HOLDINGS_FOR_CONTRACT: 'stacksApiStore/getMyHoldingsForContract',

  KEY_TRANSACTION_DIALOG_MESSAGE: 'contentStore/getTransactionDialogMessage',
  KEY_WAITING_IMAGE: 'contentStore/getWaitingImage',
  KEY_EMAIL_TEXT: 'contentStore/getEmail',
  KEY_TOOL_TIP: 'contentStore/getTooltip',
  KEY_DIALOG_CONTENT: 'contentStore/getDialog',
  KEY_CONTENT_COLLABORATION: 'contentStore/getCollaboration',
  KEY_CONTENT_CHARITY_BY_ARTIST_ID: 'contentStore/getCharityByArtistId',
  KEY_CONTENT_ARTIST_BY_ID: 'contentStore/getArtistById',
  KEY_CONTENT_ARTIST_ID: 'contentStore/getArtistId',
  KEY_CONTENT_ARTISTS: 'contentStore/getArtists',
  KEY_CONTENT_CHARITIES: 'contentStore/getCharities',
  KEY_CONTENT_INFO_PAGE: 'contentStore/getInformationById',
  KEY_BREAK_LINE: 'contentStore/getBreakLine',
  KEY_PIXEL_BACKGROUND: 'contentStore/getPixelBackground',
  KEY_EMAIL_TEMPLATE: 'contentStore/getEmailTemplate',

  KEY_PURCHASE_CONFIGURATION: 'merchantStore/getPurchaseConfiguration',
  SET_PURCHASE_FLOW: 'merchantStore/setPurchaseConfiguration',
  KEY_TICKER_RATES: 'merchantStore/getTickerRates',
  KEY_TICKER_RATES_UNFILTERED: 'merchantStore/getUnfilteredTickerRates',
  KEY_DISPLAY_CARD: 'merchantStore/getDisplayCard',
  SET_DISPLAY_CARD: 'merchantStore/setDisplayCard',
  KEY_PAYMENT_OPTION_VALUE: 'merchantStore/getCurrentPaymentOption',
  SET_PAYMENT_OPTION_VALUE: 'merchantStore/setCurrentCryptoPaymentOption',
  KEY_ENABLED_NETWORKS: 'merchantStore/getEnabledNetworks',
  SET_PREFERRED_NETWORK_VALUE: 'merchantStore/setPreferredNetwork',
  KEY_PREFERRED_NETWORK: 'merchantStore/getPreferredNetwork',
  KEY_PAYMENT_OPTIONS: 'merchantStore/getPaymentOptions',
  KEY_INVOICE_EXPIRED: 'merchantStore/getInvoiceExpired',
  KEY_INVOICE_EXPIRY: 'merchantStore/getInvoiceExpiry',
  KEY_INVOICE_DURATION: 'merchantStore/getInvoiceDuration',
  KEY_INVOICE: 'merchantStore/getInvoice',
  KEY_HISTORIC_INVOICE: 'merchantStore/getHistoricInvoice',

  GET_LOOP_RUNS: 'stacksApiStore/getLoopRuns',
  KEY_ASSET_IMAGE_URL: 'rpayCategoryStore/getAssetImageUrl',

  KEY_PROFILE: 'stacksAuthStore/getMyProfile',
  KEY_ACCOUNT_INFO: 'stacksAuthStore/getAccountInfo',

  KEY_BNS_NAMES: 'rpayStacksContractStore/getBnsNames',
  KEY_BNS_NAME: 'rpayStacksContractStore/getBnsName',
  KEY_TARGET_FILE_FOR_DISPLAY: 'rpayStacksContractStore/getTargetFileForDisplay',
  KEY_ASSET_FROM_NFT_INDEX: 'rpayStacksContractStore/getContractAssetByNftIndex',
  KEY_ASSET_FROM_CONTRACT_BY_HASH: 'rpayStacksContractStore/getAssetFromContractByHash'
}
