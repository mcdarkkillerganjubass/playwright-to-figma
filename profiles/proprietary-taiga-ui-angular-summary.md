# Сводка маппинга Proprietary Taiga UI Angular → Figma

Профиль: `proprietary-taiga-ui-angular`. Пакеты: `@taiga-ui/cdk@4.109.0`, `@taiga-ui/core@4.109.0`, `@taiga-ui/design-tokens@0.332.0`, `@taiga-ui/event-plugins@4.7.0`, `@taiga-ui/experimental@4.109.0`, `@taiga-ui/font-watcher@0.3.0`, `@taiga-ui/i18n@4.109.0`, `@taiga-ui/icons@4.109.0`, `@taiga-ui/kit@4.109.0`, `@taiga-ui/layout@4.109.0`, `@taiga-ui/legacy@4.109.0`, `@taiga-ui/polymorpheus@4.10.0`, `@taiga-ui/proprietary@4.109.0`, `@taiga-ui/styles@4.109.0`, `@taiga-ui/tds-fonts@0.332.0`, `@taiga-ui/tds-icons@0.326.0`. Пакеты `@taiga-ui/addon-*` исключены.

Область Figma: TUI Desktop, TUI Assets и TUI Foundations. Nitro-компоненты и другие библиотеки сюда не входят.

## Главное

| Категория | Найдено в коде | Есть точная пара | Без точной пары |
| --- | --- | --- | --- |
| Визуальные Angular-компоненты и директивы | 219 | 78 | 141 |
| Иконки | 7950 | 3231 | 4719 |
| Токены, включая типографику | 840 | 195 | 645 |

«Точная пара» означает либо ручную проверку на реальном макете, либо единственное точное совпадение имени в выбранных Figma-библиотеках. Совпадение имени ещё не является визуальной проверкой всех вариантов.

Если пара не найдена или неоднозначна, экран продолжает рендериться нативными слоями по измеренным DOM-параметрам. Компонент Figma не подставляется, а literal-значения цвета и типографики сохраняются.

## Проверенные вручную соответствия

| Тип | В коде | В Figma | Библиотека |
| --- | --- | --- | --- |
| components | `tuiButton` | tui-button | TUI Desktop |
| icons | `@tui.pragmatic.small.chevron-down` | tui-ic-small-pragmatic / chevron-down | TUI Assets |
| icons | `@tui.pragmatic.small.plus` | tui-ic-small-pragmatic / plus | TUI Assets |
| icons | `@tui.pragmatic.small.settings` | tui-ic-small-pragmatic / settings | TUI Assets |
| tokens | `--tui-background-base` | Background/Base | TUI Foundations |
| tokens | `--tui-background-neutral-1-opaque` | Background/Neutral 1 Opaque | TUI Foundations |
| tokens | `--tui-border-normal` | Border/Normal | TUI Foundations |
| tokens | `--tui-text-action` | Text/Action | TUI Foundations |
| tokens | `--tui-text-primary` | Text/Primary | TUI Foundations |
| tokens | `--tui-text-secondary` | Text/Secondary | TUI Foundations |
| textStyles | `--tui-typography-body-m` | Desktop/Body M | TUI Desktop |
| textStyles | `--tui-typography-body-m-bold` | Desktop/Body M Bold | TUI Desktop |
| textStyles | `--tui-typography-body-s` | Desktop/Body S | TUI Desktop |
| textStyles | `--tui-typography-ui-s` | Desktop/UI S | TUI Desktop |

## Компоненты: удалось сопоставить 78 из 219

