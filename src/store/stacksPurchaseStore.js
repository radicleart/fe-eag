import utils from '@/services/utils'
import BigNum from 'bn.js'
import {
  listCV,
  uintCV,
  tupleCV,
  stringAsciiCV,
  standardPrincipalCV,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  PostConditionMode,
  makeStandardNonFungiblePostCondition,
  makeStandardFungiblePostCondition
} from '@stacks/transactions'
import { openContractCall } from '@stacks/connect'
import {
  StacksTestnet,
  StacksMainnet
} from '@stacks/network'

const getSaleRoyalties = function (data) {
  const addressList = []
  const shareList = []
  const secondariesList = []
  for (let i = 0; i < 10; i++) {
    const beneficiary = data.beneficiaries[i]
    if (beneficiary) {
      if (i === 0) {
        // address of the nft owner (i=0) is known at runtime.
        // so we just enter the contract address as a placeholder.
        // see payment-split method in contract.
        addressList.push(standardPrincipalCV(data.contractAddress))
      } else {
        addressList.push(standardPrincipalCV(beneficiary.chainAddress))
      }
      shareList.push(uintCV(utils.toOnChainAmount(beneficiary.royalty * 100))) // allows 2 d.p.
      secondariesList.push(uintCV(utils.toOnChainAmount(beneficiary.secondaryRoyalty * 100))) // allows 2 d.p.
    } else {
      addressList.push(standardPrincipalCV(data.contractAddress))
      shareList.push(uintCV(0))
      secondariesList.push(uintCV(0))
    }
  }
  return {
    addresses: listCV(addressList),
    shares: listCV(shareList),
    secondaries: listCV(secondariesList)
  }
}

const getMintRoyalties = function (data) {
  const addressList = []
  const shareList = []
  for (let i = 0; i < 4; i++) {
    const beneficiary = data.minteficaries[i]
    if (beneficiary) {
      addressList.push(standardPrincipalCV(beneficiary.chainAddress))
      shareList.push(uintCV(utils.toOnChainAmount(beneficiary.royalty * 100))) // allows 2 d.p.
    } else {
      addressList.push(standardPrincipalCV(data.contractAddress))
      shareList.push(uintCV(0))
    }
  }
  return {
    addresses: listCV(addressList),
    shares: listCV(shareList)
  }
}

const getSerialisedNftTuple = function (data) {
  const tupCV = tupleCV({
    'token-id': uintCV(data.nftIndex),
    owner: standardPrincipalCV(data.owner)
  })
  return tupCV
}

const getGFTMintPostConds = function (data) {
  const postConditionAddress = data.owner
  const postConditionCode = FungibleConditionCode.Equal
  const postConditionAmount = new BigNum(data.amount)
  const fungibleAssetInfo = createAssetInfo(data.contractAddress, data.contractName, 'edition-token')

  const standardFungiblePostCondition = makeStandardFungiblePostCondition(
    postConditionAddress,
    postConditionCode,
    postConditionAmount,
    fungibleAssetInfo
  )

  const nonFungibleAssetInfo = createAssetInfo(
    data.contractAddress,
    data.contractName,
    (data.assetName) ? data.assetName : data.contractName.split('-')[0]
  )
  const standardNonFungiblePostConditionNotOwns = makeStandardNonFungiblePostCondition(
    data.owner,
    NonFungibleConditionCode.DoesNotOwn,
    nonFungibleAssetInfo,
    getSerialisedNftTuple(data)
  )

  const postConds = []
  if (data.amount >= data.balance) {
    postConds.push(standardNonFungiblePostConditionNotOwns)
  } else {
    postConds.push(standardNonFungiblePostConditionNotOwns)
  }
  postConds.push(standardFungiblePostCondition)
  return postConds
}

const getCPSMintPostConds = function (rootGetters, data) {
  const profile = rootGetters['stacksAuthStore/getMyProfile']
  const postCondAddress = profile.stxAddress
  let postConds = []
  let amount = new BigNum(utils.toOnChainAmount(data.mintPrice + 0.001))
  if (data.batchOption > 1) {
    amount = new BigNum(utils.toOnChainAmount((data.mintPrice * data.batchOption + 0.001)))
  }
  if (data.postConditions) {
    postConds = data.postConditions
  } else {
    postConds.push(makeStandardSTXPostCondition(
      postCondAddress,
      FungibleConditionCode.Less,
      amount
    ))
  }
  return postConds
}

