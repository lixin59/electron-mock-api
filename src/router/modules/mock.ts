const functionRoute: AuthRoute.Route = {
  name: 'mock',
  path: '/mock',
  component: 'basic',
  children: [
    {
      name: 'mock_projects',
      path: '/mock/projects',
      component: 'self',
      meta: {
        title: '接口管理',
        requiresAuth: true,
        icon: 'nonicons:interface-16'
      }
    },
    {
      name: 'mock_project-detail',
      path: '/mock/project-detail',
      component: 'self',
      meta: {
        title: '项目详情',
        requiresAuth: true,
        hide: true,
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
