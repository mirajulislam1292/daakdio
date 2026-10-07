import {useState, type CSSProperties} from 'react';
import {ArrowDown, ArrowUpRight, Check, Flower2, Heart, Mail, Orbit, Play, ShieldCheck, Stars, Sun, Users, Camera} from 'lucide-react';
import {WorldCover, worldNames} from './Experience';
import {type Lang} from './lib';
import {sampleEvent, sampleGuest} from './demo';

type Props = {lang: Lang; t: (bn: string, en: string) => string; go: (path: string) => void; start?: () => void};
const collection = [
  {id: 'neel', bn: 'তারাভরা আকাশে, চিরদিনের গল্প।', en: 'A forever, under a sky full of stars.', label: 'CELESTIAL · CINEMATIC', icon: Orbit, colour: '#233851'},
  {id: 'bon', bn: 'ফুলে-পাতায় লেখা আপন কথাগুলো।', en: 'A love letter from a secret garden.', label: 'BOTANICAL · ROMANTIC', icon: Flower2, colour: '#78917a'},
  {id: 'alta', bn: 'চেনা রঙে, উৎসবের নতুন ছোঁয়া।', en: 'Familiar colours. A joyful new chapter.', label: 'BENGALI · FESTIVE', icon: Sun, colour: '#b65143'},
  {id: 'noor', bn: 'আলোয় আলোয় এক মায়ার নিমন্ত্রণ।', en: 'An invitation, softly written in light.', label: 'LUMINOUS · TIMELESS', icon: Stars, colour: '#b69760'},
];

export function ThemeCollection({lang, t, go}: Props) {
  return <div className="world-collection">{collection.map(({id, bn, en, label, icon: Icon}, i) => (
    <article className={`world-collection-item theme-${id}`} key={id}>
      <button className="collection-art" onClick={() => go(`/i/demo?theme=${id}`)} aria-label={t(`${worldNames[id].bn} দেখুন`, `Preview ${worldNames[id].en}`)}>
        <span className="collection-no">0{i + 1} / DAAKDIO</span>
        <span className="collection-ornament" aria-hidden="true"/>
        <span className="collection-symbol"><Icon strokeWidth={.65} aria-hidden="true"/></span>
        <span className="collection-title"><span lang="en">{label}</span><strong className="collection-name">{lang === 'bn' ? worldNames[id].bn : worldNames[id].en}</strong></span>
        <span className="collection-play"><Play size={11} fill="currentColor"/>{t('নিমন্ত্রণটি দেখুন', 'EXPLORE THIS WORLD')}</span>
      </button>
      <div className="collection-meta"><p>{lang === 'bn' ? bn : en}</p><button onClick={() => go(`/studio?theme=${id}`)}>{t('এই থিমে সাজাই', 'Make it mine')}<ArrowUpRight size={17}/></button></div>
    </article>
  ))}</div>;
}

