/**
 * Internationalization (i18n) Service
 * Multi-language support: English (en) and Hindi (hi)
 * Simple key-based translation system
 */

export type Language = 'en' | 'hi';

export interface Translations {
    // Navigation
    nav_dashboard: string;
    nav_shipments: string;
    nav_documents: string;
    nav_tracking: string;
    nav_analytics: string;
    nav_team: string;
    nav_notifications: string;
    nav_settings: string;
    nav_logout: string;
    nav_audit_log: string;
    nav_hs_codes: string;
    nav_lc_management: string;
    nav_freight_calculator: string;

    // Dashboard
    dashboard_title: string;
    dashboard_subtitle: string;
    total_shipments: string;
    on_time_rate: string;
    delayed_shipments: string;
    avg_delivery_time: string;
    days: string;

    // Shipments
    shipment_id: string;
    client_name: string;
    destination: string;
    status: string;
    priority: string;
    deadline: string;
    assigned_to: string;
    create_shipment: string;
    shipment_details: string;
    container_number: string;
    shipment_date: string;

    // Documents
    upload_documents: string;
    document_type: string;
    document_status: string;
    verified: string;
    pending: string;
    missing: string;
    rejected: string;
    invoice: string;
    packing_list: string;
    bill_of_lading: string;
    shipping_bill: string;
    certificate_of_origin: string;
    insurance_papers: string;
    customs_files: string;

    // Status
    status_created: string;
    status_in_transit: string;
    status_delivered: string;
    status_delayed: string;
    status_customs_hold: string;
    status_under_review: string;

    // Actions
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    download: string;
    upload: string;
    submit: string;
    approve: string;
    reject: string;
    search: string;
    filter: string;
    export_pdf: string;
    sign_document: string;

    // Team
    team_members: string;
    invite_member: string;
    role: string;
    admin: string;
    manager: string;
    operations: string;
    viewer: string;

    // Notifications
    notifications_title: string;
    missing_docs_alert: string;
    deadline_reminder: string;
    approval_delay: string;
    mark_as_read: string;

    // AI Features
    ai_ocr_title: string;
    ai_compliance_title: string;
    ai_delay_prediction: string;
    ai_document_validator: string;
    confidence_score: string;

    // Freight Calculator
    freight_calculator: string;
    sea_freight: string;
    air_freight: string;
    road_freight: string;
    origin: string;
    destination_port: string;
    cargo_weight: string;
    cargo_value: string;
    calculate: string;
    total_cost: string;
    transit_days: string;

    // HS Codes
    hs_code_lookup: string;
    hs_code: string;
    export_policy: string;
    duty_rate: string;
    gst_rate: string;

    // LC Management
    letter_of_credit: string;
    lc_number: string;
    issuing_bank: string;
    advising_bank: string;
    expiry_date: string;
    discrepancy: string;

    // Audit Log
    audit_trail: string;
    action: string;
    performed_by: string;
    timestamp: string;
    severity: string;

    // General
    loading: string;
    no_data: string;
    error: string;
    success: string;
    confirm: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    page: string;
    of: string;
    results: string;
    all: string;
    none: string;
    yes: string;
    no: string;
}

