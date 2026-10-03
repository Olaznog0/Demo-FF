import type { Handler } from '@netlify/functions';
import { withClient,currentClient } from '../../integration-context.js';
import { getPlace } from '../../place-adapter.js';
import {googleApiKey} from '../../google-business.js';
const response=(statusCode:number,data:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
export const handler:Handler=withClient(async(event)=>{
 if(event.httpMethod!=='GET')return response(405,{error:'method_not_allowed'});
 const client=currentClient();const lang=event.queryStringParameters?.lang||client.languages[0];
 if(!client.google.enabled||!(client.google.placeId||client.google.resolvePlaceId||(client.id==='ff'?process.env.GOOGLE_PLACE_ID:''))||!googleApiKey(client))return response(503,{error:'integration_not_configured'});
 try{return response(200,await getPlace(client,lang));}catch{return response(502,{error:'google_unavailable'});}
},'photos');