export default function Home(props: Props) {
  const {t, lang, go, start} = props;
  const [theme, setTheme] = useState('neel');
  const [paused, setPaused] = useState(false);
  const previewEvent = {...sampleEvent(lang), theme};
  const features = [
    {icon: Mail, no: '01', title: t('সবার জন্য নয়। তাঁর জন্য।', 'Not just an invite. Their invite.'), text: t('নিজের নাম, আপন সম্বোধন আর আপনার লেখা ছোট্ট বার্তা। প্রত্যেক অতিথির জন্য আলাদা নিমন্ত্রণ।', 'Their name, a familiar greeting, and a little note from you. A personal invitation for each guest.')},
    {icon: Users, no: '02', title: t('কে আসছেন, এক নজরেই।', 'A little less guesswork.'), text: t('অতিথিরা লিংক থেকেই জানাবেন কতজন আসছেন। আপনার ড্যাশবোর্ডে গুছিয়ে থাকবে সব উত্তর।', 'Guests can reply right from their invitation. See who’s coming and how many, all in your dashboard.')},
    {icon: Camera, no: '03', title: t('মুহূর্তগুলো থাকুক কাছে।', 'Keep the moments close.'), text: t('অতিথিদের তোলা ছবি জমা হোক ব্যক্তিগত অ্যালবামে। পছন্দের তিনটি ছবি রাখুন নিমন্ত্রণেও।', 'Collect your guests’ original photos in a private album. Feature up to three favourites in the invitation.')},
  ];
  const questions = [
    [t('শুরু করতে কি টাকা লাগবে?', 'Does it cost anything to start?'), t('বর্তমান ফ্রি পাইলটে একটি অ্যাকাউন্টে ৩টি আয়োজন এবং প্রতি আয়োজনে ২০টি ব্যক্তিগত নিমন্ত্রণ তৈরি করতে পারবেন। এখন কোনো পেমেন্ট নেওয়া হয় না।', 'The free pilot includes 3 events per account and 20 personal invitations per event. No payments are collected during the pilot.')],
    [t('অতিথিদের কি অ্যাকাউন্ট খুলতে হবে?', 'Do my guests need an account?'), t('না। নিজের ব্যক্তিগত লিংক খুলেই তাঁরা নিমন্ত্রণ দেখতে এবং উপস্থিতির উত্তর দিতে পারবেন। লিংকটি যাঁর জন্য, শুধু তাঁর সঙ্গেই শেয়ার করুন।', 'No. Guests open their personal link to see the invitation and reply. Share each private link only with its intended guest.')],
    [t('বাংলা ও ইংরেজি—দুই ভাষাতেই হবে?', 'Can I make an invitation in either language?'), t('হ্যাঁ। কার্ড তৈরির সময় বাংলা অথবা ইংরেজি বেছে নিতে পারবেন। নাম, ঠিকানা ও নিমন্ত্রণের কথা নিজের মতো লিখুন।', 'Yes. Choose Bengali or English in the invitation studio, then write the names, venue, and message in your own words.')],
    [t('পরে আবার আমার আয়োজনে ফিরব কীভাবে?', 'How do I return to my events?'), t('প্রথমবার দেওয়া ব্যক্তিগত অ্যাক্সেস কোডটি নিরাপদে রাখুন। আপনার মোবাইল নম্বর ও এই কোড দিয়ে আবার ঢুকতে পারবেন। নম্বর যাচাই বা SMS দিয়ে কোড ফেরত পাওয়ার ব্যবস্থা নেই।', 'Keep the private access code given to you at signup. Use your phone number and code to return. Phone verification and SMS recovery are not available.')],
  ];

  return <div className="premium-home">
    <section className="home-v2" aria-labelledby="home-title">
      <div className="home-v2-copy">
        <span className="home-eyebrow"><span/>{t('আপন মানুষের জন্য, আপন করে', 'THOUGHTFULLY MADE. PERSONALLY YOURS.')}</span>
        <h1 id="home-title">{t('নিমন্ত্রণে থাকুক', 'An invitation.')}<br/>{t('একটুখানি', 'A little more')}<br/><em>{t('আপনার ছোঁয়া।', 'you.')}</em></h1>
        <p>{t('শুধু একটি লিংক নয়। প্রিয় মানুষের নামে খুলে যাক আপনার গল্পের ছোট্ট এক পৃথিবী। রং, আলো আর ভালোবাসায়—ডাকটা হোক আপন।', 'A little world that opens in their name. Filled with your story, your colours, and all the people who make a moment matter.')}</p>
        <div className="home-actions"><button className="button" onClick={start}>{t('আমার নিমন্ত্রণ সাজাই', 'Create my invitation')}<ArrowUpRight size={18}/></button><button className="home-demo" onClick={() => go(`/i/demo?theme=${theme}`)}><span><Play size={11} fill="currentColor"/></span>{t('একবার দেখে নিই', 'Experience a demo')}</button></div>
        <div className="home-promise"><span><Check size={14}/>{t('ফ্রি পাইলটে শুরু করুন', 'Free to begin')}</span><span><Check size={14}/>{t('বাংলা ও ইংরেজিতে', 'Bengali & English')}</span></div>
        <a className="hero-collection-link" href="#collections"><span className="little-rule"/>{t('চারটি থিম। অগণিত আপন গল্প।', 'FOUR WORLDS. ENDLESS LITTLE STORIES.')}<ArrowDown size={14}/></a>
      </div>
      <div className="hero-preview">
        <div className="preview-edition"><span>{t('নিমন্ত্রণের একটি ঝলক', 'A GLIMPSE OF YOUR INVITATION')}</span><span>EST. 2026</span></div>
        <div className="home-world">
          <div className="hero-orbit" aria-hidden="true"/>
          <WorldCover event={previewEvent} guest={sampleGuest(lang).name} mini paused={paused}/>
          <span className="personal-seal" aria-hidden="true"><Heart size={19} strokeWidth={1}/><span>{t('আপন করে', 'JUST FOR')}<br/>{t('ডাকুন', 'YOU')}</span></span>
          <button className="enter-world" onClick={() => go(`/i/demo?theme=${theme}`)}><Play size={12} fill="currentColor"/>{t('পুরো নিমন্ত্রণটি দেখুন', 'OPEN THE INVITATION')}<ArrowUpRight size={14}/></button>
        </div>
        <div className="preview-controls"><div className="theme-swatches" role="group" aria-label={t('নমুনার থিম বাছুন', 'Choose preview theme')}>{collection.map(item => <button key={item.id} style={{'--swatch': item.colour} as CSSProperties} aria-pressed={theme === item.id} aria-label={lang === 'bn' ? worldNames[item.id].bn : worldNames[item.id].en} onClick={() => setTheme(item.id)}><span/></button>)}</div><span className="preview-theme-name" aria-live="polite">{lang === 'bn' ? worldNames[theme].bn : worldNames[theme].en}</span><button className="preview-pause" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? t('অ্যানিমেশন চালু', 'Resume motion') : t('অ্যানিমেশন থামান', 'Pause motion')}</button></div>
      </div>
    </section>

    <div className="home-divider"><span className="occasion-label">{t('আনন্দের প্রতিটি উপলক্ষে', 'FOR EVERY KIND OF JOY')}</span>{[t('বিয়ে', 'Weddings'), t('গায়ে হলুদ', 'Holud'), t('জন্মদিন', 'Birthdays'), t('আরও কত আয়োজন', 'And all your little celebrations')].map(text => <span className="occasion" key={text}><i aria-hidden="true">✳</i>{text}</span>)}</div>

    <section id="collections" className="v2-collections" aria-labelledby="collection-heading">
      <div className="v2-section-head"><div><span className="home-eyebrow">{t('০১ — থিমের খাতায়', '01 — THE COLLECTION')}</span><h2 id="collection-heading">{t('আপনার গল্প, কোন রঙে?', 'Find your kind of beautiful.')}</h2></div><p>{t('চারটি আলাদা অনুভূতি। একটিতে নিশ্চয়ই খুঁজে পাবেন নিজের গল্পটা।', 'Four distinct worlds. One that feels a little more like you.')}</p></div>
      <ThemeCollection {...props}/>
    </section>

    <section className="thoughtful-section" aria-labelledby="thoughtful-heading"><div className="thoughtful-intro"><span className="home-eyebrow">{t('সুন্দর দেখায়। সুন্দর অনুভব হয়।', 'BEAUTIFUL TO OPEN. LOVELY TO KEEP.')}</span><h2 id="thoughtful-heading">{t('ছোট ছোট যত্নে,', 'The little things,')}<br/><em>{t('বড় হয়ে ওঠে আনন্দ।', 'beautifully considered.')}</em></h2><p>{t('নিমন্ত্রণ পাঠানো থেকে স্মৃতি জমিয়ে রাখা—আপনার আয়োজনের প্রয়োজনীয় সবকিছু, এক জায়গায়।', 'From the first invitation to the photos you’ll keep. Thoughtful details for a celebration that feels effortless.')}</p><span className="privacy-note"><ShieldCheck size={17}/>{t('ব্যক্তিগত লিংক · আয়োজকের নিয়ন্ত্রণে অ্যালবাম', 'Personal links · Host-managed albums')}</span></div><div className="thoughtful-features">{features.map(({icon: Icon, no, title, text}) => <article key={no}><span className="feature-icon"><Icon size={23} strokeWidth={1.3}/></span><div><span className="feature-index">{no}</span><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>

    <section id="how" className="v2-how" aria-labelledby="how-heading"><div><span className="home-eyebrow">{t('০২ — শুরুটা খুব সহজ', '02 — A SIMPLE BEGINNING')}</span><h2 id="how-heading">{t('তিনটি ছোট ধাপ।', 'Three little steps.')}<br/><em>{t('অনেকখানি আপন।', 'A whole lot of heart.')}</em></h2><button className="text-button how-start" onClick={start}>{t('চলুন, শুরু করি', 'Let’s make something lovely')}<ArrowUpRight size={18}/></button></div><div>{[
        [t('নিজের জায়গা তৈরি করুন', 'Make a space for your story'), t('মোবাইল নম্বর দিয়ে শুরু করুন। ব্যক্তিগত অ্যাক্সেস কোডটি নিরাপদে রেখে দিন।', 'Start with your phone number. Keep your private access code somewhere safe.')],
        [t('নিমন্ত্রণে নিজের ছোঁয়া রাখুন', 'Make it feel like you'), t('পছন্দের থিম, নাম, সময় আর আপনার কথায় সাজিয়ে নিন আয়োজন।', 'Choose a world, add the details, and write a few words from the heart.')],
        [t('প্রিয় মানুষগুলোকে ডাকুন', 'Invite your favourite people'), t('প্রত্যেকের নামে আলাদা লিংক পাঠান। তাঁদের উত্তর দেখুন নিজের ড্যাশবোর্ডে।', 'Share a personal link with each guest. Find their replies in your dashboard.')],
      ].map(([title, text], i) => <div className="v2-step" key={title}><span>{lang === 'bn' ? ['০১', '০২', '০৩'][i] : `0${i + 1}`}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>

    <section className="home-faq" aria-labelledby="faq-heading"><div><span className="home-eyebrow">{t('মনে যদি প্রশ্ন থাকে', 'A FEW THINGS YOU MIGHT WONDER')}</span><h2 id="faq-heading">{t('জেনে রাখুন।', 'Good to know.')}</h2></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="v2-closing"><span className="closing-flower" aria-hidden="true"><Flower2 size={42} strokeWidth={.8}/></span><span className="home-eyebrow">{t('আপন মানুষ। আপন নিমন্ত্রণ।', 'YOUR PEOPLE. YOUR LITTLE WORLD.')}</span><h2>{t('কিছু মানুষকে ছাড়া', 'Some moments need')}<br/><em>{t('আনন্দ অসম্পূর্ণ।', 'your favourite people.')}</em></h2><p>{t('সেই মানুষগুলোকে ডাকুন, একটু আপনার মতো করে।', 'Make them feel how much it means to have them there.')}</p><button className="button" onClick={start}>{t('তাঁদের ডাক দিই', 'Let’s invite them')}<ArrowUpRight size={18}/></button><small>{t('ফ্রি পাইলট · প্রতি আয়োজনে ২০টি ব্যক্তিগত নিমন্ত্রণ', 'FREE PILOT · 20 PERSONAL INVITATIONS PER EVENT')}</small></section>
  </div>;
}