| Angular identity | Символ | Компонент Figma | Основание |
| --- | --- | --- | --- |
| `@taiga-ui/core:TuiButton` | TuiButton | tui-button | точное совпадение имени |
| `@taiga-ui/core:TuiCalendar` | TuiCalendar | tui-calendar | точное совпадение имени |
| `@taiga-ui/core:TuiDropdownComponent` | TuiDropdownComponent | tui-dropdown | точное совпадение имени |
| `@taiga-ui/core:TuiDropdownDirective` | TuiDropdownDirective | tui-dropdown | точное совпадение имени |
| `@taiga-ui/core:TuiLink` | TuiLink | tui-link | точное совпадение имени |
| `@taiga-ui/core:TuiLoader` | TuiLoader | tui-loader | точное совпадение имени |
| `@taiga-ui/core:TuiScrollbar` | TuiScrollbar | tui-scrollbar | точное совпадение имени |
| `@taiga-ui/core:TuiScrollbarDirective` | TuiScrollbarDirective | tui-scrollbar | точное совпадение имени |
| `@taiga-ui/core:TuiSurface` | TuiSurface | tui-surface | точное совпадение имени |
| `@taiga-ui/kit:TuiAvatar` | TuiAvatar | tui-avatar | точное совпадение имени |
| `@taiga-ui/kit:TuiAvatarStack` | TuiAvatarStack | tui-avatar-stack | точное совпадение имени |
| `@taiga-ui/kit:TuiBadge` | TuiBadge | tui-badge | точное совпадение имени |
| `@taiga-ui/kit:TuiBadgedContentComponent` | TuiBadgedContentComponent | tui-badged-content | точное совпадение имени |
| `@taiga-ui/kit:TuiBadgedContentDirective` | TuiBadgedContentDirective | tui-badged-content | точное совпадение имени |
| `@taiga-ui/kit:TuiBreadcrumbs` | TuiBreadcrumbs | tui-breadcrumbs | точное совпадение имени |
| `@taiga-ui/kit:TuiCheckbox` | TuiCheckbox | tui-checkbox | точное совпадение имени |
| `@taiga-ui/kit:TuiChip` | TuiChip | tui-chip | точное совпадение имени |
| `@taiga-ui/kit:TuiCopyComponent` | TuiCopyComponent | tui-copy | точное совпадение имени |
| `@taiga-ui/kit:TuiCopyDirective` | TuiCopyDirective | tui-copy | точное совпадение имени |
| `@taiga-ui/kit:TuiCounter` | TuiCounter | tui-counter | точное совпадение имени |
| `@taiga-ui/kit:TuiFile` | TuiFile | tui-file | точное совпадение имени |
| `@taiga-ui/kit:TuiInputFiles` | TuiInputFiles | tui-input-files | точное совпадение имени |
| `@taiga-ui/kit:TuiInputFilesDirective` | TuiInputFilesDirective | tui-input-files | точное совпадение имени |
| `@taiga-ui/kit:TuiInputNumberDirective` | TuiInputNumberDirective | tui-input-number | точное совпадение имени |
| `@taiga-ui/kit:TuiInputPassword` | TuiInputPassword | tui-input-password | точное совпадение имени |
| `@taiga-ui/kit:TuiInputRangeComponent` | TuiInputRangeComponent | tui-input-range | точное совпадение имени |
| `@taiga-ui/kit:TuiInputSliderDirective` | TuiInputSliderDirective | tui-input-slider | точное совпадение имени |
| `@taiga-ui/kit:TuiInputTimeComponent` | TuiInputTimeComponent | tui-input-time | точное совпадение имени |
| `@taiga-ui/kit:TuiInputTimeDirective` | TuiInputTimeDirective | tui-input-time | точное совпадение имени |
| `@taiga-ui/kit:TuiNotificationMiddle` | TuiNotificationMiddle | tui-notification-middle | точное совпадение имени |
| `@taiga-ui/kit:TuiNotificationMiddleComponent` | TuiNotificationMiddleComponent | tui-notification-middle | точное совпадение имени |
| `@taiga-ui/kit:TuiPager` | TuiPager | tui-pager | точное совпадение имени |
| `@taiga-ui/kit:TuiPagination` | TuiPagination | tui-pagination | точное совпадение имени |
| `@taiga-ui/kit:TuiPin` | TuiPin | tui-pin | точное совпадение имени |
| `@taiga-ui/kit:TuiProgressBar` | TuiProgressBar | tui-progress-bar | точное совпадение имени |
| `@taiga-ui/kit:TuiProgressCircle` | TuiProgressCircle | tui-progress-circle | точное совпадение имени |
| `@taiga-ui/kit:TuiPushComponent` | TuiPushComponent | tui-push | точное совпадение имени |
| `@taiga-ui/kit:TuiPushDirective` | TuiPushDirective | tui-push | точное совпадение имени |
| `@taiga-ui/kit:TuiRange` | TuiRange | tui-range | точное совпадение имени |
| `@taiga-ui/kit:TuiRating` | TuiRating | tui-rating | точное совпадение имени |
| `@taiga-ui/kit:TuiSegmented` | TuiSegmented | tui-segmented | точное совпадение имени |
| `@taiga-ui/kit:TuiSkeleton` | TuiSkeleton | tui-skeleton | точное совпадение имени |
| `@taiga-ui/kit:TuiSliderComponent` | TuiSliderComponent | tui-slider | точное совпадение имени |
| `@taiga-ui/kit:TuiStep` | TuiStep | tui-step | точное совпадение имени |
| `@taiga-ui/kit:TuiStepperComponent` | TuiStepperComponent | tui-stepper | точное совпадение имени |
| `@taiga-ui/kit:TuiTab` | TuiTab | tui-tab | точное совпадение имени |
| `@taiga-ui/kit:TuiTextarea` | TuiTextarea | tui-textarea | точное совпадение имени |
| `@taiga-ui/kit:TuiTooltip` | TuiTooltip | tui-tooltip | точное совпадение имени |
| `@taiga-ui/layout:TuiAppBarComponent` | TuiAppBarComponent | tui-app-bar | точное совпадение имени |
| `@taiga-ui/layout:TuiAppBarDirective` | TuiAppBarDirective | tui-app-bar | точное совпадение имени |
| `@taiga-ui/layout:TuiBlockDetails` | TuiBlockDetails | tui-block-details | точное совпадение имени |
| `@taiga-ui/layout:TuiBlockStatusComponent` | TuiBlockStatusComponent | tui-block-status | точное совпадение имени |
| `@taiga-ui/layout:TuiBlockStatusDirective` | TuiBlockStatusDirective | tui-block-status | точное совпадение имени |
| `@taiga-ui/layout:TuiCardLarge` | TuiCardLarge | tui-card-large | точное совпадение имени |
| `@taiga-ui/layout:TuiCardMedium` | TuiCardMedium | tui-card-medium  | точное совпадение имени |
| `@taiga-ui/layout:TuiCell` | TuiCell | tui-cell | точное совпадение имени |
| `@taiga-ui/layout:TuiHeader` | TuiHeader | tui-header | точное совпадение имени |
| `@taiga-ui/layout:TuiHeaderComponent` | TuiHeaderComponent | tui-header | точное совпадение имени |
| `@taiga-ui/layout:TuiInputSearch` | TuiInputSearch | tui-input-search | точное совпадение имени |
| `@taiga-ui/layout:TuiList` | TuiList | tui-list | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputComponent` | TuiInputComponent | tui-input | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputDirective` | TuiInputDirective | tui-input | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputNumberComponent` | TuiInputNumberComponent | tui-input-number | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputNumberDirective` | TuiInputNumberDirective | tui-input-number | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputPasswordComponent` | TuiInputPasswordComponent | tui-input-password | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputPasswordDirective` | TuiInputPasswordDirective | tui-input-password | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputRangeComponent` | TuiInputRangeComponent | tui-input-range | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputSliderComponent` | TuiInputSliderComponent | tui-input-slider | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputTimeComponent` | TuiInputTimeComponent | tui-input-time | точное совпадение имени |
| `@taiga-ui/legacy:TuiInputTimeDirective` | TuiInputTimeDirective | tui-input-time | точное совпадение имени |
| `@taiga-ui/legacy:TuiSelectDirective` | TuiSelectDirective | tui-select | точное совпадение имени |
| `@taiga-ui/legacy:TuiTextareaComponent` | TuiTextareaComponent | tui-textarea | точное совпадение имени |
| `@taiga-ui/legacy:TuiTextareaDirective` | TuiTextareaDirective | tui-textarea | точное совпадение имени |
| `@taiga-ui/proprietary:TuiBack` | TuiBack | tui-back | точное совпадение имени |
| `@taiga-ui/proprietary:TuiConfirmation` | TuiConfirmation | tui-confirmation | точное совпадение имени |
| `@taiga-ui/proprietary:TuiNavigationComponent` | TuiNavigationComponent | tui-navigation | точное совпадение имени |
| `@taiga-ui/proprietary:TuiOnboardingFlowComponent` | TuiOnboardingFlowComponent | tui-onboarding-flow | точное совпадение имени |
| `@taiga-ui/proprietary:TuiPanel` | TuiPanel | tui-panel | точное совпадение имени |

## Компоненты: не удалось сопоставить 141

Служебные и невизуальные директивы сюда не включены. Для перечисленных визуальных компонентов в выбранных библиотеках нет единственного точного совпадения имени.

| Angular identity | Символ | Селекторы |
| --- | --- | --- |
| `@taiga-ui/core:TuiAlerts` | TuiAlerts | tui-alerts |
| `@taiga-ui/core:TuiCalendarSheet` | TuiCalendarSheet | tui-calendar-sheet |
| `@taiga-ui/core:TuiCalendarSpin` | TuiCalendarSpin | tui-calendar-spin |
| `@taiga-ui/core:TuiCalendarYear` | TuiCalendarYear | tui-calendar-year |
| `@taiga-ui/core:TuiDialogs` | TuiDialogs | tui-dialogs |
| `@taiga-ui/core:TuiDropdowns` | TuiDropdowns | tui-dropdowns |
| `@taiga-ui/core:TuiError` | TuiError | tui-error |
| `@taiga-ui/core:TuiExpandComponent` | TuiExpandComponent | tui-expand |
| `@taiga-ui/core:TuiFullscreen` | TuiFullscreen | [tuiFullscreen] |
| `@taiga-ui/core:TuiHintUnstyledComponent` | TuiHintUnstyledComponent | ng-component |
| `@taiga-ui/core:TuiHints` | TuiHints | tui-hints |
| `@taiga-ui/core:TuiIcon` | TuiIcon | tui-icon |
| `@taiga-ui/core:TuiPopups` | TuiPopups | tui-popups |
| `@taiga-ui/core:TuiRoot` | TuiRoot | tui-root |
| `@taiga-ui/core:TuiScrollControls` | TuiScrollControls | tui-scroll-controls |
| `@taiga-ui/core:TuiSpinButton` | TuiSpinButton | tui-spin-button |
| `@taiga-ui/experimental:TuiAccordionComponent` | TuiAccordionComponent | tui-accordion |
| `@taiga-ui/experimental:TuiExpand` | TuiExpand | tui-expand |
| `@taiga-ui/experimental:TuiInputPhoneInternational` | TuiInputPhoneInternational | input[tuiInputPhoneInternational] |
| `@taiga-ui/experimental:TuiSearchHistory` | TuiSearchHistory | tui-search-history |
| `@taiga-ui/kit:TuiAccordionItem` | TuiAccordionItem | tui-accordion-item |
| `@taiga-ui/kit:TuiActionBarComponent` | TuiActionBarComponent | tui-action-bar |
| `@taiga-ui/kit:TuiAvatarLabeled` | TuiAvatarLabeled | tui-avatar-labeled |
| `@taiga-ui/kit:TuiBadgeNotification` | TuiBadgeNotification | tui-badge-notification |
| `@taiga-ui/kit:TuiButtonCopyComponent` | TuiButtonCopyComponent | [tuiButtonCopy] |
| `@taiga-ui/kit:TuiButtonLoading` | TuiButtonLoading | [tuiButton][loading],[tuiIconButton][loading] |
| `@taiga-ui/kit:TuiCalendarMonth` | TuiCalendarMonth | tui-calendar-month |
| `@taiga-ui/kit:TuiCalendarRange` | TuiCalendarRange | tui-calendar-range |
| `@taiga-ui/kit:TuiCarouselComponent` | TuiCarouselComponent | tui-carousel |
| `@taiga-ui/kit:TuiCompass` | TuiCompass | tui-compass |
| `@taiga-ui/kit:TuiConfirm` | TuiConfirm | tui-confirm |
| `@taiga-ui/kit:TuiDrawer` | TuiDrawer | tui-drawer |
| `@taiga-ui/kit:TuiElasticContainer` | TuiElasticContainer | tui-elastic-container |
| `@taiga-ui/kit:TuiFilesComponent` | TuiFilesComponent | tui-files |
| `@taiga-ui/kit:TuiInputColor` | TuiInputColor | input[tuiInputColor] |
| `@taiga-ui/kit:TuiInputDateComponent` | TuiInputDateComponent | input[tuiInputDate][type=\ |
| `@taiga-ui/kit:TuiInputDateTimeComponent` | TuiInputDateTimeComponent | input[tuiInputDateTime][type=\ |
| `@taiga-ui/kit:TuiInputFilesContent` | TuiInputFilesContent | ng-component |
| `@taiga-ui/kit:TuiInputInline` | TuiInputInline | tui-input-inline |
| `@taiga-ui/kit:TuiInputMonthComponent` | TuiInputMonthComponent | input[tuiInputMonth][type=\ |
| `@taiga-ui/kit:TuiInputNumberStep` | TuiInputNumberStep | input[tuiInputNumber][step] |
| `@taiga-ui/kit:TuiInputPhoneInternational` | TuiInputPhoneInternational | tui-input-phone-international |
| `@taiga-ui/kit:TuiInputPin` | TuiInputPin | input[tuiInputPin] |
| `@taiga-ui/kit:TuiItemsWithMoreComponent` | TuiItemsWithMoreComponent | tui-items-with-more |
| `@taiga-ui/kit:TuiLike` | TuiLike | input[tuiLike][type=checkbox] |
| `@taiga-ui/kit:TuiLineClamp` | TuiLineClamp | tui-line-clamp |
| `@taiga-ui/kit:TuiLineClampBox` | TuiLineClampBox | tui-line-clamp-box |
| `@taiga-ui/kit:TuiPreviewComponent` | TuiPreviewComponent | tui-preview |
| `@taiga-ui/kit:TuiPreviewDialog` | TuiPreviewDialog | tui-preview-dialog |
| `@taiga-ui/kit:TuiPreviewPagination` | TuiPreviewPagination | tui-preview-pagination |
| `@taiga-ui/kit:TuiPreviewTitle` | TuiPreviewTitle | tui-preview-title |
| `@taiga-ui/kit:TuiPreviewZoom` | TuiPreviewZoom | tui-preview-zoom |
| `@taiga-ui/kit:TuiProgressLabel` | TuiProgressLabel | label[tuiProgressLabel] |
| `@taiga-ui/kit:TuiPulse` | TuiPulse | tui-pulse |
| `@taiga-ui/kit:TuiPushAlert` | TuiPushAlert | ng-component |
| `@taiga-ui/kit:TuiRadioComponent` | TuiRadioComponent | input[type=\ |
| `@taiga-ui/kit:TuiRoutableDialog` | TuiRoutableDialog | tui-routable-dialog |
| `@taiga-ui/kit:TuiShrinkWrapComponent` | TuiShrinkWrapComponent | tui-shrink-wrap |
| `@taiga-ui/kit:TuiSliderThumbLabel` | TuiSliderThumbLabel | [tuiSliderThumbLabel] |
| `@taiga-ui/kit:TuiSwitch` | TuiSwitch | input[type=\ |
| `@taiga-ui/kit:TuiTabsWithMore` | TuiTabsWithMore | tui-tabs-with-more, nav[tuiTabsWithMore] |
| `@taiga-ui/kit:TuiTextareaCounterComponent` | TuiTextareaCounterComponent | ng-component |
| `@taiga-ui/kit:TuiTextareaLimitComponent` | TuiTextareaLimitComponent | ng-component |
| `@taiga-ui/kit:TuiTile` | TuiTile | tui-tile |
| `@taiga-ui/kit:TuiTilesComponent` | TuiTilesComponent | tui-tiles |
| `@taiga-ui/kit:TuiTreeItem` | TuiTreeItem | tui-tree-item |
| `@taiga-ui/kit:TuiTreeItemContent` | TuiTreeItemContent | ng-component |
| `@taiga-ui/layout:TuiAppBarBack` | TuiAppBarBack | button[tuiAppBarBack], a[tuiAppBarBack] |
| `@taiga-ui/layout:TuiAsideComponent` | TuiAsideComponent | aside[tuiNavigationAside] |
| `@taiga-ui/layout:TuiAsideGroupComponent` | TuiAsideGroupComponent | tui-aside-group |
| `@taiga-ui/layout:TuiDrawerDirective` | TuiDrawerDirective | [tuiIconButton][tuiNavigationDrawer] |
| `@taiga-ui/layout:TuiDynamicHeaderComponent` | TuiDynamicHeaderComponent | [tuiDynamicHeader] |
| `@taiga-ui/layout:TuiLogoComponent` | TuiLogoComponent | [tuiNavigationLogo] |
| `@taiga-ui/layout:TuiMainComponent` | TuiMainComponent | main[tuiNavigationMain] |
| `@taiga-ui/layout:TuiNavComponent` | TuiNavComponent | nav[tuiNavigationNav] |
| `@taiga-ui/layout:TuiProgressiveBlur` | TuiProgressiveBlur | tui-progressive-blur |
| `@taiga-ui/layout:TuiSearchComponent` | TuiSearchComponent | search[tuiSearch] |
| `@taiga-ui/layout:TuiSearchFilterComponent` | TuiSearchFilterComponent | button[tuiSearchFilter] |
| `@taiga-ui/layout:TuiSearchFiltersComponent` | TuiSearchFiltersComponent | tui-search-filters |
| `@taiga-ui/layout:TuiSubheaderCompactComponent` | TuiSubheaderCompactComponent | [tuiSubheader][compact],[tuiNavigationSubheader][compact] |
| `@taiga-ui/layout:TuiSubheaderComponent` | TuiSubheaderComponent | [tuiSubheader]:not([compact]),[tuiNavigationSubheader]:not([compact]) |
| `@taiga-ui/legacy:TuiArrowComponent` | TuiArrowComponent | tui-arrow |
| `@taiga-ui/legacy:TuiColorEditComponent` | TuiColorEditComponent | tui-color-edit |
| `@taiga-ui/legacy:TuiColorPickerComponent` | TuiColorPickerComponent | tui-color-picker |
| `@taiga-ui/legacy:TuiColorSelectorComponent` | TuiColorSelectorComponent | tui-color-selector |
| `@taiga-ui/legacy:TuiFlatPickerComponent` | TuiFlatPickerComponent | tui-flat-picker |
| `@taiga-ui/legacy:TuiInputColorComponent` | TuiInputColorComponent | tui-input-color |
| `@taiga-ui/legacy:TuiInputCopyComponent` | TuiInputCopyComponent | tui-input-copy |
| `@taiga-ui/legacy:TuiInputDateComponent` | TuiInputDateComponent | tui-input-date:not([multiple]) |
| `@taiga-ui/legacy:TuiInputDateMultiComponent` | TuiInputDateMultiComponent | tui-input-date[multiple] |
| `@taiga-ui/legacy:TuiInputDateRangeComponent` | TuiInputDateRangeComponent | tui-input-date-range |
| `@taiga-ui/legacy:TuiInputDateTimeComponent` | TuiInputDateTimeComponent | tui-input-date-time |
| `@taiga-ui/legacy:TuiInputMonthComponent` | TuiInputMonthComponent | tui-input-month |
| `@taiga-ui/legacy:TuiInputMonthRangeComponent` | TuiInputMonthRangeComponent | tui-input-month-range |
| `@taiga-ui/legacy:TuiInputPhoneComponent` | TuiInputPhoneComponent | tui-input-phone |
| `@taiga-ui/legacy:TuiInputPhoneInternationalComponent` | TuiInputPhoneInternationalComponent | tui-input-phone-international |
| `@taiga-ui/legacy:TuiInputTagComponent` | TuiInputTagComponent | tui-input-tag |
| `@taiga-ui/legacy:TuiInputYearComponent` | TuiInputYearComponent | tui-input-year |
| `@taiga-ui/legacy:TuiLinearMultiPickerComponent` | TuiLinearMultiPickerComponent | tui-linear-multi-picker |
| `@taiga-ui/legacy:TuiLinearPickerComponent` | TuiLinearPickerComponent | tui-linear-picker |
| `@taiga-ui/legacy:TuiNativeTimeComponent` | TuiNativeTimeComponent | input[tuiTime] |
| `@taiga-ui/legacy:TuiPaletteComponent` | TuiPaletteComponent | tui-palette |
| `@taiga-ui/legacy:TuiPrimitiveTextfieldComponent` | TuiPrimitiveTextfieldComponent | tui-primitive-textfield |
| `@taiga-ui/legacy:TuiSheetBarComponent` | TuiSheetBarComponent | tui-sheet-bar |
| `@taiga-ui/legacy:TuiSheetHeadingComponent` | TuiSheetHeadingComponent | [tuiSheetHeading] |
| `@taiga-ui/legacy:TuiSheetsHostComponent` | TuiSheetsHostComponent | tui-sheets-host |
| `@taiga-ui/legacy:TuiSvgComponent` | TuiSvgComponent | tui-svg |
| `@taiga-ui/legacy:TuiTableBarComponent` | TuiTableBarComponent | tui-table-bar |
| `@taiga-ui/legacy:TuiTableBarsHostComponent` | TuiTableBarsHostComponent | tui-table-bars-host |
| `@taiga-ui/legacy:TuiTagComponent` | TuiTagComponent | tui-tag, a[tuiTag], button[tuiTag] |
| `@taiga-ui/legacy:TuiTextfieldComponent` | TuiTextfieldComponent | input[tuiTextfieldLegacy], textarea[tuiTextfieldLegacy] |
| `@taiga-ui/legacy:TuiValueDecorationComponent` | TuiValueDecorationComponent | tui-value-decoration |
| `@taiga-ui/proprietary:TuiBeaverDrawer` | TuiBeaverDrawer | tui-beaver-drawer |
| `@taiga-ui/proprietary:TuiConfirmDialog` | TuiConfirmDialog | tui-confirm-dialog |
| `@taiga-ui/proprietary:TuiConfirmationHintComponent` | TuiConfirmationHintComponent | tui-confirmation-hint |
| `@taiga-ui/proprietary:TuiErrorDialog` | TuiErrorDialog | tui-error-dialog |
| `@taiga-ui/proprietary:TuiErrorDialogHeader` | TuiErrorDialogHeader | tui-error-dialog-header |
| `@taiga-ui/proprietary:TuiErrorPage` | TuiErrorPage | tui-error-page |
| `@taiga-ui/proprietary:TuiFeedItemAction` | TuiFeedItemAction | a[tuiFeedItemAction],button[tuiFeedItemAction] |
| `@taiga-ui/proprietary:TuiFeedItemDetails` | TuiFeedItemDetails | tui-feed-item-details |
| `@taiga-ui/proprietary:TuiFeedItemDialog` | TuiFeedItemDialog | tui-feed-item-dialog |
| `@taiga-ui/proprietary:TuiIllustrationScreenComponent` | TuiIllustrationScreenComponent | tui-illustration-screen |
| `@taiga-ui/proprietary:TuiLoginComponent` | TuiLoginComponent | tui-login |
| `@taiga-ui/proprietary:TuiLogoComponent` | TuiLogoComponent | tui-logo |
| `@taiga-ui/proprietary:TuiMobileMenuComponent` | TuiMobileMenuComponent | tui-mobile-menu |
| `@taiga-ui/proprietary:TuiMobileProductsComponent` | TuiMobileProductsComponent | button[tuiMobileProducts] |
| `@taiga-ui/proprietary:TuiOnboardingStepComponent` | TuiOnboardingStepComponent | tui-onboarding-step |
| `@taiga-ui/proprietary:TuiPanelDesktopComponent` | TuiPanelDesktopComponent | tui-panel-desktop |
| `@taiga-ui/proprietary:TuiPanelMobile` | TuiPanelMobile | tui-panel-mobile |
| `@taiga-ui/proprietary:TuiProductMenuButton` | TuiProductMenuButton | tui-product-menu-button |
| `@taiga-ui/proprietary:TuiProductMenuComponent` | TuiProductMenuComponent | tui-product-menu |
| `@taiga-ui/proprietary:TuiProfileIconComponent` | TuiProfileIconComponent | tui-profile-icon |
| `@taiga-ui/proprietary:TuiProfileMenuComponent` | TuiProfileMenuComponent | tui-profile-menu |
| `@taiga-ui/proprietary:TuiSideMenuComponent` | TuiSideMenuComponent | nav[tuiSideMenu] |
| `@taiga-ui/proprietary:TuiSubscriptionBadge` | TuiSubscriptionBadge | tui-subscription-badge |
| `@taiga-ui/proprietary:TuiTimecode` | TuiTimecode | tui-timecode |
| `@taiga-ui/proprietary:TuiTimecodePlayer` | TuiTimecodePlayer | tui-timecode-player |
| `@taiga-ui/proprietary:TuiTimecodeProgress` | TuiTimecodeProgress | tui-timecode-progress |
| `@taiga-ui/proprietary:TuiTimelineStepComponent` | TuiTimelineStepComponent | tui-timeline-step |
| `@taiga-ui/proprietary:TuiTimelineStepsComponent` | TuiTimelineStepsComponent | tui-timeline-steps |
| `@taiga-ui/proprietary:TuiUserMenuComponent` | TuiUserMenuComponent | tui-user-menu |

## Иконки по семействам

| Семейство | В коде | Сопоставлено | Без пары |
| --- | --- | --- | --- |
| @tui.common-without-ds-namespace | 3923 | 143 | 3780 |
| @tui.fancy.medium | 924 | 898 | 26 |
| @tui.illustrations.common | 554 | 538 | 16 |
| @tui.flags | 514 | 260 | 254 |
| @tui.pragmatic.small | 473 | 358 | 115 |
| @tui.pragmatic.medium | 460 | 354 | 106 |
| @tui.fancy.small | 290 | 199 | 91 |
| @tui.solid.medium | 166 | 0 | 166 |
| @tui.solid.small | 146 | 0 | 146 |
| @tui.illustrations.sme | 134 | 134 | 0 |
| @tui.illustrations.invest | 112 | 110 | 2 |
| @tui.illustrations.mvno | 70 | 70 | 0 |
| @tui.emoji | 68 | 68 | 0 |
| @tui.logo.square | 55 | 49 | 6 |
| @tui.service | 35 | 32 | 3 |
| @tui.logo.siteheader | 17 | 9 | 8 |
| @tui.fixed.color | 7 | 7 | 0 |
| @tui.illustrations.insurance | 2 | 2 | 0 |

Примеры сопоставленных иконок:

| В коде | В Figma | Основание |
| --- | --- | --- |
| `@tui.emoji.bank` | tui-emoji / bank | точное совпадение имени |
| `@tui.emoji.banknote` | tui-emoji / banknote | точное совпадение имени |
| `@tui.emoji.building` | tui-emoji / building | точное совпадение имени |
| `@tui.fancy.medium.air-hockey` | tui-ic-medium / air-hockey | точное совпадение имени |
| `@tui.fancy.medium.airplane` | tui-ic-medium / airplane | точное совпадение имени |
| `@tui.fancy.medium.airplane-2` | tui-ic-medium / airplane-2 | точное совпадение имени |
| `@tui.fancy.small.airplane` | tui-ic-small / airplane | точное совпадение имени |
| `@tui.fancy.small.alert` | tui-ic-small / alert | точное совпадение имени |
| `@tui.fancy.small.alert-circle` | tui-ic-small / alert-circle | точное совпадение имени |
| `@tui.fixed.color.alert-negative` | tui-ic-fixed-color / alert-negative | точное совпадение имени |
| `@tui.fixed.color.alert-warning` | tui-ic-fixed-color / alert-warning | точное совпадение имени |
| `@tui.fixed.color.check-circle-positive` | tui-ic-fixed-color / check-circle-positive | точное совпадение имени |
| `@tui.flags.abh` | tui-flags / ABH | точное совпадение имени |
| `@tui.flags.abw` | tui-flags / ABW | точное совпадение имени |
| `@tui.flags.afg` | tui-flags / AFG | точное совпадение имени |
| `@tui.illustrations.common.alarm-dark` | tui-illustrations-common / Dark / alarm | точное совпадение имени |
| `@tui.illustrations.common.alarm-light` | tui-illustrations-common / Light / alarm | точное совпадение имени |
| `@tui.illustrations.common.barchart-grow-dark` | tui-illustrations-common / Dark / barchart-grow | точное совпадение имени |
| `@tui.illustrations.insurance.phone-car-dark` | tui-illustrations-insurance / Dark / phone-car | точное совпадение имени |
| `@tui.illustrations.insurance.phone-car-light` | tui-illustrations-insurance / Light / phone-car | точное совпадение имени |
| `@tui.illustrations.invest.alert-dark` | tui-illustrations-invest / Dark / alert | точное совпадение имени |
| `@tui.illustrations.invest.alert-light` | tui-illustrations-invest / Light / alert | точное совпадение имени |
| `@tui.illustrations.invest.arrows-up-coins-dark` | tui-illustrations-invest / Dark / arrows-up-coins | точное совпадение имени |
| `@tui.illustrations.mvno.alert-dark` | tui-illustrations-mvno / Dark / alert | точное совпадение имени |
| `@tui.illustrations.mvno.alert-light` | tui-illustrations-mvno / Light / alert | точное совпадение имени |
| `@tui.illustrations.mvno.bell-notification-dark` | tui-illustrations-mvno / Dark / bell-notification | точное совпадение имени |
| `@tui.illustrations.sme.arrows-up-coins-dark` | tui-illustrations-sme / Dark / arrows-up-coins | точное совпадение имени |
| `@tui.illustrations.sme.arrows-up-coins-light` | tui-illustrations-sme / Light / arrows-up-coins | точное совпадение имени |
| `@tui.illustrations.sme.calendar-check-dark` | tui-illustrations-sme / Dark / calendar-check | точное совпадение имени |
| `@tui.logo.payment-maestro` | tui-logo / payment-maestro | точное совпадение имени |
| `@tui.logo.payment-mastercard` | tui-logo / payment-mastercard | точное совпадение имени |
| `@tui.logo.payment-mastercard-gold` | tui-logo / payment-mastercard-gold | точное совпадение имени |
| `@tui.logo.siteheader.t-bank` | tui-logo-siteheader/t-bank | точное совпадение имени |
| `@tui.logo.siteheader.t-bank-eng` | tui-logo-siteheader/t-bank-eng | точное совпадение имени |
| `@tui.logo.siteheader.t-bank-eng-inverse` | tui-logo-siteheader/t-bank-eng-inverse | точное совпадение имени |
| `@tui.logo.square.alfa-bank` | tui-logo-square / alfa-bank | точное совпадение имени |
| `@tui.logo.square.alfa-bank-circle` | tui-logo-square / alfa-bank-circle | точное совпадение имени |
| `@tui.logo.square.android` | tui-logo-square / android | точное совпадение имени |
| `@tui.pragmatic.medium.airplane` | tui-ic-medium-pragmatic / airplane | точное совпадение имени |
| `@tui.pragmatic.medium.alert` | tui-ic-medium-pragmatic / alert | точное совпадение имени |
| `@tui.pragmatic.medium.alert-circle` | tui-ic-medium-pragmatic / alert-circle | точное совпадение имени |
| `@tui.pragmatic.small.airplane` | tui-ic-small-pragmatic / airplane | точное совпадение имени |
| `@tui.pragmatic.small.alert` | tui-ic-small-pragmatic / alert | точное совпадение имени |
| `@tui.pragmatic.small.alert-circle` | tui-ic-small-pragmatic / alert-circle | точное совпадение имени |
| `@tui.service.arrow-down` | tui-ic-service / arrow-down | точное совпадение имени |
| `@tui.service.arrow-down-transfer` | tui-ic-service / arrow-down-transfer | точное совпадение имени |
| `@tui.service.arrow-right` | tui-ic-service / arrow-right | точное совпадение имени |

Полный перечень всех иконок и статусов находится в JSON-профиле; в этот отчёт выведено агрегирование по семействам, чтобы он оставался читаемым.

## Токены по группам

| Группа | В коде | Сопоставлено | Без пары |
| --- | --- | --- | --- |
| const-black | 47 | 0 | 47 |
| const-cool | 33 | 0 | 33 |
| background-neutral | 32 | 11 | 21 |
| const-blue | 32 | 0 | 32 |
| const-white | 30 | 0 | 30 |
| chart-categorical | 28 | 27 | 1 |
| const-yellow | 26 | 0 | 26 |
| const-red | 25 | 0 | 25 |
| const-green | 23 | 0 | 23 |
| support-support | 22 | 0 | 22 |
| background-accent | 19 | 10 | 9 |
| brand-element | 18 | 2 | 16 |
| brand-t | 17 | 5 | 12 |
| brand-tinkoff | 17 | 0 | 17 |
| font-heading | 17 | 0 | 17 |
| font-text | 14 | 0 | 14 |
| service-underline | 14 | 9 | 5 |
| text-primary | 14 | 7 | 7 |
| font-ui | 12 | 0 | 12 |
| typography-ui | 12 | 8 | 4 |
| background-overlay | 11 | 6 | 5 |
| gradient-brand | 11 | 10 | 1 |
| const-gray | 10 | 0 | 10 |
| typography-heading | 10 | 6 | 4 |
| chart-series | 9 | 3 | 6 |
| chart-state | 9 | 9 | 0 |
| status-negative | 9 | 7 | 2 |
| font-body | 8 | 0 | 8 |
| typography-body | 8 | 7 | 1 |
| background-button | 7 | 0 | 7 |
| const-turquoise | 7 | 0 | 7 |
| status-info | 7 | 5 | 2 |
| status-positive | 7 | 5 | 2 |
| status-warning | 7 | 5 | 2 |
| border-normal | 6 | 2 | 4 |
| const-dark | 6 | 0 | 6 |
| font-family | 6 | 0 | 6 |
| font-legacy | 6 | 0 | 6 |
| typography-family | 6 | 0 | 6 |
| typography-legacy | 6 | 0 | 6 |
| background-highlight | 5 | 0 | 5 |
| const-orange | 5 | 0 | 5 |
| const-purple | 5 | 0 | 5 |
| gradient-overlay | 5 | 4 | 1 |
| text-secondary | 5 | 3 | 2 |
| text-tertiary | 5 | 3 | 2 |
| border-on | 4 | 2 | 2 |
| chart-gray | 4 | 0 | 4 |
| component-button | 4 | 2 | 2 |
| font-caps | 4 | 0 | 4 |
| gradient-mask | 4 | 4 | 0 |
| status-neutral | 4 | 3 | 1 |
| text-action | 4 | 3 | 1 |
| typography-caps | 4 | 0 | 4 |
| background-brand | 3 | 0 | 3 |
| background-elevation | 3 | 0 | 3 |
| const-coral | 3 | 0 | 3 |
| const-pink | 3 | 0 | 3 |
| const-sea | 3 | 0 | 3 |
| curve-expressive | 3 | 0 | 3 |
| curve-productive | 3 | 0 | 3 |
| font-numbers | 3 | 0 | 3 |
| foreground-border | 3 | 0 | 3 |
| icon-action | 3 | 0 | 3 |
| service-link | 3 | 0 | 3 |
| text-negative | 3 | 2 | 1 |
| text-positive | 3 | 2 | 1 |
| text-warning | 3 | 2 | 1 |
| typography-numbers | 3 | 2 | 1 |
| background-base | 2 | 1 | 1 |
| background-engaging | 2 | 0 | 2 |
| background-info | 2 | 0 | 2 |
| background-negative | 2 | 0 | 2 |
| background-positive | 2 | 0 | 2 |
| background-primary | 2 | 0 | 2 |
| background-warning | 2 | 0 | 2 |
| border-focus | 2 | 1 | 1 |
| border-selected | 2 | 1 | 1 |
| brand-all | 2 | 0 | 2 |
| brand-premium | 2 | 2 | 0 |
| brand-private | 2 | 1 | 1 |
| brand-pro | 2 | 1 | 1 |
| const-emerald | 2 | 0 | 2 |
| data-list | 2 | 0 | 2 |
| feed-category | 2 | 0 | 2 |
| font-code | 2 | 0 | 2 |
| foreground-on | 2 | 0 | 2 |
| service-skeleton | 2 | 1 | 1 |
| shadow-medium | 2 | 2 | 0 |
| shadow-small | 2 | 2 | 0 |
| text-accent | 2 | 0 | 2 |
| text-engaging | 2 | 0 | 2 |
| typography-code | 2 | 0 | 2 |
| background-badge | 1 | 0 | 1 |
| background-notification | 1 | 0 | 1 |
| background-opposite | 1 | 0 | 1 |
| background-progress | 1 | 0 | 1 |
| background-selected | 1 | 0 | 1 |
| background-thumbnail | 1 | 0 | 1 |
| background-toggle | 1 | 0 | 1 |
| background-tooltip | 1 | 0 | 1 |
| blur | 1 | 0 | 1 |
| border-darkmode | 1 | 0 | 1 |
| border-hover | 1 | 1 | 0 |
| brand-black | 1 | 1 | 0 |
| brand-mir | 1 | 0 | 1 |
| brand-platinum | 1 | 1 | 0 |
| brand-ts | 1 | 1 | 0 |
| component-badge | 1 | 0 | 1 |
| component-input | 1 | 0 | 1 |
| component-progress | 1 | 0 | 1 |
| component-tab | 1 | 0 | 1 |
| component-thumbnail | 1 | 0 | 1 |
| component-tooltip | 1 | 1 | 0 |
| const-clear | 1 | 0 | 1 |
| disabled-opacity | 1 | 0 | 1 |
| duration | 1 | 0 | 1 |
| duration-fast | 1 | 0 | 1 |
| duration-fastest | 1 | 0 | 1 |
| duration-slow | 1 | 0 | 1 |
| duration-slowest | 1 | 0 | 1 |
| font-offset | 1 | 0 | 1 |
| foreground-brand | 1 | 0 | 1 |
| foreground-info | 1 | 0 | 1 |
| foreground-negative | 1 | 0 | 1 |
| foreground-neutral | 1 | 0 | 1 |
| foreground-positive | 1 | 0 | 1 |
| foreground-separator | 1 | 0 | 1 |
| foreground-skeleton | 1 | 0 | 1 |
| foreground-warning | 1 | 0 | 1 |
| from | 1 | 0 | 1 |
| gap | 1 | 0 | 1 |
| height | 1 | 0 | 1 |
| height-l | 1 | 0 | 1 |
| height-m | 1 | 0 | 1 |
| height-s | 1 | 0 | 1 |
| height-xs | 1 | 0 | 1 |
| icon-hover | 1 | 0 | 1 |
| icon-normal | 1 | 0 | 1 |
| icon-on | 1 | 0 | 1 |
| icon-pressed | 1 | 0 | 1 |
| inline | 1 | 0 | 1 |
| inline-end | 1 | 0 | 1 |
| inline-start | 1 | 0 | 1 |
| item-margin | 1 | 0 | 1 |
| lh | 1 | 0 | 1 |
| padding | 1 | 0 | 1 |
| padding-inline | 1 | 0 | 1 |
| padding-l | 1 | 0 | 1 |
| padding-m | 1 | 0 | 1 |
| padding-s | 1 | 0 | 1 |
| radius | 1 | 0 | 1 |
| radius-l | 1 | 0 | 1 |
| radius-m | 1 | 0 | 1 |
| radius-s | 1 | 0 | 1 |
| radius-xl | 1 | 0 | 1 |
| radius-xs | 1 | 0 | 1 |
| scale | 1 | 0 | 1 |
| segment-gap | 1 | 0 | 1 |
| service-autofill | 1 | 0 | 1 |
| service-backdrop | 1 | 1 | 0 |
| service-highlight | 1 | 0 | 1 |
| service-selected | 1 | 0 | 1 |
| service-selection | 1 | 0 | 1 |
| shadow-popup | 1 | 1 | 0 |
| slider-thumb | 1 | 0 | 1 |
| tab-margin | 1 | 0 | 1 |
| textarea-height | 1 | 0 | 1 |
| thickness | 1 | 0 | 1 |
| width | 1 | 0 | 1 |

Сопоставленные токены:

| Токен кода | Переменная/стиль Figma | Библиотека | Основание |
| --- | --- | --- | --- |
| `--tui-background-accent-1-hover` | State/Background/Accent 1 Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-1-pressed` | State/Background/Accent 1 Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-2-hover` | State/Background/Accent 2 Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-2-pressed` | State/Background/Accent 2 Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-on-dark-hover` | State/Background/Accent On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-on-dark-pressed` | State/Background/Accent On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-on-light-hover` | State/Background/Accent On Light Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-on-light-pressed` | State/Background/Accent On Light Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-opposite-hover` | State/Background/Accent Opposite Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-accent-opposite-pressed` | State/Background/Accent Opposite Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-base` | Background/Base | TUI Foundations | проверено по макету |
| `--tui-background-neutral-1-hover` | State/Background/Neutral 1 Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-1-on-dark-hover` | State/Background/Neutral 1 On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-1-on-dark-pressed` | State/Background/Neutral 1 On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-1-on-light-hover` | State/Background/Neutral 1 On Light Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-1-on-light-pressed` | State/Background/Neutral 1 On Light Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-1-opaque` | Background/Neutral 1 Opaque | TUI Foundations | проверено по макету |
| `--tui-background-neutral-1-pressed` | State/Background/Neutral 1 Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-2-hover` | State/Background/Neutral 2 Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-2-on-dark-hover` | State/Background/Neutral 2 On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-2-on-dark-pressed` | State/Background/Neutral 2 On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-neutral-2-pressed` | State/Background/Neutral 2 Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-overlay-glass-hover` | State/Background/Overlay Glass Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-overlay-glass-on-dark-hover` | State/Background/Overlay Glass On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-overlay-glass-on-dark-pressed` | State/Background/Overlay Glass On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-overlay-glass-on-light-hover` | State/Background/Overlay Glass On Light Hover | TUI Foundations | точное совпадение имени |
| `--tui-background-overlay-glass-on-light-pressed` | State/Background/Overlay Glass On Light Pressed | TUI Foundations | точное совпадение имени |
| `--tui-background-overlay-glass-pressed` | State/Background/Overlay Glass Pressed | TUI Foundations | точное совпадение имени |
| `--tui-border-focus` | Border/Focus | TUI Foundations | точное совпадение имени |
| `--tui-border-hover` | Border/Hover | TUI Foundations | точное совпадение имени |
| `--tui-border-normal` | Border/Normal | TUI Foundations | проверено по макету |
| `--tui-border-normal-opaque-hover` | State/Border/Normal Opaque Hover | TUI Foundations | точное совпадение имени |
| `--tui-border-on-dark-hover` | State/Border/On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-border-on-light-hover` | State/Border/On Light Hover | TUI Foundations | точное совпадение имени |
| `--tui-border-selected` | Border/Selected | TUI Foundations | точное совпадение имени |
| `--tui-brand-black` | Brand/Black | TUI Foundations | точное совпадение имени |
| `--tui-brand-element-premium` | Brand Element/Premium [DEPRICATED] | TUI Foundations | точное совпадение имени |
| `--tui-brand-element-premium-pale` | Brand Element/Premium Pale [DEPRICATED] | TUI Foundations | точное совпадение имени |
| `--tui-brand-platinum` | Brand/Platinum | TUI Foundations | точное совпадение имени |
| `--tui-brand-premium` | Brand/Premium [DEPRICATED] | TUI Foundations | точное совпадение имени |
| `--tui-brand-premium-pressed` | State/Brand/[DEPRICATED] Premium Pressed | TUI Foundations | точное совпадение имени |
| `--tui-brand-private` | Brand/Private | TUI Foundations | точное совпадение имени |
| `--tui-brand-pro` | Brand/Pro | TUI Foundations | точное совпадение имени |
| `--tui-brand-t-bank` | Brand/T-Bank | TUI Foundations | точное совпадение имени |
| `--tui-brand-t-business` | Brand/T-Business | TUI Foundations | точное совпадение имени |
| `--tui-brand-t-insurance` | Brand/T-Insurance | TUI Foundations | точное совпадение имени |
| `--tui-brand-t-invest` | Brand/T-Invest | TUI Foundations | точное совпадение имени |
| `--tui-brand-t-mobile` | Brand/T-Mobile | TUI Foundations | точное совпадение имени |
| `--tui-brand-ts-premium` | Brand/TS-Premium | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-01` | Categorical/Categorical 01 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-02` | Categorical/Categorical 02 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-03` | Categorical/Categorical 03 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-04` | Categorical/Categorical 04 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-05` | Categorical/Categorical 05 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-06` | Categorical/Categorical 06 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-07` | Categorical/Categorical 07 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-08` | Categorical/Categorical 08 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-09` | Categorical/Categorical 09 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-10` | Categorical/Categorical 10 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-11` | Categorical/Categorical 11 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-12` | Categorical/Categorical 12 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-13` | Categorical/Categorical 13 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-14` | Categorical/Categorical 14 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-15` | Categorical/Categorical 15 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-16` | Categorical/Categorical 16 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-17` | Categorical/Categorical 17 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-18` | Categorical/Categorical 18 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-19` | Categorical/Categorical 19 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-20` | Categorical/Categorical 20 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-21` | Categorical/Categorical 21 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-22` | Categorical/Categorical 22 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-23` | Categorical/Categorical 23 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-24` | Categorical/Categorical 24 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-25` | Categorical/Categorical 25 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-26` | Categorical/Categorical 26 | TUI Foundations | точное совпадение имени |
| `--tui-chart-categorical-27` | Categorical/Categorical 27 | TUI Foundations | точное совпадение имени |
| `--tui-chart-series-additional1-accent` | Chart/Series/additional1-accent | TUI Foundations | точное совпадение имени |
| `--tui-chart-series-additional2-accent` | Chart/Series/additional2-accent | TUI Foundations | точное совпадение имени |
| `--tui-chart-series-primary-accent` | Chart/Series/primary-accent | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-negative-accent` | Chart/State/negative-accent | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-negative-pale` | Chart/State/negative-pale | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-negative-prognosis` | Chart/State/negative-prognosis | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-positive-accent` | Chart/State/positive-accent | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-positive-pale` | Chart/State/positive-pale | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-positive-prognosis` | Chart/State/positive-prognosis | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-warning-accent` | Chart/State/warning-accent | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-warning-pale` | Chart/State/warning-pale | TUI Foundations | точное совпадение имени |
| `--tui-chart-state-warning-prognosis` | Chart/State/warning-prognosis | TUI Foundations | точное совпадение имени |
| `--tui-component-button-vertical-hover` | State/Component/Button Vertical Hover | TUI Foundations | точное совпадение имени |
| `--tui-component-button-vertical-pressed` | State/Component/Button Vertical Pressed | TUI Foundations | точное совпадение имени |
| `--tui-component-tooltip` | Component/Tooltip | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-all-airlines` | Gradient/Brand/All Airlines | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-all-airlines-debit` | Gradient/Brand/All Airlines Debit | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-all-games-debit` | Gradient/Brand/All Games Debit | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-black` | Gradient/Brand/Black | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-business` | Gradient/Brand/Business | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-drive-plus` | Gradient/Brand/Drive Plus | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-platinum` | Gradient/Brand/Platinum | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-private` | Gradient/Brand/Private | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-pro` | Gradient/Brand/Pro | TUI Foundations | точное совпадение имени |
| `--tui-gradient-brand-ts-premium` | Gradient/Brand/TS-Premium | TUI Foundations | точное совпадение имени |
| `--tui-gradient-mask-fade-bottom` | Gradient/Mask/Fade Bottom | TUI Foundations | точное совпадение имени |
| `--tui-gradient-mask-fade-left` | Gradient/Mask/Fade Left | TUI Foundations | точное совпадение имени |
| `--tui-gradient-mask-fade-right` | Gradient/Mask/Fade Right | TUI Foundations | точное совпадение имени |
| `--tui-gradient-mask-fade-top` | Gradient/Mask/Fade Top | TUI Foundations | точное совпадение имени |
| `--tui-gradient-overlay-bottom` | Gradient/Overlay/Bottom | TUI Foundations | точное совпадение имени |
| `--tui-gradient-overlay-bottom-left` | Gradient/Overlay/Bottom Left | TUI Foundations | точное совпадение имени |
| `--tui-gradient-overlay-top` | Gradient/Overlay/Top | TUI Foundations | точное совпадение имени |
| `--tui-gradient-overlay-top-right` | Gradient/Overlay/Top Right | TUI Foundations | точное совпадение имени |
| `--tui-service-backdrop` | Service/Backdrop | TUI Foundations | точное совпадение имени |
| `--tui-service-skeleton` | Service/Skeleton | TUI Foundations | точное совпадение имени |
| `--tui-service-underline` | Service/Underline | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-grayscale-hover` | State/Service/Underline Grayscale Hover | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-grayscale-on-dark-hover` | State/Service/Underline Grayscale On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-grayscale-on-dark-pressed` | State/Service/Underline Grayscale On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-grayscale-on-light-hover` | State/Service/Underline Grayscale On Light Hover | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-grayscale-on-light-pressed` | State/Service/Underline Grayscale On Light Pressed | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-grayscale-pressed` | State/Service/Underline Grayscale Pressed | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-hover` | State/Service/Underline Hover | TUI Foundations | точное совпадение имени |
| `--tui-service-underline-pressed` | State/Service/Underline Pressed | TUI Foundations | точное совпадение имени |
| `--tui-shadow-medium` | Shadow/Medium | TUI Foundations | точное совпадение имени |
| `--tui-shadow-medium-hover` | Shadow/Medium Hover | TUI Foundations | точное совпадение имени |
| `--tui-shadow-popup` | Shadow/Popup | TUI Foundations | точное совпадение имени |
| `--tui-shadow-small` | Shadow/Small | TUI Foundations | точное совпадение имени |
| `--tui-shadow-small-hover` | Shadow/Small Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-info` | Status/Info | TUI Foundations | точное совпадение имени |
| `--tui-status-info-pale-hover` | State/Status/Info Pale Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-info-pale-on-dark-hover` | State/Status/Info Pale On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-info-pale-on-dark-pressed` | State/Status/Info Pale On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-info-pale-pressed` | State/Status/Info Pale Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-negative` | Status/Negative | TUI Foundations | точное совпадение имени |
| `--tui-status-negative-hover` | State/Status/Negative Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-negative-pale-hover` | State/Status/Negative Pale Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-negative-pale-on-dark-hover` | State/Status/Negative Pale On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-negative-pale-on-dark-pressed` | State/Status/Negative Pale On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-negative-pale-pressed` | State/Status/Negative Pale Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-negative-pressed` | State/Status/Negative Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-neutral` | Status/Neutral | TUI Foundations | точное совпадение имени |
| `--tui-status-neutral-pale-hover` | State/Status/Neutral Pale Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-neutral-pale-pressed` | State/Status/Neutral Pale Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-positive` | Status/Positive | TUI Foundations | точное совпадение имени |
| `--tui-status-positive-pale-hover` | State/Status/Positive Pale Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-positive-pale-on-dark-hover` | State/Status/Positive Pale On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-positive-pale-on-dark-pressed` | State/Status/Positive Pale On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-positive-pale-pressed` | State/Status/Positive Pale Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-warning` | Status/Warning | TUI Foundations | точное совпадение имени |
| `--tui-status-warning-pale-hover` | State/Status/Warning Pale Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-warning-pale-on-dark-hover` | State/Status/Warning Pale On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-status-warning-pale-on-dark-pressed` | State/Status/Warning Pale On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-status-warning-pale-pressed` | State/Status/Warning Pale Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-action` | Text/Action | TUI Foundations | проверено по макету |
| `--tui-text-action-hover` | State/Text/Action Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-action-pressed` | State/Text/Action Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-negative` | Text/Negative | TUI Foundations | точное совпадение имени |
| `--tui-text-negative-hover` | State/Text/Negative Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-positive` | Text/Positive | TUI Foundations | точное совпадение имени |
| `--tui-text-positive-hover` | State/Text/Positive Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-primary` | Text/Primary | TUI Foundations | проверено по макету |
| `--tui-text-primary-hover` | State/Text/Primary Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-primary-on-dark-hover` | State/Text/Primary On Dark Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-primary-on-dark-pressed` | State/Text/Primary On Dark Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-primary-on-light-hover` | State/Text/Primary On Light Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-primary-on-light-pressed` | State/Text/Primary On Light Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-primary-pressed` | State/Text/Primary Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-secondary` | Text/Secondary | TUI Foundations | проверено по макету |
| `--tui-text-secondary-hover` | State/Text/Secondary Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-secondary-pressed` | State/Text/Secondary Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-tertiary` | Text/Tertiary | TUI Foundations | точное совпадение имени |
| `--tui-text-tertiary-hover` | State/Text/Tertiary Hover | TUI Foundations | точное совпадение имени |
| `--tui-text-tertiary-pressed` | State/Text/Tertiary Pressed | TUI Foundations | точное совпадение имени |
| `--tui-text-warning` | Text/Warning | TUI Foundations | точное совпадение имени |
| `--tui-text-warning-hover` | State/Text/Warning Hover | TUI Foundations | точное совпадение имени |
| `--tui-typography-body-l` | Desktop/Body L | TUI Desktop | точное совпадение имени |
| `--tui-typography-body-l-bold` | Desktop/Body L Bold | TUI Desktop | точное совпадение имени |
| `--tui-typography-body-m` | Desktop/Body M | TUI Desktop | проверено по макету |
| `--tui-typography-body-m-bold` | Desktop/Body M Bold | TUI Desktop | проверено по макету |
| `--tui-typography-body-s` | Desktop/Body S | TUI Desktop | проверено по макету |
| `--tui-typography-body-s-bold` | Desktop/Body S Bold | TUI Desktop | точное совпадение имени |
| `--tui-typography-body-xs` | Desktop/Body XS | TUI Desktop | точное совпадение имени |
| `--tui-typography-heading-h1` | Desktop/Heading 1 | TUI Desktop | точное совпадение имени |
| `--tui-typography-heading-h2` | Desktop/Heading 2 | TUI Desktop | точное совпадение имени |
| `--tui-typography-heading-h3` | Desktop/Heading 3 | TUI Desktop | точное совпадение имени |
| `--tui-typography-heading-h4` | Desktop/Heading 4 | TUI Desktop | точное совпадение имени |
| `--tui-typography-heading-h5` | Desktop/Heading 5 | TUI Desktop | точное совпадение имени |
| `--tui-typography-heading-h6` | Desktop/Heading 6 | TUI Desktop | точное совпадение имени |
| `--tui-typography-numbers-m` | Desktop/Numbers M | TUI Desktop | точное совпадение имени |
| `--tui-typography-numbers-xl` | Desktop/Numbers XL | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-l` | Desktop/UI L | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-l-bold` | Desktop/UI L Bold | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-m` | Desktop/UI M | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-m-bold` | Desktop/UI M Bold | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-s` | Desktop/UI S | TUI Desktop | проверено по макету |
| `--tui-typography-ui-s-bold` | Desktop/UI S Bold | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-xs` | Desktop/UI XS | TUI Desktop | точное совпадение имени |
| `--tui-typography-ui-xs-bold` | Desktop/UI XS Bold | TUI Desktop | точное совпадение имени |

## Ограничения отчёта

- Варианты Figma сохранены в исходных снапшотах, но не каждый вариант и component property проверен вручную.
- `exact-name-convention` означает детерминированное совпадение имени, а не доказанную визуальную эквивалентность.
- Несколько одноимённых кандидатов считаются неоднозначностью и не используются автоматически.
- Неопубликованный или недоступный для импорта asset во время рендера должен перейти на нативный fallback.
- Исключено невизуальных или несопоставленных служебных директив: 180.
- Полный машинный каталог: `profiles/proprietary-taiga-ui-angular.json`.
