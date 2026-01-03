// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

// Re-export all hooks from @medplum/solid-hooks
export * from '@medplum/solid-hooks';

// Providers
export * from './providers/ThemeProvider';
export * from './providers/SolidMedplumProvider';

// Test utilities (for consumer test setups)
export * from './test-utils/render';

// Components
export * from './Button/Button';
export * from './Loading/Loading';
export * from './ErrorBoundary/ErrorBoundary';
export * from './Container/Container';
export * from './Panel/Panel';
export * from './Document/Document';
export * from './Form/Form';
export * from './FormSection/FormSection';
export * from './Tabs/Tabs';
export * from './Modal/Modal';
export * from './Tooltip/Tooltip';
export * from './Alert/Alert';
export * from './StatusBadge/StatusBadge';
export * from './Collapse/Collapse';
export * from './Breadcrumbs/Breadcrumbs';
export * from './Dropdown/Dropdown';
export * from './Avatar/Avatar';
export * from './Card/Card';
export * from './Badge/Badge';
export * from './Progress/Progress';
export * from './Pagination/Pagination';
export * from './Table/Table';
export * from './Textarea/Textarea';
export * from './Checkbox/Checkbox';
export * from './Toggle/Toggle';
export * from './Divider/Divider';
export * from './CopyButton/CopyButton';
export * from './Stats/Stats';
export * from './Dialog/Dialog';
export * from './Popover/Popover';
export * from './Select/Select';
export * from './Slider/Slider';
export * from './Switch/Switch';
export * from './Skeleton/Skeleton';
export * from './Steps/Steps';
export * from './Drawer/Drawer';

// Display Components
export * from './AddressDisplay/AddressDisplay';
export * from './HumanNameDisplay/HumanNameDisplay';
export * from './ContactPointDisplay/ContactPointDisplay';
export * from './CodeableConceptDisplay/CodeableConceptDisplay';
export * from './QuantityDisplay/QuantityDisplay';
export * from './CodingDisplay/CodingDisplay';
export * from './MoneyDisplay/MoneyDisplay';
export * from './RangeDisplay/RangeDisplay';
export * from './RatioDisplay/RatioDisplay';
export * from './IdentifierDisplay/IdentifierDisplay';
export * from './ReferenceDisplay/ReferenceDisplay';
export * from './ResourceName/ResourceName';
export * from './ResourceAvatar/ResourceAvatar';
export * from './ResourceBadge/ResourceBadge';
export * from './AttachmentDisplay/AttachmentDisplay';
export * from './ResourcePropertyDisplay/ResourcePropertyDisplay';
export * from './FhirPathDisplay/FhirPathDisplay';
export * from './DescriptionList/DescriptionList';

// Navigation
export * from './MedplumLink/MedplumLink';

// Input Components
export * from './TextInput/TextInput';
export * from './DateTimeInput/DateTimeInput';
export * from './NativeSelect/NativeSelect';
export * from './CheckboxFormSection/CheckboxFormSection';

// FHIR Type Inputs
export * from './AddressInput/AddressInput';
export * from './HumanNameInput/HumanNameInput';
export * from './ContactPointInput/ContactPointInput';
export * from './QuantityInput/QuantityInput';
export * from './IdentifierInput/IdentifierInput';
export * from './PeriodInput/PeriodInput';
export * from './MoneyInput/MoneyInput';
export * from './RangeInput/RangeInput';
export * from './RatioInput/RatioInput';
export * from './AttachmentButton/AttachmentButton';
export * from './AttachmentInput/AttachmentInput';
export * from './CodingInput/CodingInput';
export * from './CodeableConceptInput/CodeableConceptInput';
export * from './ResourceInput/ResourceInput';
export * from './ReferenceInput/ReferenceInput';

// Autocomplete Components
export * from './AsyncAutocomplete/AsyncAutocomplete';
export * from './ValueSetAutocomplete/ValueSetAutocomplete';

// Resource Components (Phase 7)
export * from './ElementsContext/ElementsContext';
export * from './BackboneElementDisplay/BackboneElementDisplay';
export * from './ResourceTable/ResourceTable';

