import {demoEvent, type Event, type Lang} from './lib';

/** Localized sample content only; saved invitations keep their chosen language. */
export function sampleEvent(lang: Lang): Event {
  if (lang === 'bn') return {...demoEvent};
  return {
    ...demoEvent,
    language: 'en',
    title: 'Our wedding',
    host_names: 'Arib & Mehrin',
    venue: 'Senamaloncha',
    address: 'Dhaka Cantonment, Dhaka',
    message: 'As we begin a new chapter of our lives, we would love to have you by our side. Your presence will make our celebration complete.',
  };
}

export function sampleGuest(lang: Lang) {
  return lang === 'bn'
    ? {name: 'জনাব করিম ও পরিবারবর্গ', personal_message: 'এই বিশেষ দিনটিতে আপনাকে পাশে পাওয়ার আনন্দটাই অন্যরকম। আমাদের নতুন গল্পের সাক্ষী হবেন আপনি।'}
    : {name: 'Mr. Karim & family', personal_message: 'Having you beside us on this special day means so much. We would love you to be part of our new story.'};
}
