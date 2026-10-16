import{q as ot,e as at,l as ct,L as lt,t as ut,h as ft,C as pt,r as C,M as dt,Z as gt,Y as mt,y as ht}from"./index.esm2017-D8AndOHk.js";import"./index.esm2017-NLaV1adN.js";const F="@firebase/performance",M="0.6.9";/**
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
 */const j=M,_t="FB-PERF-TRACE-START",Et="FB-PERF-TRACE-STOP",O="FB-PERF-TRACE-MEASURE",K="_wt_",G="_fp",x="_fcp",X="_fid",W="@firebase/performance/config",H="@firebase/performance/configexpire",Tt="performance",Y="Performance";/**
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
 */const It={"trace started":"Trace {$traceName} was started before.","trace stopped":"Trace {$traceName} is not running.","nonpositive trace startTime":"Trace {$traceName} startTime should be positive.","nonpositive trace duration":"Trace {$traceName} duration should be positive.","no window":"Window is not available.","no app id":"App id is not available.","no project id":"Project id is not available.","no api key":"Api key is not available.","invalid cc log":"Attempted to queue invalid cc event","FB not default":"Performance can only start when Firebase app instance is the default one.","RC response not ok":"RC response is not ok","invalid attribute name":"Attribute name {$attributeName} is invalid.","invalid attribute value":"Attribute value {$attributeValue} is invalid.","invalid custom metric name":"Custom metric name {$customMetricName} is invalid","invalid String merger input":"Input for String merger is invalid, contact support team to resolve.","already initialized":"initializePerformance() has already been called with different options. To avoid this error, call initializePerformance() with the same options as when it was originally called, or call getPerformance() to return the already initialized instance."},o=new dt(Tt,Y,It);/**
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
 */const f=new lt(Y);f.logLevel=ut.INFO;/**
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
 */let S,J;class s{constructor(t){if(this.window=t,!t)throw o.create("no window");this.performance=t.performance,this.PerformanceObserver=t.PerformanceObserver,this.windowLocation=t.location,this.navigator=t.navigator,this.document=t.document,this.navigator&&this.navigator.cookieEnabled&&(this.localStorage=t.localStorage),t.perfMetrics&&t.perfMetrics.onFirstInputDelay&&(this.onFirstInputDelay=t.perfMetrics.onFirstInputDelay)}getUrl(){return this.windowLocation.href.split("?")[0]}mark(t){!this.performance||!this.performance.mark||this.performance.mark(t)}measure(t,n,i){!this.performance||!this.performance.measure||this.performance.measure(t,n,i)}getEntriesByType(t){return!this.performance||!this.performance.getEntriesByType?[]:this.performance.getEntriesByType(t)}getEntriesByName(t){return!this.performance||!this.performance.getEntriesByName?[]:this.performance.getEntriesByName(t)}getTimeOrigin(){return this.performance&&(this.performance.timeOrigin||this.performance.timing.navigationStart)}requiredApisAvailable(){return!fetch||!Promise||!mt()?(f.info("Firebase Performance cannot start if browser does not support fetch and Promise or cookie is disabled."),!1):ht()?!0:(f.info("IndexedDB is not supported by current browser"),!1)}setupObserver(t,n){if(!this.PerformanceObserver)return;new this.PerformanceObserver(r=>{for(const a of r.getEntries())n(a)}).observe({entryTypes:[t]})}static getInstance(){return S===void 0&&(S=new s(J)),S}}function vt(e){J=e}/**
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
 */let Q;function bt(e){const t=e.getId();return t.then(n=>{Q=n}),t}function P(){return Q}function St(e){const t=e.getToken();return t.then(n=>{}),t}/**
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
 */function k(e,t){const n=e.length-t.length;if(n<0||n>1)throw o.create("invalid String merger input");const i=[];for(let r=0;r<e.length;r++)i.push(e.charAt(r)),t.length>r&&i.push(t.charAt(r));return i.join("")}/**
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
 */let A;class l{constructor(){this.instrumentationEnabled=!0,this.dataCollectionEnabled=!0,this.loggingEnabled=!1,this.tracesSamplingRate=1,this.networkRequestsSamplingRate=1,this.logEndPointUrl="https://firebaselogging.googleapis.com/v0cc/log?format=json_proto",this.flTransportEndpointUrl=k("hts/frbslgigp.ogepscmv/ieo/eaylg","tp:/ieaeogn-agolai.o/1frlglgc/o"),this.transportKey=k("AzSC8r6ReiGqFMyfvgow","Iayx0u-XT3vksVM-pIV"),this.logSource=462,this.logTraceAfterSampling=!1,this.logNetworkAfterSampling=!1,this.configTimeToLive=12}getFlTransportFullUrl(){return this.flTransportEndpointUrl.concat("?key=",this.transportKey)}static getInstance(){return A===void 0&&(A=new l),A}}/**
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
 */var m;(function(e){e[e.UNKNOWN=0]="UNKNOWN",e[e.VISIBLE=1]="VISIBLE",e[e.HIDDEN=2]="HIDDEN"})(m||(m={}));const At=["firebase_","google_","ga_"],Rt=new RegExp("^[a-zA-Z]\\w*$"),Nt=40,yt=100;function Mt(){const e=s.getInstance().navigator;return e?.serviceWorker?e.serviceWorker.controller?2:3:1}function Z(){switch(s.getInstance().document.visibilityState){case"visible":return m.VISIBLE;case"hidden":return m.HIDDEN;default:return m.UNKNOWN}}function Ot(){const t=s.getInstance().navigator.connection;switch(t&&t.effectiveType){case"slow-2g":return 1;case"2g":return 2;case"3g":return 3;case"4g":return 4;default:return 0}}function Pt(e){return e.length===0||e.length>Nt?!1:!At.some(n=>e.startsWith(n))&&!!e.match(Rt)}function Ut(e){return e.length!==0&&e.length<=yt}/**
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
 */function tt(e){var t;const n=(t=e.options)===null||t===void 0?void 0:t.appId;if(!n)throw o.create("no app id");return n}function wt(e){var t;const n=(t=e.options)===null||t===void 0?void 0:t.projectId;if(!n)throw o.create("no project id");return n}function Ct(e){var t;const n=(t=e.options)===null||t===void 0?void 0:t.apiKey;if(!n)throw o.create("no api key");return n}/**
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
 */const Ft="0.0.1",u={loggingEnabled:!0},kt="FIREBASE_INSTALLATIONS_AUTH";function Lt(e,t){const n=Dt();return n?(L(n),Promise.resolve()):$t(e,t).then(L).then(i=>Bt(i),()=>{})}function Dt(){const e=s.getInstance().localStorage;if(!e)return;const t=e.getItem(H);if(!t||!qt(t))return;const n=e.getItem(W);if(n)try{return JSON.parse(n)}catch{return}}function Bt(e){const t=s.getInstance().localStorage;!e||!t||(t.setItem(W,JSON.stringify(e)),t.setItem(H,String(Date.now()+l.getInstance().configTimeToLive*60*60*1e3)))}const Vt="Could not fetch config, will use default configs";function $t(e,t){return St(e.installations).then(n=>{const i=wt(e.app),r=Ct(e.app),a=`https://firebaseremoteconfig.googleapis.com/v1/projects/${i}/namespaces/fireperf:fetch?key=${r}`,c=new Request(a,{method:"POST",headers:{Authorization:`${kt} ${n}`},body:JSON.stringify({app_instance_id:t,app_instance_id_token:n,app_id:tt(e.app),app_version:j,sdk_version:Ft})});return fetch(c).then(g=>{if(g.ok)return g.json();throw o.create("RC response not ok")})}).catch(()=>{f.info(Vt)})}function L(e){if(!e)return e;const t=l.getInstance(),n=e.entries||{};return n.fpr_enabled!==void 0?t.loggingEnabled=String(n.fpr_enabled)==="true":t.loggingEnabled=u.loggingEnabled,n.fpr_log_source?t.logSource=Number(n.fpr_log_source):u.logSource&&(t.logSource=u.logSource),n.fpr_log_endpoint_url?t.logEndPointUrl=n.fpr_log_endpoint_url:u.logEndPointUrl&&(t.logEndPointUrl=u.logEndPointUrl),n.fpr_log_transport_key?t.transportKey=n.fpr_log_transport_key:u.transportKey&&(t.transportKey=u.transportKey),n.fpr_vc_network_request_sampling_rate!==void 0?t.networkRequestsSamplingRate=Number(n.fpr_vc_network_request_sampling_rate):u.networkRequestsSamplingRate!==void 0&&(t.networkRequestsSamplingRate=u.networkRequestsSamplingRate),n.fpr_vc_trace_sampling_rate!==void 0?t.tracesSamplingRate=Number(n.fpr_vc_trace_sampling_rate):u.tracesSamplingRate!==void 0&&(t.tracesSamplingRate=u.tracesSamplingRate),t.logTraceAfterSampling=D(t.tracesSamplingRate),t.logNetworkAfterSampling=D(t.networkRequestsSamplingRate),e}function qt(e){return Number(e)>Date.now()}function D(e){return Math.random()<=e}/**
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
 */let U=1,R;function et(e){return U=2,R=R||jt(e),R}function zt(){return U===3}function jt(e){return Kt().then(()=>bt(e.installations)).then(t=>Lt(e,t)).then(()=>B(),()=>B())}function Kt(){const e=s.getInstance().document;return new Promise(t=>{if(e&&e.readyState!=="complete"){const n=()=>{e.readyState==="complete"&&(e.removeEventListener("readystatechange",n),t())};e.addEventListener("readystatechange",n)}else t()})}function B(){U=3}/**
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
 */const w=10*1e3,Gt=5.5*1e3,nt=3,xt=1e3;let _=nt,p=[],V=!1;function Xt(){V||(E(Gt),V=!0)}function E(e){setTimeout(()=>{if(_!==0){if(!p.length)return E(w);Wt()}},e)}function Wt(){const e=p.splice(0,xt),t=e.map(i=>({source_extension_json_proto3:i.message,event_time_ms:String(i.eventTime)})),n={request_time_ms:String(Date.now()),client_info:{client_type:1,js_client_info:{}},log_source:l.getInstance().logSource,log_event:t};Ht(n,e).catch(()=>{p=[...e,...p],_--,f.info(`Tries left: ${_}.`),E(w)})}function Ht(e,t){return Yt(e).then(n=>(n.ok||f.info("Call to Firebase backend failed."),n.json())).then(n=>{const i=Number(n.nextRequestWaitMillis);let r=w;isNaN(i)||(r=Math.max(i,r));const a=n.logResponseDetails;Array.isArray(a)&&a.length>0&&a[0].responseAction==="RETRY_REQUEST_LATER"&&(p=[...t,...p],f.info("Retry transport request later.")),_=nt,E(r)})}function Yt(e){const t=l.getInstance().getFlTransportFullUrl();return fetch(t,{method:"POST",body:JSON.stringify(e)})}function Jt(e){if(!e.eventTime||!e.message)throw o.create("invalid cc log");p=[...p,e]}function Qt(e){return(...t)=>{const n=e(...t);Jt({message:n,eventTime:Date.now()})}}/**
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
 */let N;function it(e,t){N||(N=Qt(te)),N(e,t)}function h(e){const t=l.getInstance();!t.instrumentationEnabled&&e.isAuto||!t.dataCollectionEnabled&&!e.isAuto||s.getInstance().requiredApisAvailable()&&(e.isAuto&&Z()!==m.VISIBLE||(zt()?y(e):et(e.performanceController).then(()=>y(e),()=>y(e))))}function y(e){if(!P())return;const t=l.getInstance();!t.loggingEnabled||!t.logTraceAfterSampling||setTimeout(()=>it(e,1),0)}function Zt(e){const t=l.getInstance();if(!t.instrumentationEnabled)return;const n=e.url,i=t.logEndPointUrl.split("?")[0],r=t.flTransportEndpointUrl.split("?")[0];n===i||n===r||!t.loggingEnabled||!t.logNetworkAfterSampling||setTimeout(()=>it(e,0),0)}function te(e,t){return t===0?ee(e):ne(e)}function ee(e){const t={url:e.url,http_method:e.httpMethod||0,http_response_code:200,response_payload_bytes:e.responsePayloadBytes,client_start_time_us:e.startTimeUs,time_to_response_initiated_us:e.timeToResponseInitiatedUs,time_to_response_completed_us:e.timeToResponseCompletedUs},n={application_info:rt(e.performanceController.app),network_request_metric:t};return JSON.stringify(n)}function ne(e){const t={name:e.name,is_auto:e.isAuto,client_start_time_us:e.startTimeUs,duration_us:e.durationUs};Object.keys(e.counters).length!==0&&(t.counters=e.counters);const n=e.getAttributes();Object.keys(n).length!==0&&(t.custom_attributes=n);const i={application_info:rt(e.performanceController.app),trace_metric:t};return JSON.stringify(i)}function rt(e){return{google_app_id:tt(e),app_instance_id:P(),web_app_info:{sdk_version:j,page_url:s.getInstance().getUrl(),service_worker_status:Mt(),visibility_state:Z(),effective_connection_type:Ot()},application_process_state:0}}/**
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
 */const ie=100,re="_",se=[G,x,X];function oe(e,t){return e.length===0||e.length>ie?!1:t&&t.startsWith(K)&&se.indexOf(e)>-1||!e.startsWith(re)}function ae(e){const t=Math.floor(e);return t<e&&f.info(`Metric value should be an Integer, setting the value as : ${t}.`),t}/**
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
 */class d{constructor(t,n,i=!1,r){this.performanceController=t,this.name=n,this.isAuto=i,this.state=1,this.customAttributes={},this.counters={},this.api=s.getInstance(),this.randomId=Math.floor(Math.random()*1e6),this.isAuto||(this.traceStartMark=`${_t}-${this.randomId}-${this.name}`,this.traceStopMark=`${Et}-${this.randomId}-${this.name}`,this.traceMeasure=r||`${O}-${this.randomId}-${this.name}`,r&&this.calculateTraceMetrics())}start(){if(this.state!==1)throw o.create("trace started",{traceName:this.name});this.api.mark(this.traceStartMark),this.state=2}stop(){if(this.state!==2)throw o.create("trace stopped",{traceName:this.name});this.state=3,this.api.mark(this.traceStopMark),this.api.measure(this.traceMeasure,this.traceStartMark,this.traceStopMark),this.calculateTraceMetrics(),h(this)}record(t,n,i){if(t<=0)throw o.create("nonpositive trace startTime",{traceName:this.name});if(n<=0)throw o.create("nonpositive trace duration",{traceName:this.name});if(this.durationUs=Math.floor(n*1e3),this.startTimeUs=Math.floor(t*1e3),i&&i.attributes&&(this.customAttributes=Object.assign({},i.attributes)),i&&i.metrics)for(const r of Object.keys(i.metrics))isNaN(Number(i.metrics[r]))||(this.counters[r]=Math.floor(Number(i.metrics[r])));h(this)}incrementMetric(t,n=1){this.counters[t]===void 0?this.putMetric(t,n):this.putMetric(t,this.counters[t]+n)}putMetric(t,n){if(oe(t,this.name))this.counters[t]=ae(n??0);else throw o.create("invalid custom metric name",{customMetricName:t})}getMetric(t){return this.counters[t]||0}putAttribute(t,n){const i=Pt(t),r=Ut(n);if(i&&r){this.customAttributes[t]=n;return}if(!i)throw o.create("invalid attribute name",{attributeName:t});if(!r)throw o.create("invalid attribute value",{attributeValue:n})}getAttribute(t){return this.customAttributes[t]}removeAttribute(t){this.customAttributes[t]!==void 0&&delete this.customAttributes[t]}getAttributes(){return Object.assign({},this.customAttributes)}setStartTime(t){this.startTimeUs=t}setDuration(t){this.durationUs=t}calculateTraceMetrics(){const t=this.api.getEntriesByName(this.traceMeasure),n=t&&t[0];n&&(this.durationUs=Math.floor(n.duration*1e3),this.startTimeUs=Math.floor((n.startTime+this.api.getTimeOrigin())*1e3))}static createOobTrace(t,n,i,r){const a=s.getInstance().getUrl();if(!a)return;const c=new d(t,K+a,!0),g=Math.floor(s.getInstance().getTimeOrigin()*1e3);c.setStartTime(g),n&&n[0]&&(c.setDuration(Math.floor(n[0].duration*1e3)),c.putMetric("domInteractive",Math.floor(n[0].domInteractive*1e3)),c.putMetric("domContentLoadedEventEnd",Math.floor(n[0].domContentLoadedEventEnd*1e3)),c.putMetric("loadEventEnd",Math.floor(n[0].loadEventEnd*1e3)));const T="first-paint",st="first-contentful-paint";if(i){const I=i.find(b=>b.name===T);I&&I.startTime&&c.putMetric(G,Math.floor(I.startTime*1e3));const v=i.find(b=>b.name===st);v&&v.startTime&&c.putMetric(x,Math.floor(v.startTime*1e3)),r&&c.putMetric(X,Math.floor(r*1e3))}h(c)}static createUserTimingTrace(t,n){const i=new d(t,n,!1,n);h(i)}}/**
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
 */function $(e,t){const n=t;if(!n||n.responseStart===void 0)return;const i=s.getInstance().getTimeOrigin(),r=Math.floor((n.startTime+i)*1e3),a=n.responseStart?Math.floor((n.responseStart-n.startTime)*1e3):void 0,c=Math.floor((n.responseEnd-n.startTime)*1e3),g=n.name&&n.name.split("?")[0],T={performanceController:e,url:g,responsePayloadBytes:n.transferSize,startTimeUs:r,timeToResponseInitiatedUs:a,timeToResponseCompletedUs:c};Zt(T)}/**
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
 */const ce=5e3;function q(e){P()&&(setTimeout(()=>ue(e),0),setTimeout(()=>le(e),0),setTimeout(()=>fe(e),0))}function le(e){const t=s.getInstance(),n=t.getEntriesByType("resource");for(const i of n)$(e,i);t.setupObserver("resource",i=>$(e,i))}function ue(e){const t=s.getInstance(),n=t.getEntriesByType("navigation"),i=t.getEntriesByType("paint");if(t.onFirstInputDelay){let r=setTimeout(()=>{d.createOobTrace(e,n,i),r=void 0},ce);t.onFirstInputDelay(a=>{r&&(clearTimeout(r),d.createOobTrace(e,n,i,a))})}else d.createOobTrace(e,n,i)}function fe(e){const t=s.getInstance(),n=t.getEntriesByType("measure");for(const i of n)z(e,i);t.setupObserver("measure",i=>z(e,i))}function z(e,t){const n=t.name;n.substring(0,O.length)!==O&&d.createUserTimingTrace(e,n)}/**
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
 */class pe{constructor(t,n){this.app=t,this.installations=n,this.initialized=!1}_init(t){this.initialized||(t?.dataCollectionEnabled!==void 0&&(this.dataCollectionEnabled=t.dataCollectionEnabled),t?.instrumentationEnabled!==void 0&&(this.instrumentationEnabled=t.instrumentationEnabled),s.getInstance().requiredApisAvailable()?gt().then(n=>{n&&(Xt(),et(this).then(()=>q(this),()=>q(this)),this.initialized=!0)}).catch(n=>{f.info(`Environment doesn't support IndexedDB: ${n}`)}):f.info('Firebase Performance cannot start if the browser does not support "Fetch" and "Promise", or cookies are disabled.'))}set instrumentationEnabled(t){l.getInstance().instrumentationEnabled=t}get instrumentationEnabled(){return l.getInstance().instrumentationEnabled}set dataCollectionEnabled(t){l.getInstance().dataCollectionEnabled=t}get dataCollectionEnabled(){return l.getInstance().dataCollectionEnabled}}const de="[DEFAULT]";function Ee(e=ct()){return e=ot(e),at(e,"performance").getImmediate()}const ge=(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("installations-internal").getImmediate();if(n.name!==de)throw o.create("FB not default");if(typeof window>"u")throw o.create("no window");vt(window);const r=new pe(n,i);return r._init(t),r};function me(){ft(new pt("performance",ge,"PUBLIC")),C(F,M),C(F,M,"esm2017")}me();export{Ee as getPerformance};
