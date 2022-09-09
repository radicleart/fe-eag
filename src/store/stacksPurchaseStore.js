import utils from '@/services/utils'
import BigNum from 'bn.js'
import {
  listCV,
  uintCV,
  tupleCV,
  someCV,
  noneCV,
  trueCV,
  falseCV,
  serializeCV,
  stringAsciiCV,
  standardPrincipalCV,
  contractPrincipalCV,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  PostConditionMode,
  makeStandardNonFungiblePostCondition,
  makeContractNonFungiblePostCondition,
  makeStandardFungiblePostCondition
} from '@stacks/transactions'
import { openContractCall } from '@stacks/connect'
import { APP_CONSTANTS } from '@/app-constants'
import axios from 'axios'

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

const getSerialisedNftTuple = function (nftIndex, owner) {
  let tupCV
  if (owner.indexOf('.') === -1) {
    tupCV = tupleCV({ 'token-id': uintCV(nftIndex), owner: standardPrincipalCV(owner) })
  } else {
    tupCV = tupleCV({ 'token-id': uintCV(nftIndex), owner: contractPrincipalCV(owner.split('.')[0], owner.split('.')[1]) })
  }
  return tupCV
}

const getNonFungiblePostConditionNotOwns = function (nonFungibleAssetInfo, nftIndex, principal) {
  if (principal.indexOf('.') === -1) {
    return makeStandardNonFungiblePostCondition(
      principal,
      NonFungibleConditionCode.DoesNotOwn,
      nonFungibleAssetInfo,
      getSerialisedNftTuple(nftIndex, principal)
    )
  } else {
    return makeContractNonFungiblePostCondition(
      principal.split('.')[0],
      principal.split('.')[1],
      NonFungibleConditionCode.DoesNotOwn,
      nonFungibleAssetInfo,
      getSerialisedNftTuple(nftIndex, principal)
    )
  }
}

