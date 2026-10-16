import{P as C,Y as P,y as S,Z as x,q as O,e as L,l as j,u as B,M as U,L as Y,h as v,C as b,r as T,V as A,F as q}from"./index.esm2017-D8AndOHk.js";import"./index.esm2017-NLaV1adN.js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const y="analytics",K="firebase_id",W="origin",N=60*1e3,V="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",I="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d=new Y("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},u=new U("analytics","Analytics",H);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z(e){if(!e.startsWith(I)){const t=u.create("invalid-gtag-resource",{gtagURL:e});return d.warn(t.message),""}return e}function $(e){return Promise.all(e.map(t=>t.catch(n=>n)))}function J(e,t){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(e,t)),n}function Q(e,t){const n=J("firebase-js-sdk-policy",{createScriptURL:Z}),a=document.createElement("script"),i=`${I}?l=${e}&id=${t}`;a.src=n?n?.createScriptURL(i):i,a.async=!0,document.head.appendChild(a)}function X(e){let t=[];return Array.isArray(window[e])?t=window[e]:window[e]=t,t}async function ee(e,t,n,a,i,s){const r=a[i];try{if(r)await t[r];else{const c=(await $(n)).find(l=>l.measurementId===i);c&&await t[c.appId]}}catch(o){d.error(o)}e("config",i,s)}async function te(e,t,n,a,i){try{let s=[];if(i&&i.send_to){let r=i.send_to;Array.isArray(r)||(r=[r]);const o=await $(n);for(const c of r){const l=o.find(h=>h.measurementId===c),f=l&&t[l.appId];if(f)s.push(f);else{s=[];break}}}s.length===0&&(s=Object.values(t)),await Promise.all(s),e("event",a,i||{})}catch(s){d.error(s)}}function ne(e,t,n,a){async function i(s,...r){try{if(s==="event"){const[o,c]=r;await te(e,t,n,o,c)}else if(s==="config"){const[o,c]=r;await ee(e,t,n,a,o,c)}else if(s==="consent"){const[o,c]=r;e("consent",o,c)}else if(s==="get"){const[o,c,l]=r;e("get",o,c,l)}else if(s==="set"){const[o]=r;e("set",o)}else e(s,...r)}catch(o){d.error(o)}}return i}function ie(e,t,n,a,i){let s=function(...r){window[a].push(arguments)};return window[i]&&typeof window[i]=="function"&&(s=window[i]),window[i]=ne(s,e,t,n),{gtagCore:s,wrappedGtag:window[i]}}function ae(e){const t=window.document.getElementsByTagName("script");for(const n of Object.values(t))if(n.src&&n.src.includes(I)&&n.src.includes(e))return n;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const se=30,re=1e3;class oe{constructor(t={},n=re){this.throttleMetadata=t,this.intervalMillis=n}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,n){this.throttleMetadata[t]=n}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const k=new oe;function ce(e){return new Headers({Accept:"application/json","x-goog-api-key":e})}async function le(e){var t;const{appId:n,apiKey:a}=e,i={method:"GET",headers:ce(a)},s=V.replace("{app-id}",n),r=await fetch(s,i);if(r.status!==200&&r.status!==304){let o="";try{const c=await r.json();!((t=c.error)===null||t===void 0)&&t.message&&(o=c.error.message)}catch{}throw u.create("config-fetch-failed",{httpStatus:r.status,responseMessage:o})}return r.json()}async function de(e,t=k,n){const{appId:a,apiKey:i,measurementId:s}=e.options;if(!a)throw u.create("no-app-id");if(!i){if(s)return{measurementId:s,appId:a};throw u.create("no-api-key")}const r=t.getThrottleMetadata(a)||{backoffCount:0,throttleEndTimeMillis:Date.now()},o=new pe;return setTimeout(async()=>{o.abort()},N),z({appId:a,apiKey:i,measurementId:s},r,o,t)}async function z(e,{throttleEndTimeMillis:t,backoffCount:n},a,i=k){var s;const{appId:r,measurementId:o}=e;try{await ue(a,t)}catch(c){if(o)return d.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${c?.message}]`),{appId:r,measurementId:o};throw c}try{const c=await le(e);return i.deleteThrottleMetadata(r),c}catch(c){const l=c;if(!fe(l)){if(i.deleteThrottleMetadata(r),o)return d.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${l?.message}]`),{appId:r,measurementId:o};throw c}const f=Number((s=l?.customData)===null||s===void 0?void 0:s.httpStatus)===503?A(n,i.intervalMillis,se):A(n,i.intervalMillis),h={throttleEndTimeMillis:Date.now()+f,backoffCount:n+1};return i.setThrottleMetadata(r,h),d.debug(`Calling attemptFetch again in ${f} millis`),z(e,h,a,i)}}function ue(e,t){return new Promise((n,a)=>{const i=Math.max(t-Date.now(),0),s=setTimeout(n,i);e.addEventListener(()=>{clearTimeout(s),a(u.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function fe(e){if(!(e instanceof q)||!e.customData)return!1;const t=Number(e.customData.httpStatus);return t===429||t===500||t===503||t===504}class pe{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}async function he(e,t,n,a,i){if(i&&i.global){e("event",n,a);return}else{const s=await t,r=Object.assign(Object.assign({},a),{send_to:s});e("event",n,r)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function me(){if(S())try{await x()}catch(e){return d.warn(u.create("indexeddb-unavailable",{errorInfo:e?.toString()}).message),!1}else return d.warn(u.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function ge(e,t,n,a,i,s,r){var o;const c=de(e);c.then(p=>{n[p.measurementId]=p.appId,e.options.measurementId&&p.measurementId!==e.options.measurementId&&d.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${p.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(p=>d.error(p)),t.push(c);const l=me().then(p=>{if(p)return a.getId()}),[f,h]=await Promise.all([c,l]);ae(s)||Q(s,f.measurementId),i("js",new Date);const g=(o=r?.config)!==null&&o!==void 0?o:{};return g[W]="firebase",g.update=!0,h!=null&&(g[K]=h),i("config",f.measurementId,g),f.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ye{constructor(t){this.app=t}_delete(){return delete m[this.app.options.appId],Promise.resolve()}}let m={},M=[];const D={};let w="dataLayer",we="gtag",E,G,R=!1;function Ie(){const e=[];if(C()&&e.push("This is a browser extension environment."),P()||e.push("Cookies are not available."),e.length>0){const t=e.map((a,i)=>`(${i+1}) ${a}`).join(" "),n=u.create("invalid-analytics-context",{errorInfo:t});d.warn(n.message)}}function ve(e,t,n){Ie();const a=e.options.appId;if(!a)throw u.create("no-app-id");if(!e.options.apiKey)if(e.options.measurementId)d.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw u.create("no-api-key");if(m[a]!=null)throw u.create("already-exists",{id:a});if(!R){X(w);const{wrappedGtag:s,gtagCore:r}=ie(m,M,D,w,we);G=s,E=r,R=!0}return m[a]=ge(e,M,D,t,E,w,n),new ye(e)}function Ee(e=j()){e=O(e);const t=L(e,y);return t.isInitialized()?t.getImmediate():be(e)}function be(e,t={}){const n=L(e,y);if(n.isInitialized()){const i=n.getImmediate();if(B(t,n.getOptions()))return i;throw u.create("already-initialized")}return n.initialize({options:t})}async function Re(){if(C()||!P()||!S())return!1;try{return await x()}catch{return!1}}function Te(e,t,n,a){e=O(e),he(G,m[e.app.options.appId],t,n,a).catch(i=>d.error(i))}const F="@firebase/analytics",_="0.10.8";function Ae(){v(new b(y,(t,{options:n})=>{const a=t.getProvider("app").getImmediate(),i=t.getProvider("installations-internal").getImmediate();return ve(a,i,n)},"PUBLIC")),v(new b("analytics-internal",e,"PRIVATE")),T(F,_),T(F,_,"esm2017");function e(t){try{const n=t.getProvider(y).getImmediate();return{logEvent:(a,i,s)=>Te(n,a,i,s)}}catch(n){throw u.create("interop-component-reg-failed",{reason:n})}}}Ae();export{Ee as getAnalytics,be as initializeAnalytics,Re as isSupported,Te as logEvent};
