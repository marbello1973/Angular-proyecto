"use strict";var i=Object.defineProperty;var o=Object.getOwnPropertyDescriptor;var c=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var l=(r,e)=>{for(var t in e)i(r,t,{get:e[t],enumerable:!0})},f=(r,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of c(e))!m.call(r,n)&&n!==t&&i(r,n,{get:()=>e[n],enumerable:!(a=o(e,n))||a.enumerable});return r};var h=r=>f(i({},"__esModule",{value:!0}),r);var p={};l(p,{ScienceModule:()=>s});module.exports=h(p);class s{constructor(e){this.faker=e;for(const t of Object.getOwnPropertyNames(s.prototype))t==="constructor"||typeof this[t]!="function"||(this[t]=this[t].bind(this))}chemicalElement(){return this.faker.helpers.arrayElement(this.faker.definitions.science.chemicalElement)}unit(){return this.faker.helpers.arrayElement(this.faker.definitions.science.unit)}}0&&(module.exports={ScienceModule});