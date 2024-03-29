import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue'

const routes = [
  {
    path: '/',
    name: 'upload',
    component: Upload
  },
  {
    path: '/fileList',
    name: 'fileList',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/FileList.vue'),
  },
  {
    path: '/folderList',
    name: 'folderList',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/FolderList.vue')
  },
  {
    path: '/fileList/:filename/:hash',
    name: 'previewPage',
    component: () => import('../views/PreviewPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
