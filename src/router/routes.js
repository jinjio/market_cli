
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/notice',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/NoticePage.vue') }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/test',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/TestPage.vue') }
    ],
    meta: {
      authRequired: false
    }
  },
  {
    path: '/chat_list',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ChatListPage.vue') }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/my_chat',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MyChatPage.vue') }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/chat_room/:chat_room_id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ChatPage.vue'), props: true }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: "/product_list",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/ProductListPage.vue") },
    ],
  },
  {
    path: "/payment",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/PaymentPage.vue") },
    ],
  },
  {
    path: "/product/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/ProductDetailPage.vue") },
    ],
  },
  {
    path: "/product_upload",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/ProductUploadPage.vue") },
    ],
  },
  {
    path: "/my_location",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/MyLocationPage.vue") },
    ],
  },
  {
    path: "/chat",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/ChatPage.vue") }],
  },
  {
    path: '/group_talk',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/GroupTalkPage.vue') }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/feeds',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/FeedsPage.vue') }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/my',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MyPage.vue'), props: true }
    ],
    meta: {
      authRequired: true
    }
  },
  {
    path: '/register',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RegisterPage.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/TempTokenLoginPage.vue') }]
  },
  {
    path: '/error503',
    component: () => import('pages/Error503.vue')
  },
  {
    path: '/debug',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/DebugPage.vue') }]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
