// Translation dictionary for the SBCMS system
export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    createComplaint: "Create Complaint",
    trackComplaint: "Track Complaint",
    complaintHistory: "Complaint History",
    announcements: "Announcements",
    rules: "Rules",
    leaderboard: "Leaderboard",
    profile: "Profile",
    withdrawPoints: "Withdraw Points",
    pointsHistory: "Points History",

    // Common UI
    home: "Home",
    login: "Login",
    register: "Register",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",

    // Complaint Related
    complaint: "Complaint",
    description: "Description",
    type: "Type",
    status: "Status",
    location: "Location",
    date: "Date",
    time: "Time",
    evidence: "Evidence",

    // Status
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    underReview: "Under Review",

    // Welcome Messages
    welcome: "Welcome",
    welcomeBack: "Welcome back",

    // Branding
    suratBrts: "Surat BRTS",
    complaintManagement: "Complaint Management",

    // Buttons
    thumbsUp: "👍",
    thumbsDown: "👎",
  },

  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    createComplaint: "शिकायत दर्ज करें",
    trackComplaint: "शिकायत ट्रैक करें",
    complaintHistory: "शिकायत इतिहास",
    announcements: "घोषणाएं",
    rules: "नियम",
    leaderboard: "लीडरबोर्ड",
    profile: "प्रोफाइल",
    withdrawPoints: "पॉइंट्स निकालें",
    pointsHistory: "पॉइंट्स इतिहास",

    // Common UI
    home: "होम",
    login: "लॉगिन",
    register: "पंजीकरण",
    submit: "जमा करें",
    cancel: "रद्द करें",
    save: "सहेजें",
    edit: "संपादित करें",
    delete: "मिटाएं",
    view: "देखें",
    back: "वापस",
    next: "अगला",
    previous: "पिछला",
    close: "बंद करें",

    // Complaint Related
    complaint: "शिकायत",
    description: "विवरण",
    type: "प्रकार",
    status: "स्थिति",
    location: "स्थान",
    date: "तारीख",
    time: "समय",
    evidence: "प्रमाण",

    // Status
    pending: "लंबित",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    underReview: "समीक्षाधीन",

    // Welcome Messages
    welcome: "स्वागत है",
    welcomeBack: "वापसी पर स्वागत है",

    // Branding
    suratBrts: "सूरत बीआरटीएस",
    complaintManagement: "शिकायत प्रबंधन",

    // Buttons
    thumbsUp: "👍",
    thumbsDown: "👎",
  },

  gu: {
    // Navigation
    dashboard: "ડેશબોર્ડ",
    createComplaint: "ફરિયાદ નોંધાવો",
    trackComplaint: "ફરિયાદ ટ્રેક કરો",
    complaintHistory: "ફરિયાદ ઇતિહાસ",
    announcements: "જાહેરાતો",
    rules: "નિયમો",
    leaderboard: "લીડરબોર્ડ",
    profile: "પ્રોફાઇલ",
    withdrawPoints: "પોઇન્ટ્સ કાઢો",
    pointsHistory: "પોઇન્ટ્સ ઇતિહાસ",

    // Common UI
    home: "હોમ",
    login: "લોગિન",
    register: "નોંધણી",
    submit: "સબમિટ કરો",
    cancel: "રદ કરો",
    save: "સેવ કરો",
    edit: "સંપાદિત કરો",
    delete: "કાઢી નાખો",
    view: "જુઓ",
    back: "પાછળ",
    next: "આગળ",
    previous: "પહેલાં",
    close: "બંધ કરો",

    // Complaint Related
    complaint: "ફરિયાદ",
    description: "વર્ણન",
    type: "પ્રકાર",
    status: "સ્થિતિ",
    location: "સ્થાન",
    date: "તારીખ",
    time: "સમય",
    evidence: "પુરાવા",

    // Status
    pending: "બાકી",
    approved: "મંજૂર",
    rejected: "નકારેલ",
    underReview: "સમીક્ષા હેઠળ",

    // Welcome Messages
    welcome: "સ્વાગત છે",
    welcomeBack: "પાછા સ્વાગત છે",

    // Branding
    suratBrts: "સુરત બીઆરટીએસ",
    complaintManagement: "ફરિયાદ વ્યવસ્થાપન",

    // Buttons
    thumbsUp: "👍",
    thumbsDown: "👎",
  },
};

export type TranslationKey = keyof typeof translations.en;
export type LanguageCode = keyof typeof translations;
