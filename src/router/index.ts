import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import MainNavbar from '@/components/layout/MainNavbar.vue'
import MainFooter from '@/components/layout/MainFooter.vue'
const MyNftLibrary = () => import('@/views/marketplace/MyNftLibrary.vue')
const NftCollection = () => import('@/views/marketplace/NftCollection.vue')
const NftCollections = () => import('@/views/marketplace/NftCollections.vue')
const PunkMinter = () => import('@/views/marketplace/PunkMinter.vue')
const AssetDetails = () => import('@/views/marketplace/AssetDetails.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    components: { default: Home, header: MainNavbar, footer: MainFooter }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/minting/:maker/:collection',
    name: 'minting',
    components: { default: PunkMinter, header: MainNavbar, footer: MainFooter },
    meta: { title: 'Marketplace for NFTs by the StacksMate Team Secured by Bitcoin' }
  },
  {
    path: '/nft-collections',
    name: 'collections',
    components: { default: NftCollections, header: MainNavbar, footer: MainFooter },
    meta: { title: 'Marketplace for NFTs by the StacksMate Team Secured by Bitcoin' }
  },
  {
    path: '/nft-collection/:collectionId',
    name: 'collection',
    components: { default: NftCollection, header: MainNavbar, footer: MainFooter },
    meta: { title: 'Marketplace for NFTs by EAG Secured by Bitcoin' }
  },
  {
    path: '/nft-collection/:collectionId/:offset/:pageSize',
    name: 'collection',
    components: { default: NftCollection, header: MainNavbar, footer: MainFooter },
    meta: { title: 'Marketplace for NFTs by EAG Secured by Bitcoin' }
  },
  {
    path: '/nfts/:contractId/:nftIndex',
    name: 'asset-by-index',
    components: { default: AssetDetails, header: MainNavbar, footer: MainFooter },
    meta: {
      requiresAuth: false,
      requiresAdmin: false,
      title: 'NFT display'
    }
  },
  {
    path: '/my-nfts',
    name: 'my-nfts',
    components: { default: MyNftLibrary, header: MainNavbar, footer: MainFooter },
    meta: {
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/my-nfts/:collectionId',
    name: 'my-nfts',
    components: { default: MyNftLibrary, header: MainNavbar, footer: MainFooter },
    meta: {
      requiresAuth: true,
      requiresAdmin: false
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