const getSftTransferPostConds = function (data) {
  const standardFungiblePostCondition = makeStandardFungiblePostCondition(
    data.owner,
    FungibleConditionCode.Equal,
    new BigNum(utils.toOnChainAmount(data.amount, data.sftDecimals)),
    createAssetInfo(data.contractAddress, data.contractName, 'edition-token')
  )

  const nonFungibleAssetInfo = createAssetInfo(
    data.contractAddress,
    data.contractName,
    (data.assetName) ? data.assetName : data.contractName.split('-')[0]
  )
  const postConds = []

  // the sender burn event
  const ownerNonFungiblePostConditionNotOwns = getNonFungiblePostConditionNotOwns(nonFungibleAssetInfo, data.nftIndex, data.owner)
  postConds.push(ownerNonFungiblePostConditionNotOwns)

  if (data.recipientBalance > 0) {
    // the recipient burn event if they have non zero balance
    const recipientNonFungiblePostConditionNotOwns = getNonFungiblePostConditionNotOwns(nonFungibleAssetInfo, data.nftIndex, data.recipient)
    postConds.push(recipientNonFungiblePostConditionNotOwns)
  }

  // the FT transfer event
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
    getCommissionTokensByContract: function ({ rootGetters }, data) {
      return new Promise(function (resolve) {
        axios.get(process.env.VUE_APP_RISIDIO_API + '/mesh/v2/mint-commissions-by-contract/' + data.contractId).then((response) => {
          resolve(response.data)
        }).catch(() => {
          resolve()
        })
      })
    },
    lookupMintPassBalance: function ({ dispatch }, data) {
      return new Promise(function (resolve) {
        const functionArgs = [`0x${serializeCV(standardPrincipalCV(data.stxAddress)).toString('hex')}`]
        // const functionArgs = (data.functionArgs) ? data.functionArgs : [standardPrincipalCV(data.stxAddress)]
        const callData = {
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'get-mint-pass-balance',
          functionArgs: functionArgs
        }
        dispatch('callContractReadOnly', callData).then((result) => {
          resolve(result)
        }).catch((e) => {
          resolve(null)
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
        dispatch('callContractBlockstack', callData).then((result) => {
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
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    setCollectionRoyalties ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const saleRoyalties = getSaleRoyalties(data)
        const mintRoyalties = getMintRoyalties(data)
        data.functionName = 'set-collection-royalties'
        data.functionArgs = [mintRoyalties.addresses, mintRoyalties.shares, saleRoyalties.addresses, saleRoyalties.shares, saleRoyalties.secondaries]
        dispatch('stacksPurchaseStore/callContractBlockstack', data, { root: true }).then((result) => {
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
        dispatch('stacksPurchaseStore/callContractBlockstack', data, { root: true }).then((result) => {
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
        dispatch('stacksPurchaseStore/callContractBlockstack', data, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    listInToken ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        // nft-asset-contract <sft-trait>
        // listing {token-id: uint, amount: uint, unit-price: uint, expiry: uint, taker: (optional principal)}
        // com <commission-trait>
        // payment-token <ft-trait>
        const functionArgs = [uintCV(data.nftIndex), uintCV(utils.toOnChainAmount(data.price, data.decimals)), contractPrincipalCV(data.commissionContractAddress, data.commissionContractName), contractPrincipalCV(data.tokenContractAddress, data.tokenContractName)]
        const callData = {
          postConditions: [],
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'list-in-token',
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
    transferSft ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        data.postConditionMode = PostConditionMode.Deny
        data.postConditions = getSftTransferPostConds(data)
        data.functionName = 'transfer'
        // data.network = (process.env.VUE_APP_NETWORK === 'mainnet') ? new StacksMainnet() : new StacksTestnet()
        data.functionArgs = [uintCV(data.nftIndex), uintCV(utils.toOnChainAmount(data.amount, data.sftDecimals)), standardPrincipalCV(data.owner), standardPrincipalCV(data.recipient)]
        dispatch('callContractBlockstack', data).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    listSFTInToken ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        // nft-asset-contract <sft-trait>
        // listing {token-id: uint, amount: uint, unit-price: uint, expiry: uint, taker: (optional principal)}
        // com <commission-trait>
        // payment-token <ft-trait>
        const tipHeight = rootGetters[APP_CONSTANTS.KEY_STACKS_TIP_HEIGHT]
        const listing = tupleCV({
          'token-id': uintCV(data.nftIndex),
          amount: uintCV(utils.toOnChainAmount(data.amount, data.sftDecimals)),
          'unit-price': uintCV(utils.toOnChainAmount(data.unitPrice, data.decimals)),
          expiry: uintCV(tipHeight + 10000),
          taker: data.taker ? someCV(data.principal(data.taker)) : noneCV()
        })
        const functionArgs = [
          contractPrincipalCV(data.contractAddress, data.contractName),
          listing,
          contractPrincipalCV(data.commissionContractAddress, data.commissionContractName),
          contractPrincipalCV(data.tokenContractAddress, data.tokenContractName)
        ]
        const callData = {
          postConditionMode: PostConditionMode.Deny,
          postConditions: getSftTransferPostConds(data),
          contractAddress: process.env.VUE_APP_MARKETPLACE_CONTRACT_ADDRESS,
          contractName: process.env.VUE_APP_MARKETPLACE_CONTRACT_NAME,
          functionName: 'list-in-token',
          functionArgs: functionArgs
        }
        dispatch('callContractBlockstack', callData).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    unlistInToken ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        const functionArgs = [uintCV(data.nftIndex)]
        const callData = {
          postConditions: [],
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'unlist-in-token',
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
    buyInToken ({ dispatch, rootGetters }, data) {
      return new Promise((resolve, reject) => {
        const functionArgs = [uintCV(data.nftIndex), contractPrincipalCV(data.commissionContractAddress, data.commissionContractName), contractPrincipalCV(data.tokenContractAddress, data.tokenContractName)]
        let postConds = []
        if (data.postConditions) {
          postConds = data.postConditions
        } else {
          const profile = rootGetters['rpayAuthStore/getMyProfile']
          const postCondAddress = profile.stxAddress
          const postConditionAmount = new BigNum(utils.toOnChainAmount(data.price, data.decimals))
          if (data.tokenContractName === 'stx-token' || data.tokenContractName === 'unwrapped-stx-token') {
            postConds.push(makeStandardSTXPostCondition(postCondAddress, FungibleConditionCode.LessEqual, postConditionAmount))
          } else {
            const fungibleAssetInfo = createAssetInfo(data.tokenContractAddress, data.tokenContractName, data.tokenAssetName)
            const standardFungiblePostCondition = makeStandardFungiblePostCondition(postCondAddress, FungibleConditionCode.LessEqual, postConditionAmount, fungibleAssetInfo)
            postConds.push(standardFungiblePostCondition)
          }
          const nonFungibleAssetInfo = createAssetInfo(data.contractAddress, data.contractName, data.assetName)
          postConds.push(makeStandardNonFungiblePostCondition(data.owner, NonFungibleConditionCode.DoesNotOwn, nonFungibleAssetInfo, uintCV(data.nftIndex)))
        }
        const callData = {
          postConditions: postConds,
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'buy-in-token',
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
    allowList ({ dispatch }, data) {
      return new Promise((resolve, reject) => {
        let allowed = trueCV()
        if (!data.allowed) {
          allowed = falseCV()
        }
        const functionArgs = [contractPrincipalCV(data.allowedContractAddress, data.allowedContractName), allowed]
        const callData = {
          postConditions: [],
          contractAddress: data.contractAddress,
          contractName: data.contractName,
          functionName: 'set-allowed',
          functionArgs: functionArgs
        }
        dispatch('stacksPurchaseStore/callContractBlockstack', callData, { root: true }).then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    callContractBlockstack ({ state }, data) {
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
