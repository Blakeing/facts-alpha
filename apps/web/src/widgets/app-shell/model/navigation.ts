/**
 * widgets/app-shell/model/navigation.ts
 *
 * Navigation configuration for the app shell
 */

export interface NavigationItem {
  title: string
  icon: string
  to: string
  disabled?: boolean
}

export const navigation: NavigationItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/' },
  { title: 'Cases', icon: 'mdi-folder-open-outline', to: '/cases' },
  { title: 'Calendar', icon: 'mdi-calendar-outline', to: '/calendar', disabled: true },
  { title: 'Contacts', icon: 'mdi-account-group-outline', to: '/contacts', disabled: true },
]

export const secondaryNavigation: NavigationItem[] = [
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings', disabled: true },
  { title: 'Help', icon: 'mdi-help-circle-outline', to: '/help', disabled: true },
]