const en: Translations = {
    nav_dashboard: 'Dashboard',
    nav_shipments: 'Shipments',
    nav_documents: 'Documents',
    nav_tracking: 'Tracking',
    nav_analytics: 'Analytics',
    nav_team: 'Team',
    nav_notifications: 'Notifications',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_audit_log: 'Audit Log',
    nav_hs_codes: 'HS Code Lookup',
    nav_lc_management: 'Letter of Credit',
    nav_freight_calculator: 'Freight Calculator',

    dashboard_title: 'Dashboard',
    dashboard_subtitle: 'Overview of your export operations',
    total_shipments: 'Total Shipments',
    on_time_rate: 'On-Time Rate',
    delayed_shipments: 'Delayed Shipments',
    avg_delivery_time: 'Avg. Delivery Time',
    days: 'days',

    shipment_id: 'Shipment ID',
    client_name: 'Client Name',
    destination: 'Destination',
    status: 'Status',
    priority: 'Priority',
    deadline: 'Deadline',
    assigned_to: 'Assigned To',
    create_shipment: 'Create Shipment',
    shipment_details: 'Shipment Details',
    container_number: 'Container Number',
    shipment_date: 'Shipment Date',

    upload_documents: 'Upload Documents',
    document_type: 'Document Type',
    document_status: 'Document Status',
    verified: 'Verified',
    pending: 'Pending',
    missing: 'Missing',
    rejected: 'Rejected',
    invoice: 'Invoice',
    packing_list: 'Packing List',
    bill_of_lading: 'Bill of Lading',
    shipping_bill: 'Shipping Bill',
    certificate_of_origin: 'Certificate of Origin',
    insurance_papers: 'Insurance Papers',
    customs_files: 'Customs Files',

    status_created: 'Shipment Created',
    status_in_transit: 'In Transit',
    status_delivered: 'Delivered',
    status_delayed: 'Delayed',
    status_customs_hold: 'Customs Hold',
    status_under_review: 'Under Review',

    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    submit: 'Submit',
    approve: 'Approve',
    reject: 'Reject',
    search: 'Search',
    filter: 'Filter',
    export_pdf: 'Export PDF',
    sign_document: 'Sign Document',

    team_members: 'Team Members',
    invite_member: 'Invite Member',
    role: 'Role',
    admin: 'Admin',
    manager: 'Manager',
    operations: 'Operations',
    viewer: 'Viewer',

    notifications_title: 'Notifications',
    missing_docs_alert: 'Missing Documents Alert',
    deadline_reminder: 'Deadline Reminder',
    approval_delay: 'Approval Delay',
    mark_as_read: 'Mark as Read',

    ai_ocr_title: 'AI Document Extraction',
    ai_compliance_title: 'AI Compliance Copilot',
    ai_delay_prediction: 'AI Delay Prediction',
    ai_document_validator: 'AI Document Validator',
    confidence_score: 'Confidence Score',

    freight_calculator: 'Freight Calculator',
    sea_freight: 'Sea Freight',
    air_freight: 'Air Freight',
    road_freight: 'Road Freight',
    origin: 'Origin',
    destination_port: 'Destination',
    cargo_weight: 'Cargo Weight (kg)',
    cargo_value: 'Cargo Value (USD)',
    calculate: 'Calculate',
    total_cost: 'Total Cost',
    transit_days: 'Transit Days',

    hs_code_lookup: 'HS Code Lookup',
    hs_code: 'HS Code',
    export_policy: 'Export Policy',
    duty_rate: 'Duty Rate',
    gst_rate: 'GST Rate',

    letter_of_credit: 'Letter of Credit',
    lc_number: 'LC Number',
    issuing_bank: 'Issuing Bank',
    advising_bank: 'Advising Bank',
    expiry_date: 'Expiry Date',
    discrepancy: 'Discrepancy',

    audit_trail: 'Audit Trail',
    action: 'Action',
    performed_by: 'Performed By',
    timestamp: 'Timestamp',
    severity: 'Severity',

    loading: 'Loading...',
    no_data: 'No data available',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    page: 'Page',
    of: 'of',
    results: 'results',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
};

