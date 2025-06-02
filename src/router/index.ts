import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/factory'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/factory'
      },
      {
        path: 'factory',
        component: () => import('@/views/FactoryPage.vue')
      },
      {
        path: 'notification',
        component: () => import('@/views/NotificationPage.vue')
      },
      {
        path: 'notification/:id',
        component: () => import('@/views/Notification/NotificationDetailPage.vue')
      },
      {
        path: 'notification-demo',
        component: () => import('@/views/Notification/NotificationDemoPage.vue')
      },
      {
        path: 'me',
        component: () => import('@/views/MePage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
