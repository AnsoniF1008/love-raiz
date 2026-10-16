import{M as J,e as $,q as Q,l as Z,T as E,U as ee,V as te,W as re,L as ne,y as B,X as oe,h as y,C as I,r as ie}from"./index.esm2017-D8AndOHk.js";/**
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
 */const b=new Map,H={activated:!1,tokenObservers:[]},se={initialized:!1,enabled:!1};function l(e){return b.get(e)||Object.assign({},H)}function ae(e,t){return b.set(e,t),b.get(e)}function m(){return se}/**
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
 */const L="https://content-firebaseappcheck.googleapis.com/v1",ce="exchangeRecaptchaV3Token",le="exchangeDebugToken",D={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:16*60*1e3},ue=24*60*60*1e3;/**
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
 */class de{constructor(t,r,n,o,i){if(this.operation=t,this.retryPolicy=r,this.getWaitDuration=n,this.lowerBound=o,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=o,o>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(t){this.stop();try{this.pending=new E,this.pending.promise.catch(r=>{}),await he(this.getNextRun(t)),this.pending.resolve(),await this.pending.promise,this.pending=new E,this.pending.promise.catch(r=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(r){this.retryPolicy(r)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(t){if(t)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const r=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),r}}}function he(e){return new Promise(t=>{setTimeout(t,e)})}/**
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
 */const fe={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.",throttled:"Requests throttled due to {$httpStatus} error. Attempts allowed again after {$time}"},u=new J("appCheck","AppCheck",fe);/**
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
 */function S(e=!1){var t;return e?(t=self.grecaptcha)===null||t===void 0?void 0:t.enterprise:self.grecaptcha}function A(e){if(!l(e).activated)throw u.create("use-before-activation",{appName:e.name})}function F(e){const t=Math.round(e/1e3),r=Math.floor(t/(3600*24)),n=Math.floor((t-r*3600*24)/3600),o=Math.floor((t-r*3600*24-n*3600)/60),i=t-r*3600*24-n*3600-o*60;let s="";return r&&(s+=k(r)+"d:"),n&&(s+=k(n)+"h:"),s+=k(o)+"m:"+k(i)+"s",s}function k(e){return e===0?"00":e>=10?e.toString():"0"+e}/**
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
 */async function _({url:e,body:t},r){const n={"Content-Type":"application/json"},o=r.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&(n["X-Firebase-Client"]=d)}const i={method:"POST",body:JSON.stringify(t),headers:n};let s;try{s=await fetch(e,i)}catch(d){throw u.create("fetch-network-error",{originalErrorMessage:d?.message})}if(s.status!==200)throw u.create("fetch-status-error",{httpStatus:s.status});let c;try{c=await s.json()}catch(d){throw u.create("fetch-parse-error",{originalErrorMessage:d?.message})}const a=c.ttl.match(/^([\d.]+)(s)$/);if(!a||!a[2]||isNaN(Number(a[1])))throw u.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${c.ttl}`});const f=Number(a[1])*1e3,R=Date.now();return{token:c.token,expireTimeMillis:R+f,issuedAtTimeMillis:R}}function ge(e,t){const{projectId:r,appId:n,apiKey:o}=e.options;return{url:`${L}/projects/${r}/apps/${n}:${ce}?key=${o}`,body:{recaptcha_v3_token:t}}}function K(e,t){const{projectId:r,appId:n,apiKey:o}=e.options;return{url:`${L}/projects/${r}/apps/${n}:${le}?key=${o}`,body:{debug_token:t}}}/**
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
 */const pe="firebase-app-check-database",ke=1,g="firebase-app-check-store",z="debug-token";let T=null;function W(){return T||(T=new Promise((e,t)=>{try{const r=indexedDB.open(pe,ke);r.onsuccess=n=>{e(n.target.result)},r.onerror=n=>{var o;t(u.create("storage-open",{originalErrorMessage:(o=n.target.error)===null||o===void 0?void 0:o.message}))},r.onupgradeneeded=n=>{const o=n.target.result;switch(n.oldVersion){case 0:o.createObjectStore(g,{keyPath:"compositeKey"})}}}catch(r){t(u.create("storage-open",{originalErrorMessage:r?.message}))}}),T)}function Te(e){return q(U(e))}function Ee(e,t){return j(U(e),t)}function me(e){return j(z,e)}function we(){return q(z)}async function j(e,t){const n=(await W()).transaction(g,"readwrite"),i=n.objectStore(g).put({compositeKey:e,value:t});return new Promise((s,c)=>{i.onsuccess=a=>{s()},n.onerror=a=>{var f;c(u.create("storage-set",{originalErrorMessage:(f=a.target.error)===null||f===void 0?void 0:f.message}))}})}async function q(e){const r=(await W()).transaction(g,"readonly"),o=r.objectStore(g).get(e);return new Promise((i,s)=>{o.onsuccess=c=>{const a=c.target.result;i(a?a.value:void 0)},r.onerror=c=>{var a;s(u.create("storage-get",{originalErrorMessage:(a=c.target.error)===null||a===void 0?void 0:a.message}))}})}function U(e){return`${e.options.appId}-${e.name}`}/**
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
 */const p=new ne("@firebase/app-check");/**
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
 */async function be(e){if(B()){let t;try{t=await Te(e)}catch(r){p.warn(`Failed to read token from IndexedDB. Error: ${r}`)}return t}}function w(e,t){return B()?Ee(e,t).catch(r=>{p.warn(`Failed to write token to IndexedDB. Error: ${r}`)}):Promise.resolve()}async function ve(){let e;try{e=await we()}catch{}if(e)return e;{const t=re();return me(t).catch(r=>p.warn(`Failed to persist debug token to IndexedDB. Error: ${r}`)),t}}/**
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
 */function C(){return m().enabled}async function P(){const e=m();if(e.enabled&&e.token)return e.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function Ae(){const e=ee(),t=m();if(t.initialized=!0,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&e.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;t.enabled=!0;const r=new E;t.token=r,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?r.resolve(e.FIREBASE_APPCHECK_DEBUG_TOKEN):r.resolve(ve())}/**
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
 */const _e={error:"UNKNOWN_ERROR"};function Ce(e){return oe.encodeString(JSON.stringify(e),!1)}async function v(e,t=!1){const r=e.app;A(r);const n=l(r);let o=n.token,i;if(o&&!h(o)&&(n.token=void 0,o=void 0),!o){const a=await n.cachedTokenPromise;a&&(h(a)?o=a:await w(r,void 0))}if(!t&&o&&h(o))return{token:o.token};let s=!1;if(C()){n.exchangeTokenPromise||(n.exchangeTokenPromise=_(K(r,await P()),e.heartbeatServiceProvider).finally(()=>{n.exchangeTokenPromise=void 0}),s=!0);const a=await n.exchangeTokenPromise;return await w(r,a),n.token=a,{token:a.token}}try{n.exchangeTokenPromise||(n.exchangeTokenPromise=n.provider.getToken().finally(()=>{n.exchangeTokenPromise=void 0}),s=!0),o=await l(r).exchangeTokenPromise}catch(a){a.code==="appCheck/throttled"?p.warn(a.message):p.error(a),i=a}let c;return o?i?h(o)?c={token:o.token,internalError:i}:c=M(i):(c={token:o.token},n.token=o,await w(r,o)):c=M(i),s&&X(r,c),c}async function Pe(e){const t=e.app;A(t);const{provider:r}=l(t);if(C()){const n=await P(),{token:o}=await _(K(t,n),e.heartbeatServiceProvider);return{token:o}}else{const{token:n}=await r.getToken();return{token:n}}}function G(e,t,r,n){const{app:o}=e,i=l(o),s={next:r,error:n,type:t};if(i.tokenObservers=[...i.tokenObservers,s],i.token&&h(i.token)){const c=i.token;Promise.resolve().then(()=>{r({token:c.token}),x(e)}).catch(()=>{})}i.cachedTokenPromise.then(()=>x(e))}function V(e,t){const r=l(e),n=r.tokenObservers.filter(o=>o.next!==t);n.length===0&&r.tokenRefresher&&r.tokenRefresher.isRunning()&&r.tokenRefresher.stop(),r.tokenObservers=n}function x(e){const{app:t}=e,r=l(t);let n=r.tokenRefresher;n||(n=Re(e),r.tokenRefresher=n),!n.isRunning()&&r.isTokenAutoRefreshEnabled&&n.start()}function Re(e){const{app:t}=e;return new de(async()=>{const r=l(t);let n;if(r.token?n=await v(e,!0):n=await v(e),n.error)throw n.error;if(n.internalError)throw n.internalError},()=>!0,()=>{const r=l(t);if(r.token){let n=r.token.issuedAtTimeMillis+(r.token.expireTimeMillis-r.token.issuedAtTimeMillis)*.5+3e5;const o=r.token.expireTimeMillis-5*60*1e3;return n=Math.min(n,o),Math.max(0,n-Date.now())}else return 0},D.RETRIAL_MIN_WAIT,D.RETRIAL_MAX_WAIT)}function X(e,t){const r=l(e).tokenObservers;for(const n of r)try{n.type==="EXTERNAL"&&t.error!=null?n.error(t.error):n.next(t)}catch{}}function h(e){return e.expireTimeMillis-Date.now()>0}function M(e){return{token:Ce(_e),error:e}}/**
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
 */class ye{constructor(t,r){this.app=t,this.heartbeatServiceProvider=r}_delete(){const{tokenObservers:t}=l(this.app);for(const r of t)V(this.app,r.next);return Promise.resolve()}}function Ie(e,t){return new ye(e,t)}function De(e){return{getToken:t=>v(e,t),getLimitedUseToken:()=>Pe(e),addTokenListener:t=>G(e,"INTERNAL",t),removeTokenListener:t=>V(e.app,t)}}const Se="@firebase/app-check",xe="0.8.8";/**
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
 */const Me="https://www.google.com/recaptcha/api.js";function Oe(e,t){const r=new E,n=l(e);n.reCAPTCHAState={initialized:r};const o=Ne(e),i=S(!1);return i?O(e,t,i,o,r):He(()=>{const s=S(!1);if(!s)throw new Error("no recaptcha");O(e,t,s,o,r)}),r.promise}function O(e,t,r,n,o){r.ready(()=>{Be(e,t,r,n),o.resolve(r)})}function Ne(e){const t=`fire_app_check_${e.name}`,r=document.createElement("div");return r.id=t,r.style.display="none",document.body.appendChild(r),t}async function $e(e){A(e);const r=await l(e).reCAPTCHAState.initialized.promise;return new Promise((n,o)=>{const i=l(e).reCAPTCHAState;r.ready(()=>{n(r.execute(i.widgetId,{action:"fire_app_check"}))})})}function Be(e,t,r,n){const o=r.render(n,{sitekey:t,size:"invisible",callback:()=>{l(e).reCAPTCHAState.succeeded=!0},"error-callback":()=>{l(e).reCAPTCHAState.succeeded=!1}}),i=l(e);i.reCAPTCHAState=Object.assign(Object.assign({},i.reCAPTCHAState),{widgetId:o})}function He(e){const t=document.createElement("script");t.src=Me,t.onload=e,document.head.appendChild(t)}/**
 * @license
 * Copyright 2021 Google LLC
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
 */class Y{constructor(t){this._siteKey=t,this._throttleData=null}async getToken(){var t,r,n;Fe(this._throttleData);const o=await $e(this._app).catch(s=>{throw u.create("recaptcha-error")});if(!(!((t=l(this._app).reCAPTCHAState)===null||t===void 0)&&t.succeeded))throw u.create("recaptcha-error");let i;try{i=await _(ge(this._app,o),this._heartbeatServiceProvider)}catch(s){throw!((r=s.code)===null||r===void 0)&&r.includes("fetch-status-error")?(this._throttleData=Le(Number((n=s.customData)===null||n===void 0?void 0:n.httpStatus),this._throttleData),u.create("throttled",{time:F(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):s}return this._throttleData=null,i}initialize(t){this._app=t,this._heartbeatServiceProvider=$(t,"heartbeat"),Oe(t,this._siteKey).catch(()=>{})}isEqual(t){return t instanceof Y?this._siteKey===t._siteKey:!1}}function Le(e,t){if(e===404||e===403)return{backoffCount:1,allowRequestsAfter:Date.now()+ue,httpStatus:e};{const r=t?t.backoffCount:0,n=te(r,1e3,2);return{backoffCount:r+1,allowRequestsAfter:Date.now()+n,httpStatus:e}}}function Fe(e){if(e&&Date.now()-e.allowRequestsAfter<=0)throw u.create("throttled",{time:F(e.allowRequestsAfter-Date.now()),httpStatus:e.httpStatus})}/**
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
 */function qe(e=Z(),t){e=Q(e);const r=$(e,"app-check");if(m().initialized||Ae(),C()&&P().then(o=>console.log(`App Check debug token: ${o}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)),r.isInitialized()){const o=r.getImmediate(),i=r.getOptions();if(i.isTokenAutoRefreshEnabled===t.isTokenAutoRefreshEnabled&&i.provider.isEqual(t.provider))return o;throw u.create("already-initialized",{appName:e.name})}const n=r.initialize({options:t});return Ke(e,t.provider,t.isTokenAutoRefreshEnabled),l(e).isTokenAutoRefreshEnabled&&G(n,"INTERNAL",()=>{}),n}function Ke(e,t,r){const n=ae(e,Object.assign({},H));n.activated=!0,n.provider=t,n.cachedTokenPromise=be(e).then(o=>(o&&h(o)&&(n.token=o,X(e,{token:o.token})),o)),n.isTokenAutoRefreshEnabled=r===void 0?e.automaticDataCollectionEnabled:r,n.provider.initialize(e)}const ze="app-check",N="app-check-internal";function We(){y(new I(ze,e=>{const t=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat");return Ie(t,r)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider(N).initialize()})),y(new I(N,e=>{const t=e.getProvider("app-check").getImmediate();return De(t)},"PUBLIC").setInstantiationMode("EXPLICIT")),ie(Se,xe)}We();export{Y as ReCaptchaV3Provider,qe as initializeAppCheck};
