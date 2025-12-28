# People Tab Implementation

## Overview

Implemented a comprehensive People management tab for the Contract dialog, consolidating all people-related functionality from the General tab into a dedicated interface. This includes a reusable name component system for editing person information.

## Completed Features

### ContractPeople Component
- **Location**: `apps/web/src/features/contract-dialog/ui/ContractPeople.vue`
- **Features**:
  - Vertical tabs for person selection (buyer, beneficiary, co-buyers, etc.)
  - Full NamePanel integration for inline editing
  - NameEditorDialog for modal editing
  - Add person functionality (co-buyer, additional beneficiary, generic person)
  - Remove person functionality with permissions
  - Change person role functionality (draft contracts only)
  - Permission-based UI (read-only for executed/finalized contracts)
  - Empty state handling
  - Safe initialization with defensive checks

### Name Component System
- **Location**: `apps/web/src/entities/name/ui/`
- **Components Created**:
  - `NamePanel.vue` - Composite component orchestrating all name parts
  - `NameEditorDialog.vue` - Full-screen dialog for modal editing
  - `NamePartGroup.vue` - Grouping component with label and actions slot
  - `NamePartName.vue` - Basic name fields (prefix, first, middle, last, suffix)
  - `NamePartAddresses.vue` - Physical and mailing addresses
  - `NamePartAddress.vue` - Single address editor
  - `NamePartPhones.vue` - Phone numbers list
  - `NamePartEmails.vue` - Email addresses list
  - `NamePartIdentification.vue` - SSN/SIN and driver's license
  - `NamePartDeceased.vue` - Deceased information (weight, condition)
  - `NamePartDemographic.vue` - Ethnicity and race
  - `NamePartMilitary.vue` - Military service information
  - `NamePartRelationships.vue` - Relationships to other people
  - `NamePartRelationship.vue` - Single relationship editor
  - `NamePartMarketing.vue` - Marketing opt-out preference
  - `NamePartDates.vue` - Birth date, death date, age, time of death

### People Handler Enhancements
- **Location**: `apps/web/src/entities/contract/model/handlers/usePeopleHandler.ts`
- **Enhancements**:
  - Added support for additional beneficiaries
  - Added support for generic people (no specific role)
  - Role management (`changePersonRole` function)
  - Display type determination (`getDisplayType` function)
  - `allPeople` computed property aggregating all person types
  - Proper initialization from server data

## Technical Decisions

### Styling
- **All components use Vuetify defaults** - No custom CSS styles
- Uses Vuetify grid system (`v-container`, `v-row`, `v-col`)
- Uses Vuetify utility classes for spacing and layout
- Responsive design with breakpoints

### Prop Mutations
- **Known Issue**: `NamePanel.vue` directly mutates the `model` prop in `addPhone()` and `addEmail()` functions
- **Rationale**: The Name model is designed to be mutable - parent components manage the lifecycle and expect direct mutations
- **Status**: Documented with comments, linter warnings are expected and acceptable for this design pattern

### Array Safety
- All components include defensive checks for missing arrays
- Arrays are initialized if missing before rendering
- Safe accessors with fallbacks (`?? []`)

## Integration Points

### ContractDialog
- Added "People" tab to sidebar navigation
- Integrated ContractPeople component
- Passes session properties correctly (`hasDraftStatus` instead of `isDraft`, `locationId` instead of `locationType`)

### ContractGeneral
- Removed primary buyer/beneficiary forms (now handled in People tab)

## Known Limitations / TODOs

1. **Location Type Detection**: `canHaveAdditionalBeneficiaries` currently returns `true` for all - needs proper location type lookup (cemetery vs funeral)
2. **Relationship Management**: Relationship selection UI exists but backend integration may be incomplete
3. **Confirmation Dialogs**: Remove person uses browser `confirm()` - should use `FConfirmDialog`
4. **Error Handling**: Some error cases show TODO comments for toast notifications

## Files Modified

### New Files
- `apps/web/src/entities/name/ui/NamePanel.vue`
- `apps/web/src/entities/name/ui/NameEditorDialog.vue`
- `apps/web/src/entities/name/ui/NamePartGroup.vue`
- `apps/web/src/entities/name/ui/NamePartName.vue`
- `apps/web/src/entities/name/ui/NamePartAddresses.vue`
- `apps/web/src/entities/name/ui/NamePartAddress.vue`
- `apps/web/src/entities/name/ui/NamePartPhones.vue`
- `apps/web/src/entities/name/ui/NamePartEmails.vue`
- `apps/web/src/entities/name/ui/NamePartIdentification.vue`
- `apps/web/src/entities/name/ui/NamePartDeceased.vue`
- `apps/web/src/entities/name/ui/NamePartDemographic.vue`
- `apps/web/src/entities/name/ui/NamePartMilitary.vue`
- `apps/web/src/entities/name/ui/NamePartRelationships.vue`
- `apps/web/src/entities/name/ui/NamePartRelationship.vue`
- `apps/web/src/entities/name/ui/NamePartMarketing.vue`
- `apps/web/src/entities/name/ui/NamePartDates.vue`
- `apps/web/src/features/contract-dialog/ui/ContractPeople.vue`

### Modified Files
- `apps/web/src/features/contract-dialog/ui/ContractDialog.vue` - Added People tab
- `apps/web/src/features/contract-dialog/ui/ContractGeneral.vue` - Removed buyer/beneficiary forms
- `apps/web/src/entities/contract/model/handlers/usePeopleHandler.ts` - Enhanced with additional person types and role management
- `apps/web/src/entities/name/ui/index.ts` - Added exports for all new components

## Testing Notes

- People tab renders correctly
- All person types display in tabs
- NamePanel shows all fields correctly
- Edit dialog opens and saves correctly
- Add/remove/change role functionality works
- Permissions respected (read-only for executed contracts)
- Empty states handled gracefully

## Next Steps (Future Work)

1. Implement proper location type detection for additional beneficiaries
2. Complete relationship management backend integration
3. Replace browser `confirm()` with `FConfirmDialog`
4. Add toast notifications for errors
5. Add validation for required fields (beneficiary name)
6. Enhance read-only display for executed contracts
7. Add bulk operations (add multiple people at once)
8. Add person search/filter within the people list

