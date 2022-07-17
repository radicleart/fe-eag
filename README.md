# fe-eag

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Collections

## SIP-013 - Semi Fungibles

Steps to prepare UI for a new collection.

1. Upload the image data to ipfs.
2. Add new project https://staging.stacksmate.com/mgmnt/registry/contracts
3. Define the collection https://staging.stacksmate.com/mgmnt/manage-collection
4. Generate sip 016 meta data in the db https://staging.stacksmate.com/mgmnt/manage-json/water_running-underground
5. Download sip 016 meta data from the db https://staging.stacksmate.com/mesh/v2/tokens-sip016/ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.wru/water_running-underground
5. Update the ipfs meta data
- https://staging.stacksmate.com/mgmnt/registry/contractSandbox
- ipfs://QmYx1AnYvHGNeHt8id9z23v8tx1SPyNyVMZDyNEVSU3q3D/wru-{id}.json
6. Once its all uploaded set the ipfsUrl in the collection to the json url..
- https://hashone.mypinata.cloud/ipfs/QmbaFLJJxF7gbNLhX1opBG9FT3q977jFyD4avGH9QXoBes/wru-{id}.json
7. Copy paste a new contract. Set the params and deploy.
- Testnet Admin Mint Pass: ST223TF2F76W054AW61NTB3EXPKFMZPGWKAMZ6WKN
- Token URI - see pinata
8. Set the admin minter to;
- Testnet: ST223TF2F76W054AW61NTB3EXPKFMZPGWKAMZ6WKN
- Testnet: SP2DDG43477A5ZAEJJ76FSYDY2J5XQYFP9HCGS8AM