// Search & Timeline (Phase 8)
export * from './SearchResults/SearchResults';
export * from './SearchControl/SearchControl';
export * from './Timeline/Timeline';
export * from './SearchFilterEditor/SearchFilterEditor';
export * from './SearchFilterValueInput/SearchFilterValueInput';
export * from './SearchExportDialog/SearchExportDialog';
export * from './MeasureReportDisplay/MeasureReportDisplay';
export * from './CcdaDisplay/CcdaDisplay';
export * from './RequestGroupDisplay/RequestGroupDisplay';
export * from './BookmarkDialog/BookmarkDialog';
export * from './SearchPopupMenu/SearchPopupMenu';
export * from './Chat/ChatModal/ChatModal';
export * from './SearchFieldEditor/SearchFieldEditor';
export * from './SearchFilterValueDialog/SearchFilterValueDialog';

// Questionnaire (Phase 9)
export * from './QuestionnaireForm/QuestionnaireForm';
export * from './SignatureInput/SignatureInput';

// AppShell (Phase 10)
export * from './AppShell/AppShell';
export * from './AppShell/Header';
export * from './AppShell/Navbar';
export * from './AppShell/HeaderDropdown';
export * from './AppShell/HeaderSearchInput';

// Auth (Phase 10)
export * from './auth/SignInForm';
export * from './auth/AuthenticationForm';
export * from './auth/RegisterForm';
export * from './auth/NewUserForm';
export * from './auth/ChooseProfileForm';
export * from './auth/MfaForm';
export * from './auth/NewProjectForm';
export * from './GoogleButton/GoogleButton';

// New Phase 11 Components
export * from './AnnotationInput/AnnotationInput';
export * from './AttachmentArrayDisplay/AttachmentArrayDisplay';
export * from './AttachmentArrayInput/AttachmentArrayInput';
export * from './CodeInput/CodeInput';
export * from './ContactDetailDisplay/ContactDetailDisplay';
export * from './ContactDetailInput/ContactDetailInput';
export * from './TimingInput/TimingInput';
export * from './ElementsInput/ElementsInput';
export * from './BackboneElementInput/BackboneElementInput';
export * from './ExtensionDisplay/ExtensionDisplay';
export * from './ExtensionInput/ExtensionInput';
export * from './ResourceForm/ResourceForm';
export * from './LinkTabs/LinkTabs';
export * from './NoteDisplay/NoteDisplay';
export * from './InfoBar/InfoBar';
export * from './ResourceHistoryTable/ResourceHistoryTable';
export * from './PatientHeader/PatientHeader';
export * from './DiagnosticReportDisplay/DiagnosticReportDisplay';
export * from './ResourceDiff/ResourceDiff';
export * from './CalendarInput/CalendarInput';
export * from './QuestionnaireResponseDisplay/QuestionnaireResponseDisplay';
export * from './SmartAppLaunchLink/SmartAppLaunchLink';
export * from './OperationOutcomeAlert/OperationOutcomeAlert';
export * from './NotificationIcon/NotificationIcon';
export * from './Logo/Logo';
export * from './Scheduler/Scheduler';
export * from './PlanDefinitionBuilder/PlanDefinitionBuilder';
export * from './QuestionnaireBuilder/QuestionnaireBuilder';
export * from './PatientSummary/PatientSummary';
export * from './Chat/BaseChat/BaseChat';
export * from './ResourceTypeInput/ResourceTypeInput';

// Phase 12 - Timeline Components
export * from './ResourceDiffRow/ResourceDiffRow';
export * from './ResourceDiffTable/ResourceDiffTable';
export * from './ResourceTimeline/ResourceTimeline';
export * from './DefaultResourceTimeline/DefaultResourceTimeline';
export * from './PatientTimeline/PatientTimeline';
export * from './EncounterTimeline/EncounterTimeline';
export * from './ServiceRequestTimeline/ServiceRequestTimeline';

// Utilities
export * from './utils/outcomes';
export * from './utils/maybeWrapWithContext';
export * from './utils/diff';
export * from './utils/date';
export * from './constants';
