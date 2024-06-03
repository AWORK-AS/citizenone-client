/**
 * This file is used to configure the app
 *
 * If you have the "Cannot find name 'defineAppConfig'.ts(2304)" error
 * update the root tsconfig.json file to include the following:
 *
 *  "extends": "./.app/.nuxt/tsconfig.json"
 *
 */

export default defineAppConfig({
  tairo: {
    title: 'CitizenOne',
    collapse: {
      circularMenu: {
        enabled: false,
        tools: [],
      },
      toolbar: {
        enabled: true,
        showTitle: true,
        showNavBurger: true,
        tools: [
          {
            component: 'ToolbarThemeToggle',
            props: {
              disableTransitions: true,
            },
          },
          // {
          //   component: 'ToolbarLanguage',
          // },
          {
            component: 'ToolbarAccountMenu',
          },
        ],
      },
      navigation: {
        enabled: true,
        header: {
          component: 'CollapseNavigationHeader',
        },
        footer: {
          component: 'CollapseNavigationFooter',
        },
        items: [
          {
            name: 'Dashboard',
            icon: { name: 'ph:sidebar-duotone', class: 'w-5 h-5' },
            to: '/dashboard',
          },
          {
            name: 'Citizens',
            icon: { name: 'ph:sidebar-duotone', class: 'w-5 h-5' },
            to: '/citizens',
          },
        ]
      }
    },
    // panels: [
    //   {
    //     name: 'language',
    //     position: 'right',
    //     component: 'PanelLanguage',
    //     overlay: true,
    //   },
    // ],
  },
})
