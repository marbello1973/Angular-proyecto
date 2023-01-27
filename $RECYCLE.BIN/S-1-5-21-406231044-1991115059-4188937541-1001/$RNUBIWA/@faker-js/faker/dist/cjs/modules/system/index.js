"use strict";var c=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var T=Object.prototype.hasOwnProperty;var S=(n,e)=>{for(var t in e)c(n,t,{get:e[t],enumerable:!0})},w=(n,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of $(e))!T.call(n,r)&&r!==t&&c(n,r,{get:()=>e[r],enumerable:!(a=E(e,r))||a.enumerable});return n};var N=n=>w(c({},"__esModule",{value:!0}),n);var A={};S(A,{SystemModule:()=>y});module.exports=N(A);const O=["video","audio","image","text","application"],F=["application/pdf","audio/mpeg","audio/wav","image/png","image/jpeg","image/gif","video/mp4","video/mpeg","text/html"],j=["en","wl","ww"],l={index:"o",slot:"s",mac:"x",pci:"p"},v=["SUN","MON","TUE","WED","THU","FRI","SAT"];class y{constructor(e){this.faker=e;for(const t of Object.getOwnPropertyNames(y.prototype))t==="constructor"||typeof this[t]!="function"||(this[t]=this[t].bind(this))}fileName(e={}){const{extensionCount:t=1}=e,a=this.faker.random.words().toLowerCase().replace(/\W/g,"_");if(t<=0)return a;const r=Array.from({length:t}).map(()=>this.fileExt()).join(".");return`${a}.${r}`}commonFileName(e){return`${this.fileName({extensionCount:0})}.${e||this.commonFileExt()}`}mimeType(){const e=Object.keys(this.faker.definitions.system.mimeTypes);return this.faker.helpers.arrayElement(e)}commonFileType(){return this.faker.helpers.arrayElement(O)}commonFileExt(){return this.fileExt(this.faker.helpers.arrayElement(F))}fileType(){const e=new Set,t=this.faker.definitions.system.mimeTypes;Object.keys(t).forEach(r=>{const s=r.split("/")[0];e.add(s)});const a=Array.from(e);return this.faker.helpers.arrayElement(a)}fileExt(e){if(typeof e=="string"){const s=this.faker.definitions.system.mimeTypes;return this.faker.helpers.arrayElement(s[e].extensions)}const t=this.faker.definitions.system.mimeTypes,a=new Set;Object.keys(t).forEach(s=>{t[s].extensions instanceof Array&&t[s].extensions.forEach(i=>{a.add(i)})});const r=Array.from(a);return this.faker.helpers.arrayElement(r)}directoryPath(){const e=this.faker.definitions.system.directoryPaths;return this.faker.helpers.arrayElement(e)}filePath(){return`${this.directoryPath()}/${this.fileName()}`}semver(){return[this.faker.datatype.number(9),this.faker.datatype.number(9),this.faker.datatype.number(9)].join(".")}networkInterface(e={}){var i,o,m,f,h;const{interfaceType:t=this.faker.helpers.arrayElement(j),interfaceSchema:a=this.faker.helpers.objectKey(l)}=e;let r,s="";switch(a){case"index":r=this.faker.datatype.number(9).toString();break;case"slot":r=`${this.faker.datatype.number(9)}${(i=this.faker.helpers.maybe(()=>`f${this.faker.datatype.number(9)}`))!=null?i:""}${(o=this.faker.helpers.maybe(()=>`d${this.faker.datatype.number(9)}`))!=null?o:""}`;break;case"mac":r=this.faker.internet.mac("");break;case"pci":s=(m=this.faker.helpers.maybe(()=>`P${this.faker.datatype.number(9)}`))!=null?m:"",r=`${this.faker.datatype.number(9)}s${this.faker.datatype.number(9)}${(f=this.faker.helpers.maybe(()=>`f${this.faker.datatype.number(9)}`))!=null?f:""}${(h=this.faker.helpers.maybe(()=>`d${this.faker.datatype.number(9)}`))!=null?h:""}`;break}return`${s}${t}${l[a]}${r}`}cron(e={}){const{includeYear:t=!1,includeNonStandard:a=!1}=e,r=[this.faker.datatype.number({min:0,max:59}),"*"],s=[this.faker.datatype.number({min:0,max:23}),"*"],i=[this.faker.datatype.number({min:1,max:31}),"*","?"],o=[this.faker.datatype.number({min:1,max:12}),"*"],m=[this.faker.datatype.number({min:0,max:6}),this.faker.helpers.arrayElement(v),"*","?"],f=[this.faker.datatype.number({min:1970,max:2099}),"*"],h=this.faker.helpers.arrayElement(r),d=this.faker.helpers.arrayElement(s),k=this.faker.helpers.arrayElement(i),u=this.faker.helpers.arrayElement(o),b=this.faker.helpers.arrayElement(m),g=this.faker.helpers.arrayElement(f);let p=`${h} ${d} ${k} ${u} ${b}`;t&&(p+=` ${g}`);const x=["@annually","@daily","@hourly","@monthly","@reboot","@weekly","@yearly"];return!a||this.faker.datatype.boolean()?p:this.faker.helpers.arrayElement(x)}}0&&(module.exports={SystemModule});
