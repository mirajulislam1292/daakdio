import {createClient} from 'npm:@supabase/supabase-js@2.99.1';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 try{
  const raw=await req.text();if(raw.length>12000)return json({error:'Request too large'},413);
  const body=JSON.parse(raw);const action=body.action;
  if(['host_photos','delete_photo','host_upload','host_complete_upload','feature_photo'].includes(action)){
   const jwt=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!jwt)return json({error:'Please sign in.'},401);
   const {data:{user},error:authError}=await admin.auth.getUser(jwt);if(authError||!user)return json({error:'Please sign in again.'},401);
   if(typeof body.event_id!=='string')return json({error:'Invalid event'},400);
   const {data:event}=await admin.from('dd_events').select('id').eq('id',body.event_id).eq('owner_id',user.id).maybeSingle();if(!event)return json({error:'Event not found'},404);
   if(action==='feature_photo'){
    if(typeof body.featured!=='boolean')return json({error:'Invalid selection'},400);
    const {data,error}=await admin.from('dd_photos').update({featured:body.featured}).eq('id',body.id).eq('event_id',event.id).eq('ready',true).select('id').maybeSingle();if(error)return json({error:'Choose up to three invitation photos.'},409);if(!data)return json({error:'Photo not found'},404);return json({ok:true});
   }
   if(action==='host_upload'){
    if(!Number.isInteger(body.size)||body.size<1||body.size>10485760||!['image/jpeg','image/png','image/webp'].includes(body.type)||typeof body.name!=='string'||body.name.length>200)return json({error:'Use JPG, PNG or WebP, up to 10 MB each.'},400);
    const id=crypto.randomUUID();const ext=body.type==='image/jpeg'?'jpg':body.type==='image/png'?'png':'webp';const path=`${event.id}/${id}.${ext}`;
    const {error}=await admin.from('dd_photos').insert({id,event_id:event.id,guest_id:null,name:body.name,path,size:10485760,mime:body.type});if(error)return json({error:'Album capacity reached.'},409);
    const {data,error:signedError}=await admin.storage.from('daakdio-albums').createSignedUploadUrl(path);if(signedError){await admin.from('dd_photos').delete().eq('id',id);throw signedError}return json({id,path,token:data.token});
   }
   if(action==='host_complete_upload'){
    const {data:photo}=await admin.from('dd_photos').select('id,path,mime,ready').eq('id',body.id).eq('event_id',event.id).is('guest_id',null).maybeSingle();if(!photo)return json({error:'Upload not found'},404);if(photo.ready)return json({ok:true});
    const {data:file,error}=await admin.storage.from('daakdio-albums').download(photo.path);if(error||!file)return json({error:'Upload has not completed.'},400);
    const b=new Uint8Array(await file.slice(0,16).arrayBuffer());const valid=photo.mime==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:photo.mime==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v):String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
    if(file.size>10485760||!valid){await admin.storage.from('daakdio-albums').remove([photo.path]);await admin.from('dd_photos').delete().eq('id',photo.id);return json({error:'Unsupported photo.'},400)}
    const {error:saveError}=await admin.from('dd_photos').update({ready:true,size:file.size}).eq('id',photo.id);if(saveError)throw saveError;return json({ok:true});
   }
   if(action==='delete_photo'){
    const {data:photo}=await admin.from('dd_photos').select('id,path').eq('id',body.id).eq('event_id',event.id).maybeSingle();if(!photo)return json({error:'Photo not found'},404);
    const {error}=await admin.storage.from('daakdio-albums').remove([photo.path]);if(error)throw error;
    const {error:del}=await admin.from('dd_photos').delete().eq('id',photo.id);if(del)throw del;return json({ok:true});
   }
   const {data:photos,error}=await admin.from('dd_photos').select('id,name,path,size,created_at,featured').eq('event_id',event.id).eq('ready',true).order('created_at',{ascending:false});if(error)throw error;
   const result=await Promise.all((photos||[]).map(async(p)=>{const {data,error}=await admin.storage.from('daakdio-albums').createSignedUrl(p.path,900);if(error)throw error;return {id:p.id,name:p.name,size:p.size,created_at:p.created_at,featured:p.featured,url:data.signedUrl}}));return json({photos:result});
  }
  if(!['get','rsvp','upload','complete_upload','delete_own_photo'].includes(action))return json({error:'Unknown action'},400);
  if(typeof body.token!=='string'||!/^([a-f0-9]{64})$/.test(body.token))return json({error:'Invalid invitation link.'},404);
  const {data:guest,error}=await admin.from('dd_guests').select('id,event_id,name,max_party,relationship,personal_message,status,party_size,note,opened_at').eq('token',body.token).maybeSingle();if(error)throw error;if(!guest)return json({error:'Invitation not found.'},404);
  const {data:event,error:eventError}=await admin.from('dd_events').select('id,title,host_names,kind,event_date,venue,address,message,theme,language,published,album_enabled').eq('id',guest.event_id).eq('published',true).maybeSingle();if(eventError)throw eventError;if(!event)return json({error:'Your host has not published this invitation yet.'},404);
  if(new Date(event.event_date).getTime()+90*86400000<Date.now())return json({error:'This invitation has expired. Please contact your host.'},410);
  if(action==='get'){if(!guest.opened_at)await admin.from('dd_guests').update({opened_at:new Date().toISOString()}).eq('id',guest.id).is('opened_at',null);const {data:photos,error:photosError}=await admin.from('dd_photos').select('id,name,path').eq('event_id',event.id).eq('ready',true).eq('featured',true).limit(3);if(photosError)throw photosError;const gallery=await Promise.all((photos||[]).map(async p=>{const {data}=await admin.storage.from('daakdio-albums').createSignedUrl(p.path,3600);return {id:p.id,name:p.name,url:data?.signedUrl}}));return json({event,guest,photos:gallery});}
  if(action==='rsvp'){
   if(!['yes','no','maybe'].includes(body.status)||!Number.isInteger(body.party_size)||body.party_size<0||body.party_size>guest.max_party||(body.status==='yes'&&body.party_size<1)||typeof body.note!=='string'||body.note.length>500)return json({error:'Please check your reply and number of guests.'},400);
   const {error}=await admin.from('dd_guests').update({status:body.status,party_size:body.status==='yes'?body.party_size:0,note:body.note}).eq('id',guest.id);if(error)throw error;return json({ok:true});
  }
  if(!event.album_enabled)return json({error:'Photo uploads are not enabled for this event.'},403);
  if(action==='delete_own_photo'){
   const {data:photo}=await admin.from('dd_photos').select('id,path').eq('id',body.id).eq('guest_id',guest.id).eq('event_id',event.id).maybeSingle();if(!photo)return json({error:'Photo not found.'},404);
   const {error}=await admin.storage.from('daakdio-albums').remove([photo.path]);if(error)throw error;const {error:del}=await admin.from('dd_photos').delete().eq('id',photo.id);if(del)throw del;return json({ok:true});
  }
  if(action==='upload'){
   const {data:expired}=await admin.from('dd_photos').select('id,path').eq('event_id',event.id).eq('ready',false).lt('created_at',new Date(Date.now()-3*3600000).toISOString());
   if(expired?.length){const {error:cleanupError}=await admin.storage.from('daakdio-albums').remove(expired.map(p=>p.path));if(!cleanupError)await admin.from('dd_photos').delete().in('id',expired.map(p=>p.id));}

   if(!Number.isInteger(body.size)||body.size<1||body.size>10485760||!['image/jpeg','image/png','image/webp'].includes(body.type)||typeof body.name!=='string'||body.name.length>200)return json({error:'Use JPG, PNG or WebP, up to 10 MB each.'},400);
   const id=crypto.randomUUID();const ext=body.type==='image/jpeg'?'jpg':body.type==='image/png'?'png':'webp';const path=`${event.id}/${id}.${ext}`;
   const {error}=await admin.from('dd_photos').insert({id,event_id:event.id,guest_id:guest.id,name:body.name,path,size:10485760,mime:body.type});if(error)return json({error:'Album capacity reached. Please contact your host.'},409);
   const {data,error:signedError}=await admin.storage.from('daakdio-albums').createSignedUploadUrl(path);if(signedError){await admin.from('dd_photos').delete().eq('id',id);throw signedError}return json({id,path,token:data.token});
  }
  const {data:photo}=await admin.from('dd_photos').select('id,path,mime,ready').eq('id',body.id).eq('event_id',event.id).eq('guest_id',guest.id).maybeSingle();if(!photo)return json({error:'Upload not found.'},404);if(photo.ready)return json({ok:true});
  const {data:file,error:downloadError}=await admin.storage.from('daakdio-albums').download(photo.path);if(downloadError||!file)return json({error:'Upload has not completed. Try again.'},400);
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());const isJpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const isPng=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);const isWebp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(file.size>10485760||!(photo.mime==='image/jpeg'?isJpg:photo.mime==='image/png'?isPng:isWebp)){await admin.storage.from('daakdio-albums').remove([photo.path]);await admin.from('dd_photos').delete().eq('id',photo.id);return json({error:'The file is not a supported photo.'},400)}
  const {error:updateError}=await admin.from('dd_photos').update({ready:true,size:file.size}).eq('id',photo.id);if(updateError)throw updateError;const {data:signed}=await admin.storage.from('daakdio-albums').createSignedUrl(photo.path,300);return json({ok:true,download_url:signed?.signedUrl});
 }catch(error){console.error('DaakDio request failed',error instanceof Error?error.message:'Unknown error');return json({error:'Unable to complete this request. Please try again.'},500)}
});
