const functionRoute: AuthRoute.Route = {
  name: 'mock',
  path: '/mock',
  component: 'basic',
  children: [
    {
      name: 'mock_list',
      path: '/mock/list',
      component: 'self',
      meta: {
        title: '接口管理',
        requiresAuth: true,
        icon: 'nonicons:interface-16'
      }
    }
  ],
  meta: {
    title: 'MOCK管理',
    icon: 'icon-park-outline:all-application',
    order: 6
  }
};

export default functionRoute;