const getProvider = function (data) {
  if (!data || !data.provider) return 'risidio'
  return data.provider
}

const stacksPurchaseStore = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    cpsMintToken ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const entries = []
        for (let i = 0; i < data.batchOption; i++) {
          entries.push(uintCV(i))
        }
        const callData = {
          postConditions: getCPSMintPostConds(rootGetters, data),
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: (data.batchOption === 1) ? 'mint-token' : 'batch-mint-token',
          functionArgs: (data.batchOption === 1) ? [] : [listCV(entries)]
        }
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          result.opcode = 'stx-transaction-sent'
          result.assetHash = data.assetHash
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    updateMintPrice ({ dispatch }, data) {
      return new Promise(function (resolve, reject) {
        const functionArgs = [uintCV(utils.toOnChainAmount(data.mintPrice))]
        const callData = {
          contractAddress: data.contractId.split('.')[0],
          contractName: data.contractId.split('.')[1],
          functionName: 'update-mint-price',
          functionArgs: functionArgs
        }
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    updateTokenUri ({ dispatch }, data) {
      return new Promise(function (resolve, reject) {
        const tokenUri = stringAsciiCV(data.tokenUri)
        const callData = {
          contractAddress: data.contractId.split('.')[0],
          contractName: data.contractId.split('.')[1],
          functionName: 'set-token-uri',
          functionArgs: [tokenUri]
        }
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    freezeMetaData ({ dispatch }, data) {
      return new Promise(function (resolve, reject) {
        const callData = {
          contractAddress: data.contractId.split('.')[0],
          contractName: data.contractId.split('.')[1],
          functionName: 'freeze-metadata',
          functionArgs: []
        }
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    setTradeInfo ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        // (asset-hash (buff 32)) (sale-type uint) (increment-stx uint) (reserve-stx uint) (amount-stx uint)
        // const buffer = bufferCV(Buffer.from(asset.assetHash, 'hex')) // Buffer.from(hash.toString(CryptoJS.enc.Hex), 'hex')
        const nftIndex = uintCV(data.nftIndex)
        const saleType = uintCV(data.saleData.saleType)
        const incrementPrice = uintCV(utils.toOnChainAmount(data.saleData.incrementPrice))
        const reservePrice = uintCV(utils.toOnChainAmount(data.saleData.reservePrice))
        const buyNowOrStartingPrice = uintCV(utils.toOnChainAmount(data.saleData.buyNowOrStartingPrice))
        const biddingEndTime = uintCV(data.saleData.biddingEndTime)
        const functionArgs = [nftIndex, saleType, incrementPrice, reservePrice, buyNowOrStartingPrice, biddingEndTime]
        const callData = {
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'set-sale-data',
          functionArgs: functionArgs
        }
        const configuration = rootGetters['rpayStore/getConfiguration']
        if (configuration.network === 'local' && data.sendAsSky) {
          callData.sendAsSky = true
        }
        const methos = (configuration.network === 'local') ? 'rpayStacksStore/callContractRisidio' : 'rpayStacksStore/callContractBlockstack'
        dispatch(methos, callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    setCollectionRoyalties ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const configuration = rootGetters['rpayStore/getConfiguration']
        const saleRoyalties = getSaleRoyalties(data)
        const mintRoyalties = getMintRoyalties(data)
        data.functionName = 'set-collection-royalties'
        data.functionArgs = [mintRoyalties.addresses, mintRoyalties.shares, saleRoyalties.addresses, saleRoyalties.shares, saleRoyalties.secondaries]
        const methos = (configuration.network === 'local') ? 'rpayStacksStore/callContractRisidio' : 'rpayStacksStore/callContractBlockstack'
        dispatch((data.methos || methos), data, { root: true }).then((result) => {
          result.opcode = 'stx-transaction-sent'
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    transferAsset ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const nonFungibleAssetInfo = createAssetInfo(
          data.contractAddress,
          data.contractName,
          (data.assetName) ? data.assetName : data.contractName.split('-')[0]
        )
        // Post-condition check failure on non-fungible asset ST1ESYCGJB5Z5NBHS39XPC70PGC14WAQK5XXNQYDW.thisisnumberone-v1::my-nft owned by STFJEDEQB1Y1CQ7F04CS62DCS5MXZVSNXXN413ZG: UInt(3) Sent
        const standardNonFungiblePostCondition = makeStandardNonFungiblePostCondition(
          data.owner, // postConditionAddress
          NonFungibleConditionCode.DoesNotOwn,
          nonFungibleAssetInfo, // contract and nft info
          uintCV(data.nftIndex)
        )
        // const profile = rootGetters['stacksAuthStore/getMyProfile']
        // const owner = profile.stxAddress
        data.functionName = 'transfer'
        data.postConditions = [standardNonFungiblePostCondition]
        data.functionArgs = [uintCV(data.nftIndex), standardPrincipalCV(data.owner), standardPrincipalCV(data.recipient)]
        const configuration = rootGetters['rpayStore/getConfiguration']
        const methos = (configuration.network === 'local') ? 'rpayStacksStore/callContractRisidio' : 'rpayStacksStore/callContractBlockstack'
        if (getProvider(data) === 'risidio') {
          data.sendAsSky = (data.owner === 'STFJEDEQB1Y1CQ7F04CS62DCS5MXZVSNXXN413ZG')
        }
        dispatch(methos, data, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    transferSft ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        data.postConditionMode = PostConditionMode.Deny
        data.postConditions = getGFTMintPostConds(data)
        data.functionName = 'transfer'
        data.network = (process.env.VUE_APP_NETWORK === 'mainnet') ? new StacksMainnet() : new StacksTestnet()
        data.functionArgs = [uintCV(data.nftIndex), uintCV(data.amount), standardPrincipalCV(data.owner), standardPrincipalCV(data.recipient)]
        dispatch('rpayStacksStore/callContractBlockstack', data, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    updateMetaDataUrl ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        data.functionName = 'update-meta-data-url'
        const metaDataUrl = stringAsciiCV(data.metaDataUrl)
        data.functionArgs = [uintCV(data.nftIndex), metaDataUrl]
        dispatch('rpayStacksStore/callContractBlockstack', data, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    buyNow ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const functionArgs = [uintCV(data.nftIndex), standardPrincipalCV(data.owner), standardPrincipalCV(data.recipient)]
        const profile = rootGetters['stacksAuthStore/getMyProfile']
        const postCondAddress = profile.stxAddress
        let postConds = []
        const amount = new BigNum(utils.toOnChainAmount(data.buyNowOrStartingPrice))
        if (data.postConditions) {
          postConds = data.postConditions
        } else {
          postConds.push(makeStandardSTXPostCondition(
            postCondAddress,
            FungibleConditionCode.LessEqual, // less or equal - if the buyer is one of the royalties payment is skipped.
            amount
          ))
          const nonFungibleAssetInfo = createAssetInfo(
            data.contractAddress,
            data.contractName,
            data.contractName.split('-')[0]
          )
          postConds.push(makeStandardNonFungiblePostCondition(
            data.owner,
            NonFungibleConditionCode.DoesNotOwn,
            nonFungibleAssetInfo,
            uintCV(data.nftIndex)
          ))
        }
        const callData = {
          postConditions: postConds,
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'buy-now',
          functionArgs: functionArgs,
          sendAsSky: data.sendAsSky
        }
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    callContractBlockstack ({ dispatch, commit, rootGetters, state }, data) {
      return new Promise((resolve, reject) => {
        const txOptions = {
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: data.functionName,
          functionArgs: (data.functionArgs) ? data.functionArgs : [],
          postConditions: (data.postConditions) ? data.postConditions : [],
          postConditionMode: (data.postConditionMode) ? data.postConditionMode : PostConditionMode.Deny,
          // network: (configuration.network === 'mainnet') ? mainnet : testnet,
          appDetails: {
            name: state.appName,
            icon: state.appLogo
          },
          onFinish: (response) => {
            const result = {
              txId: (response.txId && response.txId.txid) ? response.txId.txid : response.txId,
              txRaw: response.txRaw,
              stacksTransaction: response.stacksTransaction,
              network: 15,
              assetHash: data.assetHash,
              contractAddress: data.contractAddress,
              contractName: data.contractName,
              functionName: data.functionName,
              functionArgs: data.functionArgs
            }
            resolve(result)
          }
        }
        openContractCall(txOptions).catch((error) => {
          reject(error)
        })
      })
    }
  }
}
export default stacksPurchaseStore
