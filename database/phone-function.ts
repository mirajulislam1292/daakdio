import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type,apikey,authorization,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const url=Deno.env.get('SUPABASE_URL')!;const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const reply=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers});
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('')}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
  const raw=await req.text();if(raw.length>2048)return reply({error:'Invalid request'},400);const b=JSON.parse(raw);
  const phone=String(b.phone||'').replace(/[০-৯]/g,(d:string)=>String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[\s-]/g,'').replace(/^\+?880/,'0');
  if(!/^01[3-9][0-9]{8}$/.test(phone))return reply({error:'বাংলাদেশি ১১ সংখ্যার নম্বর দিন: 01XXXXXXXXX'},400);
  if(!['register','login'].includes(b.action))return reply({error:'Invalid action'},400);
  const phoneHash=await hash('daakdio-phone-v1:'+phone);const ipHash=await hash('dd-rate:'+(req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'));
  const limits=await Promise.all([admin.rpc('dd_take_auth_slot',{p_key:'ip:'+ipHash,p_limit:20,p_seconds:600}),admin.rpc('dd_take_auth_slot',{p_key:'phone:'+phoneHash,p_limit:8,p_seconds:600})]);
  if(limits.some(r=>r.error||r.data!==true))return reply({error:'অনেকবার চেষ্টা হয়েছে। ১০ মিনিট পরে আবার চেষ্টা করুন।'},429);
  const email=phoneHash+'@accounts.daakdio.invalid';
  const {data:account,error:lookupError}=await admin.from('dd_phone_accounts').select('owner_id').eq('phone_hash',phoneHash).maybeSingle();if(lookupError)throw lookupError;
  let code=String(b.code||'').replace(/[\s-]/g,'');let owner:string|undefined;
  if(b.action==='register'){
   if(account)return reply({error:'এই নম্বরের account আছে। আপনার access code দিয়ে প্রবেশ করুন।',existing:true},409);
   const {data:slot,error:rateError}=await admin.rpc('dd_take_auth_slot',{p_key:'registrations:'+new Date().toISOString().slice(0,10),p_limit:50,p_seconds:86400});if(rateError||!slot)return reply({error:'আজকের pilot signup সীমা পূর্ণ। আগামীকাল চেষ্টা করুন।'},429);
   code=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(n=>n.toString(16).padStart(2,'0')).join('');
   // This is an internal login identifier, not a verified email/phone identity.
   // We do not mark the supplied phone as verified or use it for recovery.
   const {data,error}=await admin.auth.admin.createUser({email,password:code,email_confirm:true,app_metadata:{daakdio_phone_unverified:true},user_metadata:{daakdio_phone_hint:phone.slice(-4)}});
   if(error||!data.user)return reply({error:'Account তৈরি করা যায়নি। নম্বরটি আগে ব্যবহার করলে access code দিয়ে প্রবেশ করুন।'},409);owner=data.user.id;
   const {error:insertError}=await admin.from('dd_phone_accounts').insert({phone_hash:phoneHash,owner_id:owner});if(insertError){await admin.auth.admin.deleteUser(owner);return reply({error:'Account তৈরি করা যায়নি। আবার চেষ্টা করুন।'},409)}
  }else if(!account||!/^[a-f0-9]{32}$/.test(code)){return reply({error:'নম্বর বা access code সঠিক নয়।'},401)}
  const client=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await client.auth.signInWithPassword({email,password:code});if(error||!data.session){if(owner){await admin.from('dd_phone_accounts').delete().eq('owner_id',owner);await admin.auth.admin.deleteUser(owner)}return reply({error:'নম্বর বা access code সঠিক নয়।'},401)}
  return reply({session:{access_token:data.session.access_token,refresh_token:data.session.refresh_token},...(b.action==='register'?{access_code:code}:{}),phone_verified:false});
 }catch{return reply({error:'এখন প্রবেশ করা যাচ্ছে না। আবার চেষ্টা করুন।'},500)}
});
