import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import { createHash } from "node:crypto";
import { json } from "./_shared/http";
import { withClient, secret,currentClient } from "../../integration-context.js";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const originalHandler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = secret("RESEND_API_KEY");
  const to = secret("CONTACT_TO_EMAIL");
  const from = secret("CONTACT_FROM_EMAIL");

  if (!apiKey || !to || !from) {
    return json(503, { error: "email_not_configured_for_business" });
  }

  if(Buffer.byteLength(event.body||'')>12000)return json(413,{error:'request_too_large'});
  let raw:ContactPayload;try{raw=JSON.parse(event.body||'{}');}catch{return json(400,{error:'invalid_request'});}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return json(400,{error:'invalid_request'});
  const payload={name:typeof raw.name==='string'?raw.name.trim():'',email:typeof raw.email==='string'?raw.email.trim():'',phone:typeof raw.phone==='string'?raw.phone.trim():'',message:typeof raw.message==='string'?raw.message.trim():''};
  if(payload.name.length<2||payload.name.length>120||/[\r\n]/.test(payload.name)||payload.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(payload.email)||payload.phone.length>50||payload.message.length<10||payload.message.length>5000)return json(400,{error:'invalid_fields'});

  const resend = new Resend(apiKey);
  const canonical=JSON.stringify(payload);
  const idempotencyKey=`contact-${currentClient().id}-${createHash('sha256').update(canonical+'|'+new Date().toISOString().slice(0,10)).digest('hex')}`;
  const {data,error}=await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `${currentClient().name} · website enquiry`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "-"}`,
      "",
      payload.message,
    ].join("\n"),
  },{idempotencyKey});
  if(error||typeof data?.id!=='string'||!data.id.trim())return json(502,{error:'email_not_confirmed'});

  return json(200, { ok: true,id:data.id });
};
export const handler: Handler = withClient(originalHandler, "contact");
