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
  { title: 'Contracts', icon: 'mdi-file-document-outline', to: '/contracts' },
  { title: 'Locations', icon: 'mdi-map-marker-outline', to: '/locations' },
  { title: 'Calendar', icon: 'mdi-calendar-outline', to: '/calendar', disabled: true },
  { title: 'Contacts', icon: 'mdi-account-group-outline', to: '/contacts', disabled: true },
]

export const secondaryNavigation: NavigationItem[] = [
  { title: 'Components', icon: 'mdi-palette-outline', to: '/components' },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings', disabled: true },
  { title: 'Help', icon: 'mdi-help-circle-outline', to: '/help', disabled: true },
]
