import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      navbar: {
        home: "Home",
        liveRadio: "Live Radio",
        liveVideo: "Live Video",
        podcasts: "Podcasts",
        news: "News",
        events: "Events",
        about: "About",
        contact: "Contact",
        admin: "Admin",
        logout: "Logout",
        language: "नेपाली"
      },
      home: {
        listenLive: "Listen Live",
        viewSchedule: "View Schedule"
      }
    }
  },
  ne: {
    translation: {
      navbar: {
        home: "गृहपृष्ठ",
        liveRadio: "प्रत्यक्ष रेडियो",
        liveVideo: "प्रत्यक्ष भिडियो",
        podcasts: "पोडकास्टहरू",
        news: "समाचार",
        events: "कार्यक्रमहरू",
        about: "हाम्रो बारेमा",
        contact: "सम्पर्क",
        admin: "प्रशासन",
        logout: "लगआउट",
        language: "English"
      },
      home: {
        listenLive: "प्रत्यक्ष सुन्नुहोस्",
        viewSchedule: "तालिका हेर्नुहोस्"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
