import crypto from 'crypto'
import dataUriToBuffer from 'data-uri-to-buffer'
import { c32address, c32addressDecode } from 'c32check'
import { makeECPrivateKey, publicKeyToAddress, signECDSA, verifyECDSA, encryptECIES, decryptECIES } from '@stacks/encryption'
import { SECP256K1Client } from 'jsontokens'
import { sha256 } from 'sha.js'
import {
  hexToCV, cvToJSON
} from '@stacks/transactions'

const precision = 1000000
const btcPrecision = 100000000

const utils = {
  jsonFromTxResult: function (tx) {
    if (!tx) return null
    try {
      if (typeof tx === 'string' && tx.startsWith('0x')) {
        const cvVer = hexToCV(tx)
        return cvToJSON(cvVer)
      } else {
        const cvVer = hexToCV(tx.tx_result.hex)
        return cvToJSON(cvVer)
      }
    } catch (e) {
      return null
    }
  },
  stringToHex: function (str) {
    const arr = []
    for (let i = 0; i < str.length; i++) {
      arr[i] = (str.charCodeAt(i).toString(16)).slice(-4)
    }
    return '0x' + arr.join('')
  },
  fromSatoshi: function (amount) {
    try {
      return Math.round(amount) / btcPrecision
    } catch {
      return 0
    }
  },
  fromOnChainAmount: function (amountMicroStx, gftPrecision) {
    try {
      amountMicroStx = parseInt(amountMicroStx, 16)
      if (typeof amountMicroStx === 'string') {
        amountMicroStx = Number(amountMicroStx)
      }
      if (amountMicroStx === 0) return 0
      if (!gftPrecision) {
        amountMicroStx = amountMicroStx / precision
        return Math.round(amountMicroStx * precision) / precision
      } else {
        const newPrec = Math.pow(10, gftPrecision)
        amountMicroStx = amountMicroStx / newPrec
        return Math.round(amountMicroStx * newPrec) / newPrec
      }
    } catch {
      return 0
    }
  },
  toOnChainAmount: function (amount, gftPrecision) {
    try {
      if (!gftPrecision) {
        amount = amount * precision
        return Math.round(amount * precision) / precision
      } else {
        const newPrec = Math.pow(10, gftPrecision)
        amount = amount * newPrec
        return Math.round(amount * newPrec) / newPrec
      }
    } catch {
      return 0
    }
  },
  sha256: function (message) {
    let encoded
    if (typeof message === 'string') {
      encoded = new TextEncoder().encode(message)
    } else if (typeof message === 'number') {
      // const buf = Buffer.alloc(8)
      // buf.writeUInt8(message, 0)
      // encoded = new Uint8Array(buf)
      const buf = Buffer.alloc(16)
      buf.writeUIntLE(message, 0, 6)
      encoded = Uint8Array.from(buf)
    } else {
      // encoded = new Uint8Array(message)
      encoded = Uint8Array.from(message)
    }
    // eslint-disable-next-line new-cap
    const hashFunction = new sha256()
    return hashFunction.update(encoded).digest()
    // return hashSha256(encoded)
  },
  makeKeys: function () {
    const privateKey = makeECPrivateKey()
    const publicKey = SECP256K1Client.derivePublicKey(privateKey)
    const address = publicKeyToAddress(publicKey)
    return {
      privateKey: privateKey,
      publicKey: publicKey,
      address: address
    }
  },
  encryptWithPubKey: function (publicKey, privateKey, message) {
    return new Promise((resolve) => {
      // Encrypt string with public key
      encryptECIES(publicKey, Buffer.from(message), true).then((cipherObj) => {
        // Decrypt the cipher with private key to get the message
        decryptECIES(privateKey, cipherObj).then((deciphered) => {
          resolve(deciphered)
        })
      })
    })
  },
  signWithPrivKey: async function (privateKey, message) {
    // Encrypt string with public key
    const sigObj = await signECDSA(privateKey, message)
    // Verify content using ECDSA
    const result = await verifyECDSA(message, sigObj.publicKey, sigObj.signature)
    return (result) ? sigObj : null
  },
  buildHash: function (hashable) {
    return crypto.createHash('sha256').update(hashable).digest('hex')
  },
  convertAddress: function (network, b160Address) {
    let version = 26
    if (network === 'mainnet') version = 22
    const address = c32address(version, b160Address) // 22 for mainnet
    return address
  },
  convertAddressFrom: function (stxAddress) {
    if (!stxAddress) return '?'
    const decoded = c32addressDecode(stxAddress)
    return decoded
  },
  toDecimals: function (amount, precision) {
    if (!precision) precision = 100
    if (!amount) return
    if (typeof amount === 'string') {
      amount = Number(amount)
    }
    return Math.round(amount * precision) / precision // amount.toFixed(2)
  },
  fetchBase64FromImageUrl: function (url, document) {
    return new Promise((resolve) => {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(this, 0, 0)
        const dataURL = canvas.toDataURL('image/png')
        const mimeType = dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';')) // => image/png
        const imageBuffer = dataUriToBuffer(dataURL)
        resolve({ dataURL: dataURL, imageBuffer: imageBuffer, mimeType: mimeType })
      }
      img.src = url
    })
  },
  getFileExtension: function (filename, type) {
    if (filename && filename.lastIndexOf('.') > 0) {
      const index = filename.lastIndexOf('.')
      return filename.substring(index + 1)
    } else if (type) {
      const index = type.lastIndexOf('/') + 1
      return '.' + type.substring(index)
    }
  },
  getFileNameNoExtension: function (filename) {
    if (filename && filename.lastIndexOf('.') > 0) {
      const index = filename.lastIndexOf('.')
      return filename.substring(index + 1)
    }
    return ''
  },
  getTypeFromFileExtension: function (filename) {
    const extension = this.getFileNameNoExtension(filename)
    if (extension === 'mp4') {
      return 'video/mp4'
    }
    return ''
  },
  copyAddress: function (document, flasher, target) {
    const tempInput = document.createElement('input')
    tempInput.style = 'position: absolute; left: -1000px; top: -1000px'
    tempInput.value = target
    document.body.appendChild(tempInput)
    tempInput.select()
    document.execCommand('copy')
    document.body.removeChild(tempInput)
    flasher.classList.add('flasher')
    setTimeout(function () {
      flasher.classList.remove('flasher')
    }, 1000)
  },
  makeFlasher: function (flasher) {
    flasher.classList.add('flasher')
    setTimeout(function () {
      flasher.classList.remove('flasher')
      setTimeout(function () {
        flasher.classList.add('flasher')
        setTimeout(function () {
          flasher.classList.remove('flasher')
          setTimeout(function () {
            flasher.classList.add('flasher')
            setTimeout(function () {
              flasher.classList.remove('flasher')
            }, 300)
          }, 300)
        }, 300)
      }, 300)
    }, 300)
  },
  fromMicroAmount: function (amountMicroStx) {
    try {
      if (amountMicroStx === 0) return 0
      const val = Math.round(amountMicroStx) / (precision)
      return val
    } catch {
      return 0
    }
  },
  sortLoopRuns: function (loopRuns) {
    loopRuns = loopRuns.sort(function compare (a, b) {
      const nameA = a.currentRun.toUpperCase() // ignore upper and lowercase
      const nameB = b.currentRun.toUpperCase() // ignore upper and lowercase
      if (nameA > nameB) {
        return 1
      }
      if (nameA < nameB) {
        return -1
      }
      // names must be equal
      return 0
    })
    return loopRuns
  },
  sortResults: function (resultSet) {
    resultSet = resultSet.sort(function compare (a, b) {
      const nameA = a.title.toUpperCase() // ignore upper and lowercase
      const nameB = b.title.toUpperCase() // ignore upper and lowercase
      if (nameA > nameB) {
        return -1
      }
      if (nameA < nameB) {
        return 1
      }
      // names must be equal
      return 0
    })
    return resultSet
  },
  audioToBase64: function (audioFile) {
    return new Promise((resolve) => {
      const request = new XMLHttpRequest()
      request.open('GET', audioFile, true)
      request.responseType = 'blob'
      request.onload = function () {
        const reader = new FileReader()
        reader.readAsDataURL(request.response)
        reader.onload = function (e) {
          resolve(e.target.result)
        }
      }
      request.send()
    })
  },
  readFileChunks: function (fileUrl) {
    return new Promise((resolve) => {
      const myRequest = new Request(fileUrl)
      const fileObject = { fileUrl: fileUrl }
      fileObject.dataHash = ''
      // fetch returns a promise
      const $self = this
      fetch(myRequest).then((response) => {
        const contentLength = parseInt(response.headers.get('Content-Length'))
        // response.body is a readable stream
        // @link https://docs.microsoft.com/en-us/microsoft-edge/dev-guide/performance/streams-api
        const myReader = response.body.getReader()
        // the reader result will need to be decoded to text
        // @link https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/TextDecoder
        const decoder = new TextDecoder()
        // add decoded text to buffer for decoding
        let buffer = ''
        // you could use the number of bytes received to implement a progress indicator
        let received = 0
        // read() returns a promise
        myReader.read().then(function processResult (result) {
          // the result object contains two properties:
          // done  - true if the stream is finished
          // value - the data
          if (result.done) {
            fileObject.type = $self.getTypeFromFileExtension(fileUrl)
            fileObject.size = contentLength
            fileObject.received = received
            resolve(fileObject)
            return
          }
          // update the number of bytes received total
          received += result.value.length
          // result.value is a Uint8Array so it will need to be decoded
          // buffer the decoded text before processing it
          buffer = decoder.decode(result.value, { stream: true })
          // buffer += result.value
          /* process the buffer string */

          // read the next piece of the stream and process the result
          fileObject.dataHash = utils.buildHash(buffer + fileObject.dataHash)
          return myReader.read().then(processResult)
          /**
          myReader.read().then(() => {
            // processResult(result)
             * this is how to read the whole file - we'll just take the first chunk, hash it and save the fileUrl.
            if (received >= contentLength) {
              const type = $self.getTypeFromFileExtension(fileUrl)
              resolve({ fileUrl: fileUrl, type: type, size: contentLength, received: received })
            } else {
              processResult(result)
            }
          })
          **/
        })
      })
    })
  },
  readFileFromUrlToDataURL: function (url) {
    return new Promise((resolve) => {
      const request = new XMLHttpRequest()
      request.open('GET', url, true)
      request.responseType = 'blob'
      request.onload = function () {
        const reader = new FileReader()
        reader.readAsDataURL(request.response)
        const file = {
          size: request.response.size,
          type: request.response.type
        }
        reader.onload = function (e) {
          file.dataUrl = e.target.result
          resolve(file)
        }
      }
      request.send()
    })
  }
}
export default utils
