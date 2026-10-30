/**
 * ShetMitra Village Configuration
 * Primary default village: दोंदुडा (Donduda)
 * Users can also enter or choose any other village in Maharashtra.
 */

export const DEFAULT_VILLAGE = 'दोंदुडा (Donduda)';

export const POPULAR_VILLAGES = [
  'दोंदुडा (Donduda)',
  'वडगाव (Vadgaon)',
  'राहुरी (Rahuri)',
  'हिवरे बाजार (Hiware Bazar)',
  'शिरूर (Shirur)',
  'बारामती (Baramati)',
  'संगमनेर (Sangamner)',
  'इंदापूर (Indapur)',
  'जुन्नर (Junnar)',
  'फलटण (Phaltan)',
  'कराड (Karad)',
  'दौंड (Daund)',
  'सासवड (Saswad)',
];

// Standard Marathi work categories
export const WORK_CATEGORIES_LABOUR = [
  'फवारणी (Spraying)',
  'निंदण / खुरपणी (Weeding)',
  'कापूस वेचणी (Cotton Picking)',
  'पेरणी (Sowing)',
  'कापणी (Harvesting)',
  'ऊस शेतीची कामे (Sugarcane Work)',
  'कांदा लागवड व काढणी (Onion Work)',
  'सोयाबीन काढणी (Soybean Harvest)',
  'इतर शेतीची कामे (Other Farm Work)',
];

export const TRACTOR_EQUIPMENT_CATEGORIES = [
  'ट्रॅक्टर (४०-५० HP)',
  'नांगरणी (Ploughing)',
  'रोटाव्हेटर (Rotavator)',
  'पेरणी यंत्र (Seed Drill)',
  'फवारणी यंत्र (Tractor Sprayer)',
  'थ्रेशर मशीन (Thresher)',
  'ट्रॉली वाहतूक (Trolley Transport)',
  'इतर शेतीची अवजारे (Other Equipment)',
];

export const BULLOCK_WORK_CATEGORIES = [
  'नांगरणी (Ploughing)',
  'पेरणी / पाभर (Sowing with Tifhan)',
  'वखरणी (Harrowing)',
  'दाते मारणे (Intercultivation)',
  'बैलगाडी वाहतूक (Cart Transport)',
  'इतर पारंपरिक कामे (Traditional Farm Work)',
];

export const CROPS_LIST = [
  'कापूस (Cotton)',
  'सोयाबीन (Soybean)',
  'ऊस (Sugarcane)',
  'गहू (Wheat)',
  'कांदा (Onion)',
  'हरभरा (Gram)',
  'बाजरी (Bajra)',
  'मका (Maize)',
  'तूर (Tur)',
  'भाजीपाला (Vegetables)',
];

export const SEEDS_CATEGORIES = [
  'सोयाबीन बियाणे (उदा. JS-335, फुले संगम)',
  'कापूस बियाणे (BT Cotton)',
  'गहू बियाणे (Wheat Seeds)',
  'कांदा बियाणे (Onion Seeds)',
  'मका व बाजरी बियाणे (Maize & Bajra)',
  'भाजीपाला व मिरची बियाणे (Vegetable Seeds)',
  'हरभरा व डाळी बियाणे (Gram & Pulses)',
  'इतर प्रमाणित बियाणे (Other Certified Seeds)',
];

export const FERTILIZERS_CATEGORIES = [
  'सेंद्रिय गांडूळ खत (Vermicompost)',
  'शेणखत व कंपोस्ट (Farmyard Manure)',
  'डीएपी / युरिया (DAP / Urea)',
  '१०:२६:२६ / १२:३२:१६ खते (NPK Fertilizers)',
  'सूक्ष्म अन्नद्रव्ये व टॉनिक (Micronutrients)',
  'जैविक खते व जिवाणू संवर्धन (Bio-Fertilizers)',
  'निंबोळी पेंड (Neem Cake)',
];

export const AGRI_TOOLS_CATEGORIES = [
  'बॅटरी / चार्जिंग स्प्रे पंप (Battery Sprayer)',
  'ठिबक सिंचन साहित्य व ड्रिप (Drip Irrigation)',
  'पीव्हीसी पाईप व फिटिंग्ज (PVC Pipes)',
  'मल्चिंग पेपर (Mulching Paper)',
  'शेती ताडपत्री व कापड (Farm Tarpaulin)',
  'खुरपे, विळा व हात अवजारे (Hand Tools)',
  'सौर कुंपण / झटका मशीन (Zatka Machine)',
];

export const AGRI_SERVICES_CATEGORIES = [
  'ड्रोन फवारणी सेवा (Drone Spraying)',
  'कम्बाइन हार्वेस्टर कटाई (Combine Harvester)',
  'माती व पाणी परीक्षण (Soil & Water Testing)',
  'पिक सल्ला व कीडरोग निदान (Crop Advisory)',
  'सोलर वॉटर पंप देखभाल व दुरुस्ती (Solar Pump Service)',
  'शेती कुंपण व मोजणी (Farm Fencing & Survey)',
];

export const RATE_TYPES = [
  'प्रतिदिन',
  'प्रतितास',
  'प्रतिएकर',
  'कामानुसार',
  'प्रति बॅग',
  'प्रति किलो',
  'प्रति नग',
  'दर चर्चेनुसार',
] as const;