const hi: Translations = {
    nav_dashboard: 'डैशबोर्ड',
    nav_shipments: 'शिपमेंट',
    nav_documents: 'दस्तावेज़',
    nav_tracking: 'ट्रैकिंग',
    nav_analytics: 'विश्लेषण',
    nav_team: 'टीम',
    nav_notifications: 'सूचनाएं',
    nav_settings: 'सेटिंग्स',
    nav_logout: 'लॉगआउट',
    nav_audit_log: 'ऑडिट लॉग',
    nav_hs_codes: 'HS कोड खोज',
    nav_lc_management: 'साख पत्र',
    nav_freight_calculator: 'माल भाड़ा कैलकुलेटर',

    dashboard_title: 'डैशबोर्ड',
    dashboard_subtitle: 'आपके निर्यात संचालन का अवलोकन',
    total_shipments: 'कुल शिपमेंट',
    on_time_rate: 'समय पर दर',
    delayed_shipments: 'विलंबित शिपमेंट',
    avg_delivery_time: 'औसत डिलीवरी समय',
    days: 'दिन',

    shipment_id: 'शिपमेंट आईडी',
    client_name: 'ग्राहक का नाम',
    destination: 'गंतव्य',
    status: 'स्थिति',
    priority: 'प्राथमिकता',
    deadline: 'समय सीमा',
    assigned_to: 'सौंपा गया',
    create_shipment: 'शिपमेंट बनाएं',
    shipment_details: 'शिपमेंट विवरण',
    container_number: 'कंटेनर नंबर',
    shipment_date: 'शिपमेंट तिथि',

    upload_documents: 'दस्तावेज़ अपलोड करें',
    document_type: 'दस्तावेज़ प्रकार',
    document_status: 'दस्तावेज़ स्थिति',
    verified: 'सत्यापित',
    pending: 'लंबित',
    missing: 'गायब',
    rejected: 'अस्वीकृत',
    invoice: 'चालान',
    packing_list: 'पैकिंग सूची',
    bill_of_lading: 'बिल ऑफ लेडिंग',
    shipping_bill: 'शिपिंग बिल',
    certificate_of_origin: 'उत्पत्ति प्रमाण पत्र',
    insurance_papers: 'बीमा कागजात',
    customs_files: 'सीमा शुल्क फाइलें',

    status_created: 'शिपमेंट बनाया गया',
    status_in_transit: 'पारगमन में',
    status_delivered: 'डिलीवर किया गया',
    status_delayed: 'विलंबित',
    status_customs_hold: 'सीमा शुल्क रोक',
    status_under_review: 'समीक्षाधीन',

    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    download: 'डाउनलोड',
    upload: 'अपलोड',
    submit: 'जमा करें',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    export_pdf: 'PDF निर्यात करें',
    sign_document: 'दस्तावेज़ पर हस्ताक्षर करें',

    team_members: 'टीम सदस्य',
    invite_member: 'सदस्य आमंत्रित करें',
    role: 'भूमिका',
    admin: 'व्यवस्थापक',
    manager: 'प्रबंधक',
    operations: 'संचालन',
    viewer: 'दर्शक',

    notifications_title: 'सूचनाएं',
    missing_docs_alert: 'गायब दस्तावेज़ अलर्ट',
    deadline_reminder: 'समय सीमा अनुस्मारक',
    approval_delay: 'अनुमोदन विलंब',
    mark_as_read: 'पढ़ा हुआ चिह्नित करें',

    ai_ocr_title: 'AI दस्तावेज़ निष्कर्षण',
    ai_compliance_title: 'AI अनुपालन सहायक',
    ai_delay_prediction: 'AI विलंब पूर्वानुमान',
    ai_document_validator: 'AI दस्तावेज़ सत्यापनकर्ता',
    confidence_score: 'विश्वास स्कोर',

    freight_calculator: 'माल भाड़ा कैलकुलेटर',
    sea_freight: 'समुद्री माल',
    air_freight: 'हवाई माल',
    road_freight: 'सड़क माल',
    origin: 'उत्पत्ति',
    destination_port: 'गंतव्य',
    cargo_weight: 'माल का वजन (किग्रा)',
    cargo_value: 'माल का मूल्य (USD)',
    calculate: 'गणना करें',
    total_cost: 'कुल लागत',
    transit_days: 'पारगमन दिन',

    hs_code_lookup: 'HS कोड खोज',
    hs_code: 'HS कोड',
    export_policy: 'निर्यात नीति',
    duty_rate: 'शुल्क दर',
    gst_rate: 'GST दर',

    letter_of_credit: 'साख पत्र',
    lc_number: 'LC नंबर',
    issuing_bank: 'जारीकर्ता बैंक',
    advising_bank: 'सलाहकार बैंक',
    expiry_date: 'समाप्ति तिथि',
    discrepancy: 'विसंगति',

    audit_trail: 'ऑडिट ट्रेल',
    action: 'कार्रवाई',
    performed_by: 'द्वारा किया गया',
    timestamp: 'समय',
    severity: 'गंभीरता',

    loading: 'लोड हो रहा है...',
    no_data: 'कोई डेटा उपलब्ध नहीं',
    error: 'त्रुटि',
    success: 'सफलता',
    confirm: 'पुष्टि करें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    page: 'पृष्ठ',
    of: 'का',
    results: 'परिणाम',
    all: 'सभी',
    none: 'कोई नहीं',
    yes: 'हाँ',
    no: 'नहीं',
};

const translations: Record<Language, Translations> = { en, hi };

const LANG_STORAGE_KEY = 'exportrack_language';

export function getCurrentLanguage(): Language {
    try {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (stored === 'en' || stored === 'hi') return stored;
    } catch { /* ignore */ }
    return 'en';
}

export function setLanguage(lang: Language): void {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch { /* ignore */ }
}

export function t(key: keyof Translations, lang?: Language): string {
    const currentLang = lang || getCurrentLanguage();
    return translations[currentLang][key] || translations['en'][key] || key;
}

export function getTranslations(lang?: Language): Translations {
    return translations[lang || getCurrentLanguage()];
}

export const LANGUAGE_OPTIONS: { value: Language; label: string; nativeLabel: string }[] = [
    { value: 'en', label: 'English', nativeLabel: 'English' },
    { value: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
];
