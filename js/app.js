/* parcel-tracker-bd -- DOM wiring + i18n.
   Pure logic lives in logic.js. All string literals here are pure ASCII;
   Bengali text is \uXXXX escapes only. No network requests. */
(function () {
  'use strict';
  var L = window.ParcelLogic;

  var EN = {
    appTitle: 'Parcel Tracker BD',
    subtitle: 'Track all your courier parcels in one place, offline.',
    tabDash: 'Dashboard', tabParcels: 'Parcels', tabData: 'Data',
    totalParcels: 'Total parcels', inTransit: 'In transit',
    delivered: 'Delivered', codPending: 'COD pending',
    codCollected: 'COD collected', overdue: 'Overdue',
    overdueListTitle: 'Overdue parcels', noOverdue: 'No overdue parcels.',
    addParcel: 'Add parcel', editParcel: 'Edit parcel',
    trackingId: 'Tracking ID', courier: 'Courier',
    sender: 'Sender / shop name', item: 'Item description',
    cod: 'COD (BDT)', expected: 'Expected delivery date',
    note: 'Note (optional)', save: 'Save parcel', cancelEdit: 'Cancel edit',
    search: 'Search tracking / sender / item...',
    allCouriers: 'All couriers', allStatuses: 'All statuses',
    sortBy: 'Sort', sortNewest: 'Newest first', sortOldest: 'Oldest first',
    sortExpected: 'Expected date', sortCod: 'COD (high first)',
    emptyParcels: 'No parcels yet. Add your first one with the form above.',
    view: 'View', edit: 'Edit', del: 'Delete',
    historyTitle: 'Status history', detailTitle: 'Parcel detail',
    overdueBadge: 'Overdue', noExpected: '--',
    exportJson: 'Export JSON', exportHint: 'Exported JSON appears below. Copy it somewhere safe.',
    importJson: 'Import JSON', importPlaceholder: 'Paste exported JSON here...',
    importBtn: 'Import', eraseTitle: 'Erase all data',
    eraseHint: 'Type DELETE to enable erase.',
    eraseBtn: 'Erase all data', cleared: 'All data erased.',
    imported: 'Imported {n} parcel(s).', saved: 'Parcel saved.',
    updated: 'Parcel updated.', deleted: 'Parcel deleted.',
    invalidImport: 'Import failed: data unchanged.',
    exportEmpty: 'Nothing to export yet.', exported: 'Export ready.',
    disclaimer: 'Personal offline tracker. Not connected to any courier live tracking system. Verify status on the courier own site.',
    asof: 'As of', langBtn: 'Bangla',
    errTrackingRequired: 'Tracking ID is required.',
    errTrackingDuplicate: 'This tracking ID already exists.',
    errTrackingLength: 'Tracking ID must be 60 characters or fewer.',
    errCourier: 'Choose a valid courier.',
    errCod: 'COD must be a valid number (max 2 decimals).',
    errDate: 'Expected date must be a valid date (YYYY-MM-DD).',
    errSenderLength: 'Sender name must be 100 characters or fewer.',
    errItemLength: 'Item description must be 200 characters or fewer.',
    errNoteLength: 'Note must be 500 characters or fewer.',
    confirmDelete: 'Delete this parcel?',
    errDeleteWord: 'Type DELETE exactly to erase all data.',
    detailEmpty: 'Select a parcel to see its detail.',
    closeDetail: 'Close', statusLabel: 'Status', createdLabel: 'Created',
    noHistory: 'No history yet.',
    st_Booked: 'Booked', st_PickedUp: 'Picked Up',
    st_InTransit: 'In Transit', st_OutForDelivery: 'Out for Delivery',
    st_Delivered: 'Delivered', st_Returned: 'Returned',
    st_Cancelled: 'Cancelled',
    senderLabel: 'Sender', itemLabel: 'Item', courierLabel: 'Courier',
    codLabel: 'COD', expectedLabel: 'Expected', noteLabel: 'Note',
    trackingLabel: 'Tracking ID', clearSearch: 'Clear'
  };

  var BN = {
    appTitle: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BE\u09B0',
    subtitle: '\u09B8\u09AC \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u098F\u0995 \u099C\u09BE\u09AF\u09BC\u0997\u09BE\u09AF\u09BC \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995 \u0995\u09B0\u09C1\u09A8\u0964',
    tabDash: '\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1',
    tabParcels: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2',
    tabData: '\u09A1\u09C7\u099F\u09BE',
    totalParcels: '\u09AE\u09CB\u099F \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2',
    inTransit: '\u09AA\u09A5\u09C7 \u0986\u099B\u09C7',
    delivered: '\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7',
    codPending: '\u09AC\u0995\u09C7\u09AF\u09BC\u09BE COD',
    codCollected: '\u0986\u09A6\u09BE\u09AF\u09BC\u0995\u09C3\u09A4 COD',
    overdue: '\u09AE\u09C7\u09AF\u09BC\u09BE\u09A6\u09CB\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3',
    overdueListTitle: '\u09AE\u09C7\u09AF\u09BC\u09BE\u09A6\u09CB\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2',
    noOverdue: '\u0995\u09CB\u09A8\u09CB \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6\u09CB\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09A8\u09C7\u0987\u0964',
    addParcel: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8',
    editParcel: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE',
    trackingId: '\u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u0986\u0987\u09A1\u09BF',
    courier: '\u0995\u09C1\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0',
    sender: '\u09AA\u09CD\u09B0\u09C7\u09B0\u0995 / \u09A6\u09CB\u0995\u09BE\u09A8',
    item: '\u09AA\u09A3\u09CD\u09AF\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3',
    cod: 'COD (\u099F\u09BE\u0995\u09BE)',
    expected: '\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u09A4\u09BE\u09B0\u09BF\u0996',
    note: '\u09A8\u09CB\u099F',
    save: '\u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3',
    cancelEdit: '\u09AC\u09BE\u09A4\u09BF\u09B2',
    search: '\u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 / \u09AA\u09CD\u09B0\u09C7\u09B0\u0995 / \u09AA\u09A3\u09CD\u09AF \u09A6\u09BF\u09AF\u09BC\u09C7 \u0996\u09C1\u0981\u099C\u09C1\u09A8...',
    allCouriers: '\u09B8\u09AC \u0995\u09C1\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0',
    allStatuses: '\u09B8\u09AC \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8',
    sortBy: '\u09B8\u09BE\u099C\u09BE\u09A8',
    sortNewest: '\u09A8\u09A4\u09C1\u09A8 \u0986\u0997\u09C7',
    sortOldest: '\u09AA\u09C1\u09B0\u09A8\u09CB \u0986\u0997\u09C7',
    sortExpected: '\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4 \u09A4\u09BE\u09B0\u09BF\u0996',
    sortCod: 'COD (\u09AC\u09C7\u09B6\u09BF \u0986\u0997\u09C7)',
    emptyParcels: '\u098F\u0996\u09A8\u09CB \u0995\u09CB\u09A8\u09CB \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09A8\u09C7\u0987\u0964 \u0989\u09AA\u09B0\u09C7\u09B0 \u09AB\u09B0\u09CD\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09AA\u09CD\u09B0\u09A5\u09AE\u099F\u09BF \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964',
    view: '\u09A6\u09C7\u0996\u09C1\u09A8', edit: '\u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE',
    del: '\u09AE\u09C1\u099B\u09C1\u09A8',
    historyTitle: '\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8',
    detailTitle: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4',
    overdueBadge: '\u09AE\u09C7\u09AF\u09BC\u09BE\u09A6\u09CB\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3',
    noExpected: '--',
    exportJson: 'JSON \u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F',
    exportHint: '\u09A8\u09BF\u099A\u09C7 \u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09B0\u09BE JSON \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7 \u2014 \u0995\u09AA\u09BF \u0995\u09B0\u09C7 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6\u09C7 \u09B0\u09BE\u0996\u09C1\u09A8\u0964',
    importJson: 'JSON \u0987\u09AE\u09AA\u09CB\u09B0\u09CD\u099F',
    importPlaceholder: '\u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09B0\u09BE JSON \u098F\u0996\u09BE\u09A8\u09C7 \u09AA\u09C7\u09B8\u09CD\u099F \u0995\u09B0\u09C1\u09A8...',
    importBtn: '\u0987\u09AE\u09AA\u09CB\u09B0\u09CD\u099F',
    eraseTitle: '\u09B8\u09AC \u09A1\u09C7\u099F\u09BE \u09AE\u09C1\u099B\u09C1\u09A8',
    eraseHint: '\u09AE\u09C1\u099B\u09A4\u09C7 DELETE \u09B2\u09BF\u0996\u09C1\u09A8\u0964',
    eraseBtn: '\u09B8\u09AC \u09A1\u09C7\u099F\u09BE \u09AE\u09C1\u099B\u09C1\u09A8',
    cleared: '\u09B8\u09AC \u09A1\u09C7\u099F\u09BE \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964',
    imported: '{n}\u099F\u09BF \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u0987\u09AE\u09AA\u09CB\u09B0\u09CD\u099F \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964',
    saved: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964',
    updated: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u0986\u09AA\u09A1\u09C7\u099F \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964',
    deleted: '\u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964',
    invalidImport: '\u0987\u09AE\u09AA\u09CB\u09B0\u09CD\u099F \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5: \u09A1\u09C7\u099F\u09BE \u0985\u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u0986\u099B\u09C7\u0964',
    exportEmpty: '\u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09B0\u09BE\u09B0 \u09AE\u09A4\u09CB \u0995\u09BF\u099B\u09C1 \u09A8\u09C7\u0987\u0964',
    exported: '\u098F\u0995\u09CD\u09B8\u09AA\u09CB\u09B0\u09CD\u099F \u09A4\u09C8\u09B0\u09BF\u0964',
    disclaimer: '\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u0985\u09AB\u09B2\u09BE\u0987\u09A8 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BE\u09B0 \u2014 \u0995\u09CB\u09A8\u09CB \u0995\u09C1\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0\u09C7\u09B0 \u09B2\u09BE\u0987\u09AD \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4 \u09A8\u09AF\u09BC\u0964 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09A4\u09C7 \u0995\u09C1\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0\u09C7\u09B0 \u09A8\u09BF\u099C\u09B8\u09CD\u09AC \u09B8\u09BE\u0987\u099F\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964',
    asof: '\u09A4\u09BE\u09B0\u09BF\u0996', langBtn: 'English',
    errTrackingRequired: '\u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u0986\u0987\u09A1\u09BF \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964',
    errTrackingDuplicate: '\u098F\u0987 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u0986\u0987\u09A1\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u0986\u099B\u09C7\u0964',
    errTrackingLength: '\u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u0986\u0987\u09A1\u09BF \u09EC\u09E6 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09C7\u09B6\u09BF \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7 \u09A8\u09BE\u0964',
    errCourier: '\u09B8\u09A0\u09BF\u0995 \u0995\u09C1\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0 \u09AC\u09C7\u099B\u09C7 \u09A8\u09BF\u09A8\u0964',
    errCod: 'COD \u09B8\u09A0\u09BF\u0995 \u09B8\u0982\u0996\u09CD\u09AF\u09BE \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7 (\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09E8 \u09A6\u09B6\u09AE\u09BF\u0995)\u0964',
    errDate: '\u09A4\u09BE\u09B0\u09BF\u0996 \u09B8\u09A0\u09BF\u0995 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7 (YYYY-MM-DD)\u0964',
    errSenderLength: '\u09AA\u09CD\u09B0\u09C7\u09B0\u0995\u09C7\u09B0 \u09A8\u09BE\u09AE \u09E7\u09E6\u09E6 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09C7\u09B6\u09BF \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7 \u09A8\u09BE\u0964',
    errItemLength: '\u09AA\u09A3\u09CD\u09AF\u09C7\u09B0 \u09AC\u09BF\u09AC\u09B0\u09A3 \u09E8\u09E6\u09E6 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09C7\u09B6\u09BF \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7 \u09A8\u09BE\u0964',
    errNoteLength: '\u09A8\u09CB\u099F \u09EB\u09E6\u09E6 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09AC\u09C7\u09B6\u09BF \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7 \u09A8\u09BE\u0964',
    confirmDelete: '\u098F\u0987 \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2\u099F\u09BF \u09AE\u09C1\u099B\u09AC\u09C7\u09A8?',
    errDeleteWord: '\u09AE\u09C1\u099B\u09A4\u09C7 DELETE \u09A0\u09BF\u0995\u09AD\u09BE\u09AC\u09C7 \u09B2\u09BF\u0996\u09C1\u09A8\u0964',
    detailEmpty: '\u0995\u09CB\u09A8\u09CB \u09AA\u09BE\u09B0\u09CD\u09B8\u09C7\u09B2 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09BF\u09A4 \u09A8\u09AF\u09BC\u0964',
    closeDetail: '\u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C1\u09A8',
    statusLabel: '\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8',
    createdLabel: '\u09A4\u09C8\u09B0\u09BF',
    noHistory: '\u0995\u09CB\u09A8\u09CB \u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u09A8\u09C7\u0987\u0964',
    st_Booked: '\u09AC\u09C1\u0995\u09A1',
    st_PickedUp: '\u09AA\u09BF\u0995\u0986\u09AA \u09B9\u09AF\u09BC\u09C7\u099B\u09C7',
    st_InTransit: '\u099F\u09CD\u09B0\u09BE\u09A8\u099C\u09BF\u099F\u09C7',
    st_OutForDelivery: '\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u09B0 \u09AA\u09A5\u09C7',
    st_Delivered: '\u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7',
    st_Returned: '\u09AB\u09C7\u09B0\u09A4',
    st_Cancelled: '\u09AC\u09BE\u09A4\u09BF\u09B2',
    senderLabel: '\u09AA\u09CD\u09B0\u09C7\u09B0\u0995',
    itemLabel: '\u09AA\u09A3\u09CD\u09AF',
    courierLabel: '\u0995\u09C1\u09B0\u09BF\u09AF\u09BC\u09BE\u09B0',
    codLabel: 'COD',
    expectedLabel: '\u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u09B6\u09BF\u09A4',
    noteLabel: '\u09A8\u09CB\u099F',
    trackingLabel: '\u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\u09BF\u0982 \u0986\u0987\u09A1\u09BF',
    clearSearch: '\u09AE\u09C1\u099B\u09C1\u09A8'
  };

  var STATUS_KEY = {
    'Booked': 'st_Booked', 'Picked Up': 'st_PickedUp',
    'In Transit': 'st_InTransit', 'Out for Delivery': 'st_OutForDelivery',
    'Delivered': 'st_Delivered', 'Returned': 'st_Returned',
    'Cancelled': 'st_Cancelled'
  };

  var ERR_KEY = {
    ERR_TRACKING_REQUIRED: 'errTrackingRequired',
    ERR_TRACKING_DUPLICATE: 'errTrackingDuplicate',
    ERR_TRACKING_LENGTH: 'errTrackingLength',
    ERR_COURIER: 'errCourier', ERR_COD: 'errCod', ERR_DATE: 'errDate',
    ERR_SENDER_LENGTH: 'errSenderLength',
    ERR_ITEM_LENGTH: 'errItemLength', ERR_NOTE_LENGTH: 'errNoteLength'
  };

  var state = { parcels: [], lang: 'en', asof: '',
    filter: { query: '', courier: '', status: '' }, sort: 'newest',
    selectedId: null, editingId: null };

  function t(key) {
    var d = state.lang === 'bn' ? BN : EN;
    return d[key] || EN[key] || key;
  }

  function statusLabel(s) { return t(STATUS_KEY[s] || 'st_Booked'); }

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getAsof() {
    var m = /[?&]asof=([0-9-]+)/.exec(window.location.search);
    if (m && L.isValidDateStr(m[1])) return m[1];
    return L.localDateStr(new Date());
  }

  function load() {
    state.asof = getAsof();
    try {
      var lang = window.localStorage.getItem(L.LANG_KEY);
      if (lang === 'bn' || lang === 'en') state.lang = lang;
    } catch (e) { /* storage unavailable: keep defaults */ }
    try {
      var raw = window.localStorage.getItem(L.STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var check = L.validateImport(parsed);
        if (check.ok) state.parcels = check.parcels;
        else state.parcels = [];
      }
    } catch (e) { state.parcels = []; }
  }

  function save() {
    try {
      window.localStorage.setItem(L.STORAGE_KEY,
        JSON.stringify(L.buildExport(state.parcels, new Date().toISOString())));
      window.localStorage.setItem(L.LANG_KEY, state.lang);
    } catch (e) { /* ignore storage errors */ }
  }

  function showMsg(el, text, isError) {
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
    el.className = isError ? 'msg err' : 'msg ok';
  }

  function renderStatic() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = t(els[i].getAttribute('data-i18n'));
    }
    var phs = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < phs.length; j++) {
      phs[j].setAttribute('placeholder', t(phs[j].getAttribute('data-i18n-ph')));
    }
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    $('asofVal').textContent = L.formatDateDisplay(state.asof, state.lang);
    $('formTitle').textContent =
      state.editingId ? t('editParcel') : t('addParcel');
    $('btnCancelEdit').style.display = state.editingId ? 'inline-block' : 'none';
    renderStatusChips();
  }

  function renderStatusChips() {
    var wrap = $('statusChips');
    var html = '<button type="button" class="chip' +
      (state.filter.status === '' ? ' on' : '') +
      '" data-status="">' + escapeHtml(t('allStatuses')) + '</button>';
    for (var i = 0; i < L.STATUSES.length; i++) {
      var s = L.STATUSES[i];
      html += '<button type="button" class="chip' +
        (state.filter.status === s ? ' on' : '') +
        '" data-status="' + escapeHtml(s) + '">' +
        escapeHtml(statusLabel(s)) + '</button>';
    }
    wrap.innerHTML = html;
  }

  function renderDashboard() {
    var d = L.computeDashboard(state.parcels, state.asof);
    $('vTotal').textContent = L.formatCount(d.total, state.lang);
    $('vInTransit').textContent = L.formatCount(d.inTransit, state.lang);
    $('vDelivered').textContent = L.formatCount(d.delivered, state.lang);
    $('vCodPending').textContent = L.formatMoney(d.codPendingPaisa, state.lang);
    $('vCodCollected').textContent = L.formatMoney(d.codCollectedPaisa, state.lang);
    $('vOverdue').textContent = L.formatCount(d.overdue, state.lang);
    var overdueList = state.parcels.filter(function (p) {
      return L.isOverdue(p, state.asof);
    });
    overdueList.sort(function (a, b) {
      var ae = a.expectedDate || '9999-12-31';
      var be = b.expectedDate || '9999-12-31';
      return ae < be ? -1 : (ae > be ? 1 : 0);
    });
    var list = $('overdueList');
    if (overdueList.length === 0) {
      list.innerHTML = '<li class="muted">' + escapeHtml(t('noOverdue')) + '</li>';
    } else {
      var html = '';
      for (var i = 0; i < overdueList.length; i++) {
        var p = overdueList[i];
        html += '<li><strong>' + escapeHtml(p.trackingId) + '</strong> ' +
          escapeHtml(p.courier) + ' ' +
          escapeHtml(t('expectedLabel')) + ': ' +
          L.formatDateDisplay(p.expectedDate, state.lang) + '</li>';
      }
      list.innerHTML = html;
    }
  }

  function transitionButtons(p) {
    var next = L.nextStatuses(p.status);
    var html = '';
    for (var i = 0; i < next.length; i++) {
      html += '<button type="button" class="tbtn" data-act="transition" ' +
        'data-id="' + escapeHtml(p.id) + '" data-to="' +
        escapeHtml(next[i]) + '">' +
        escapeHtml(statusLabel(next[i])) + '</button>';
    }
    return html;
  }

  function renderList() {
    var filtered = L.filterParcels(state.parcels, state.filter);
    var sorted = L.sortParcels(filtered, state.sort);
    var list = $('parcelList');
    if (sorted.length === 0) {
      list.innerHTML = '<p class="muted" id="emptyMsg">' +
        escapeHtml(t('emptyParcels')) + '</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < sorted.length; i++) {
      var p = sorted[i];
      var od = L.isOverdue(p, state.asof);
      html += '<article class="parcel-card" data-id="' + escapeHtml(p.id) + '">';
      html += '<div class="card-head"><strong class="tracking">' +
        escapeHtml(p.trackingId) + '</strong>' +
        '<span class="badge st-' + escapeHtml(p.status.replace(/ /g, '')) + '">' +
        escapeHtml(statusLabel(p.status)) + '</span></div>';
      html += '<div class="meta">' + escapeHtml(t('courierLabel')) + ': ' +
        escapeHtml(p.courier);
      if (p.sender) html += ' &middot; ' + escapeHtml(t('senderLabel')) + ': ' +
        escapeHtml(p.sender);
      html += '</div>';
      if (p.item) html += '<div class="meta">' + escapeHtml(t('itemLabel')) +
        ': ' + escapeHtml(p.item) + '</div>';
      html += '<div class="meta">' + escapeHtml(t('codLabel')) + ': ' +
        L.formatMoney(p.codPaisa, state.lang) +
        ' &middot; ' + escapeHtml(t('expectedLabel')) + ': ' +
        (p.expectedDate ? L.formatDateDisplay(p.expectedDate, state.lang) :
          escapeHtml(t('noExpected')));
      if (od) html += ' <span class="od-badge">' + escapeHtml(t('overdueBadge')) + '</span>';
      html += '</div>';
      if (p.note) html += '<div class="meta">' + escapeHtml(t('noteLabel')) +
        ': ' + escapeHtml(p.note) + '</div>';
      html += '<div class="actions">' +
        '<button type="button" data-act="view" data-id="' + escapeHtml(p.id) + '">' +
        escapeHtml(t('view')) + '</button>' +
        '<button type="button" data-act="edit" data-id="' + escapeHtml(p.id) + '">' +
        escapeHtml(t('edit')) + '</button>' +
        '<button type="button" data-act="delete" data-id="' + escapeHtml(p.id) + '">' +
        escapeHtml(t('del')) + '</button>' +
        transitionButtons(p) + '</div>';
      html += '</article>';
    }
    list.innerHTML = html;
  }

  function renderDetail() {
    var panel = $('detailPanel');
    var p = null;
    for (var i = 0; i < state.parcels.length; i++) {
      if (state.parcels[i].id === state.selectedId) { p = state.parcels[i]; break; }
    }
    if (!p) {
      panel.innerHTML = '<p class="muted">' + escapeHtml(t('detailEmpty')) + '</p>';
      return;
    }
    var html = '<h3>' + escapeHtml(t('detailTitle')) + '</h3>';
    html += '<dl class="detail-grid">';
    html += '<dt>' + escapeHtml(t('trackingLabel')) + '</dt><dd>' + escapeHtml(p.trackingId) + '</dd>';
    html += '<dt>' + escapeHtml(t('statusLabel')) + '</dt><dd>' + escapeHtml(statusLabel(p.status)) + '</dd>';
    html += '<dt>' + escapeHtml(t('courierLabel')) + '</dt><dd>' + escapeHtml(p.courier) + '</dd>';
    html += '<dt>' + escapeHtml(t('senderLabel')) + '</dt><dd>' + escapeHtml(p.sender || t('noExpected')) + '</dd>';
    html += '<dt>' + escapeHtml(t('itemLabel')) + '</dt><dd>' + escapeHtml(p.item || t('noExpected')) + '</dd>';
    html += '<dt>' + escapeHtml(t('codLabel')) + '</dt><dd>' + L.formatMoney(p.codPaisa, state.lang) + '</dd>';
    html += '<dt>' + escapeHtml(t('expectedLabel')) + '</dt><dd>' + (p.expectedDate ? L.formatDateDisplay(p.expectedDate, state.lang) : escapeHtml(t('noExpected'))) + '</dd>';
    html += '<dt>' + escapeHtml(t('noteLabel')) + '</dt><dd>' + escapeHtml(p.note || t('noExpected')) + '</dd>';
    html += '<dt>' + escapeHtml(t('createdLabel')) + '</dt><dd>' + L.formatDateDisplay(p.createdAt.slice(0, 10), state.lang) + '</dd>';
    html += '</dl>';
    html += '<h4>' + escapeHtml(t('historyTitle')) + '</h4>';
    if (!p.history || p.history.length === 0) {
      html += '<p class="muted">' + escapeHtml(t('noHistory')) + '</p>';
    } else {
      html += '<ol class="history">';
      for (var h = 0; h < p.history.length; h++) {
        var entry = p.history[h];
        var stamp = entry.at.slice(0, 16).replace('T', ' ');
        html += '<li><strong>' + escapeHtml(statusLabel(entry.status)) +
          '</strong> <span class="muted">' +
          L.formatDateDisplay(stamp, state.lang) + '</span></li>';
      }
      html += '</ol>';
    }
    html += '<div class="actions">' + transitionButtons(p) +
      '<button type="button" id="btnCloseDetail">' +
      escapeHtml(t('closeDetail')) + '</button></div>';
    panel.innerHTML = html;
    var closeBtn = $('btnCloseDetail');
    if (closeBtn) closeBtn.addEventListener('click', function () {
      state.selectedId = null;
      renderDetail();
    });
  }

  function renderAll() {
    renderStatic();
    renderDashboard();
    renderList();
    renderDetail();
  }

  function resetForm() {
    state.editingId = null;
    $('f-id').value = '';
    $('f-tracking').value = '';
    $('f-courier').value = 'Pathao Courier';
    $('f-sender').value = '';
    $('f-item').value = '';
    $('f-cod').value = '';
    $('f-expected').value = '';
    $('f-note').value = '';
    $('formErrs').style.display = 'none';
    $('formErrs').textContent = '';
    renderStatic();
  }

  function startEdit(id) {
    var p = null;
    for (var i = 0; i < state.parcels.length; i++) {
      if (state.parcels[i].id === id) { p = state.parcels[i]; break; }
    }
    if (!p) return;
    state.editingId = id;
    $('f-id').value = id;
    $('f-tracking').value = p.trackingId;
    $('f-courier').value = p.courier;
    $('f-sender').value = p.sender;
    $('f-item').value = p.item;
    $('f-cod').value = L.formatPaisa(p.codPaisa);
    $('f-expected').value = p.expectedDate;
    $('f-note').value = p.note;
    $('formErrs').style.display = 'none';
    $('formErrs').textContent = '';
    switchTab('parcels');
    renderStatic();
    $('parcelForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function switchTab(name) {
    var tabs = document.querySelectorAll('[data-tab]');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('on', tabs[i].getAttribute('data-tab') === name);
    }
    var views = document.querySelectorAll('.view');
    for (var j = 0; j < views.length; j++) {
      views[j].classList.toggle('on', views[j].id === 'view-' + name);
    }
  }

  function handleCardClick(ev) {
    var btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    var act = btn.getAttribute('data-act');
    var id = btn.getAttribute('data-id');
    if (act === 'view') {
      state.selectedId = id;
      renderDetail();
      $('detailPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (act === 'edit') {
      startEdit(id);
    } else if (act === 'delete') {
      var idx = -1;
      for (var i = 0; i < state.parcels.length; i++) {
        if (state.parcels[i].id === id) { idx = i; break; }
      }
      if (idx === -1) return;
      if (window.confirm(t('confirmDelete'))) {
        state.parcels.splice(idx, 1);
        if (state.selectedId === id) state.selectedId = null;
        if (state.editingId === id) resetForm();
        save();
        renderAll();
        showMsg($('formMsg'), t('deleted'), false);
      }
    } else if (act === 'transition') {
      var to = btn.getAttribute('data-to');
      for (var k = 0; k < state.parcels.length; k++) {
        if (state.parcels[k].id === id) {
          var next = L.applyTransition(state.parcels[k], to, new Date().toISOString());
          if (next) {
            state.parcels[k] = next;
            save();
            renderAll();
          }
          break;
        }
      }
    }
  }

  function init() {
    load();
    document.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-tab'));
      });
    });
    $('langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      save();
      renderAll();
    });
    $('parcelList').addEventListener('click', handleCardClick);
    $('detailPanel').addEventListener('click', handleCardClick);
    $('qSearch').addEventListener('input', function () {
      state.filter.query = $('qSearch').value;
      renderList();
    });
    $('btnClearSearch').addEventListener('click', function () {
      $('qSearch').value = '';
      state.filter.query = '';
      renderList();
    });
    $('fCourierFilter').addEventListener('change', function () {
      state.filter.courier = $('fCourierFilter').value;
      renderList();
    });
    $('fSort').addEventListener('change', function () {
      state.sort = $('fSort').value;
      renderList();
    });
    $('statusChips').addEventListener('click', function (ev) {
      var chip = ev.target.closest('button[data-status]');
      if (!chip) return;
      state.filter.status = chip.getAttribute('data-status');
      renderStatic();
      renderList();
    });
    $('btnCancelEdit').addEventListener('click', resetForm);
    $('parcelForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = { trackingId: $('f-tracking').value,
        courier: $('f-courier').value, sender: $('f-sender').value,
        item: $('f-item').value, codText: $('f-cod').value,
        expectedDate: $('f-expected').value, note: $('f-note').value };
      var result = L.validateParcelInput(input, state.parcels, state.editingId);
      if (!result.ok) {
        var msgs = result.errors.map(function (code) {
          return t(ERR_KEY[code] || 'errTrackingRequired');
        });
        var box = $('formErrs');
        box.innerHTML = msgs.map(function (m) {
          return '<div>' + escapeHtml(m) + '</div>';
        }).join('');
        box.style.display = 'block';
        return;
      }
      if (state.editingId) {
        for (var i = 0; i < state.parcels.length; i++) {
          if (state.parcels[i].id === state.editingId) {
            var p = state.parcels[i];
            p.trackingId = result.cleaned.trackingId;
            p.courier = result.cleaned.courier;
            p.sender = result.cleaned.sender;
            p.item = result.cleaned.item;
            p.codPaisa = result.cleaned.codPaisa;
            p.expectedDate = result.cleaned.expectedDate;
            p.note = result.cleaned.note;
            p.updatedAt = new Date().toISOString();
            break;
          }
        }
        showMsg($('formMsg'), t('updated'), false);
      } else {
        state.parcels.push(L.createParcel(result.cleaned, new Date().toISOString()));
        showMsg($('formMsg'), t('saved'), false);
      }
      save();
      resetForm();
      renderAll();
    });
    $('btnExport').addEventListener('click', function () {
      if (state.parcels.length === 0) {
        showMsg($('dataMsg'), t('exportEmpty'), true);
        return;
      }
      var data = L.buildExport(state.parcels, new Date().toISOString());
      $('exportOut').value = JSON.stringify(data, null, 2);
      showMsg($('dataMsg'), t('exported'), false);
    });
    $('btnImport').addEventListener('click', function () {
      var raw = $('importText').value.trim();
      var parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      if (parsed === null) {
        showMsg($('dataMsg'), t('invalidImport'), true);
        return;
      }
      var result = L.validateImport(parsed);
      if (!result.ok) {
        showMsg($('dataMsg'), t('invalidImport'), true);
        return;
      }
      state.parcels = result.parcels;
      state.selectedId = null;
      state.editingId = null;
      save();
      renderAll();
      showMsg($('dataMsg'),
        t('imported').replace('{n}', String(result.parcels.length)), false);
    });
    $('eraseInput').addEventListener('input', function () {
      $('btnErase').disabled = $('eraseInput').value !== 'DELETE';
    });
    $('btnErase').addEventListener('click', function () {
      if ($('eraseInput').value !== 'DELETE') {
        showMsg($('dataMsg'), t('errDeleteWord'), true);
        return;
      }
      state.parcels = [];
      state.selectedId = null;
      state.editingId = null;
      $('eraseInput').value = '';
      $('btnErase').disabled = true;
      $('exportOut').value = '';
      $('importText').value = '';
      save();
      renderAll();
      showMsg($('dataMsg'), t('cleared'), false);
    });
    renderAll();
    window.__PT_READY = true;
    window.__PT_state = function () {
      return { asof: state.asof, lang: state.lang,
        count: state.parcels.length,
        dashboard: L.computeDashboard(state.parcels, state.asof) };
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
