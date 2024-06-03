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
            icon: { name: 'mdi:view-dashboard', class: 'w-5 h-5' },
            to: '/dashboard',
          },
          {
            name: 'Citizens',
            icon: { name: 'pepicons-pencil:people', class: 'w-5 h-5' },
            to: '/citizens',
          },
          {
            name: 'Calendar',
            icon: { name: 'mdi:calendar', class: 'w-5 h-5' },
            to: '/calendar',
          },
          {
            name: 'Duty Schedule',
            icon: { name: 'mdi:calendar-clock', class: 'w-5 h-5' },
            to: '/schedules',
          },
          {
            name: 'Employees',
            icon: { name: 'f7:person-3-fill', class: 'w-5 h-5' },
            to: '/employees',
          },
          {
            name: 'Messages',
            icon: { name: 'mdi:chat', class: 'w-5 h-5' },
            to: '/messages',
          },
          {
            name: 'Protocols',
            icon: { name: 'ic:outline-shield', class: 'w-5 h-5' },
            to: '/protocols',
          },
          {
            name: 'Apps',
            icon: { name: 'ic:baseline-apps', class: 'w-5 h-5' },
            to: '/apps',
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
