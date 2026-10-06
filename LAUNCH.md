# ডাক দিও — free pilot ও launch plan

Live site: https://daakdio.vercel.app
Sample invitation: https://daakdio.vercel.app/i/demo

## এখন যা তৈরি
- বাংলা/English interface, চারটি theme, live invitation editor ও session draft।
- ১১ সংখ্যার বাংলাদেশি phone-first account, OTP ছাড়া; ফেরত আসতে private access code, তিনটি event/account, ২০টি invitation/event।
- পরিবারভিত্তিক আলাদা গোপন link, RSVP, attendance count, CSV export, WhatsApp share।
- চারটি পৃথক Three.js world, scroll reveal, floating flowers/stars/figurines, animation pause, Google Maps ও calendar download।
- Private original-file album: ১০০ MB/event, ১০ MB/image, সর্বোচ্চ ১০০ ছবি/event।
- Host-only guest list; album থেকে সর্বোচ্চ ৩টি ছবি invitation-এ দেখানোর সুযোগ; database RLS, server-enforced quota, file validation।
- Paid package সম্পর্কে transparent “planned” pricing। কোনো payment বা paid AI চালু হয়নি।

## Hosting এবং database
Vercel project: daakdio. Production public; preview deployments protected.
Supabase: existing “mahim live”, project qaevcjvzttwmcgdryits.
নতুন free project তৈরি করা যায়নি: account-এর active free project limit পূর্ণ।
ডাক দিওর dd_events, dd_guests, dd_photos tables এবং private daakdio-albums bucket তৈরি করা হয়েছে। অন্য application-এর table/auth settings বদলানো হয়নি।
Frontend-এ শুধু publishable key থাকে। Service key শুধু Supabase Edge Function-এর environment-এ।

## Public pilot-এর আগে যা যাচাই/যোগ করতে হবে
1. নিজের মোবাইল নম্বর দিয়ে শুরু করুন। Access code download করে গোপনে রাখুন। OTP বা SMS recovery নেই; নম্বরের মালিকানা যাচাই হয় না।
2. নতুন ফোনভিত্তিক flow-তে SMTP লাগে না। পুরোনো email account দিয়ে login রাখা হয়েছে।
3. Owner dashboard থেকে একটি বাস্তব event বানিয়ে পরিচিত ৩–৫ জনকে link দিন।
4. Paid checkout-এর আগে bKash/Nagad merchant বা payment gateway, verified payment callback ও refund/support process লাগবে। কোনো secret chat-এ পাঠাবেন না।
5. বর্তমান writing suggestions template-based; actual AI rephrasing-এর জন্য provider access/budget পরে যুক্ত করতে হবে। AI provider unavailable হলেও manual editing চলবে।
6. Automated SMS, subscription billing, ZIP download ও self-service account deletion এই pilot-এ নেই।
7. Pilot storage সীমিত, permanent backup নয়। Event date-এর ৯০ দিন পরে public invitation/API access expires; storage নিজে থেকে delete হয় না। Retention policy, cleanup এবং larger storage plan দরকার হবে বড় launch-এর আগে।
8. Existing Supabase project-এ leaked-password protection disabled warning আছে। Existing app-এর settings বদলাইনি। Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## প্রথম সাত দিনের পরীক্ষা
- দিন ১: owner signup/login, নিজের একটি event, ৩–৫টি invitation, real mobile test।
- দিন ২–৩: ১০–১৫ জন potential customer এবং ৩ জন photographer/planner-কে demo দেখানো।
- দিন ৪–৫: অন্তত ৩টি বাস্তব আয়োজন, কোথায় আটকে যাচ্ছে এবং RSVP response বোঝা।
- দিন ৬–৭: কে টাকা দিতে চান, কত invitation লাগছে, support-এ কত সময় যাচ্ছে—এসব লিখে pricing final করা।
- Track: interested people → account → saved event → published event → first guest reply; photo upload failures এবং support time। Event/guest data আছে; আলাদা marketing analytics এখনও যুক্ত হয়নি।

## Revenue লক্ষ্য
প্রস্তাবিত ৳৭৯৯/event হলে মাসে ১০০টি paid event = ৳৭৯,৯০০ gross revenue। এটি demand বা profit-এর নিশ্চয়তা নয়। Payment fee, storage, support, marketing, tax এবং design খরচ বাদ যাবে। Paid package implementation ও pricing validation এখনও বাকি।
Recurring revenue-এর জন্য planner package পরে পরীক্ষা করা যেতে পারে। প্রথম সপ্তাহে লক্ষ্য: real usage এবং willingness to pay।

## নতুন সংস্করণের যাচাই
১৮টি API পরীক্ষা পাস: phone signup, duplicate rejection, wrong-code rejection, return login, number validation, owner event, personal note, RSVP, host photo upload/validation, private/featured photo boundaries এবং byte-for-byte original download। চারটি scene, mobile layout, scroll reveal ও pause browser-এ যাচাই।

## আগের সংস্করণের যাচাই
Production build pass. API integration tests: ১৩টি pass—personal invitation, invalid token denial, owner-only album authorization, RSVP bounds/persistence, anonymous table access denial, file validation, upload এবং SHA-256 মিলিয়ে byte-for-byte identical download। Database tests: owner sees own record, another user sees zero records, ২১তম guest rejected। Browser-এ বাংলা/English, studio, demo এবং live site যাচাই করা হয়েছে। Live invitation-এ browser দিয়ে RSVP submit করে database-এ ৩ জন ও test note মিলেছে। Disposable event ও photo মুছে দেওয়া হয়েছে।

## Local maintenance
`npm install` → `.env.example` থেকে `.env.local` → `npm run dev`.
`npm run build` produces dist/. Source dependency versions are pinned in package-lock.json.
Live frontend was uploaded as the locally built static output through Vercel. Future source edits must be rebuilt and deployed. No Git repository has been connected yet.
Database schema: database/schema.sql. Edge Function source: database/guest-function.ts.
