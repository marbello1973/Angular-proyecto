"use strict";var i=Object.create;var a=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var s=Object.getOwnPropertyNames;var B=Object.getPrototypeOf,E=Object.prototype.hasOwnProperty;var F=(o,l)=>{for(var e in l)a(o,e,{get:l[e],enumerable:!0})},n=(o,l,e,m)=>{if(l&&typeof l=="object"||typeof l=="function")for(let r of s(l))!E.call(o,r)&&r!==e&&a(o,r,{get:()=>l[r],enumerable:!(m=k(l,r))||m.enumerable});return o};var c=(o,l,e)=>(e=o!=null?i(B(o)):{},n(l||!o||!o.__esModule?a(e,"default",{value:o,enumerable:!0}):e,o)),_=o=>n(a({},"__esModule",{value:!0}),o);var w={};F(w,{faker:()=>b});module.exports=_(w);var t=require("../faker"),f=c(require("../locales/en")),p=c(require("../locales/nl_BE"));const b=new t.Faker({locale:"nl_BE",localeFallback:"en",locales:{nl_BE:p.default,en:f.default}});0&&(module.exports={faker});