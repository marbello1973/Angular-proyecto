"use strict";var i=Object.create;var a=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var s=Object.getOwnPropertyNames;var F=Object.getPrototypeOf,b=Object.prototype.hasOwnProperty;var w=(o,l)=>{for(var e in l)a(o,e,{get:l[e],enumerable:!0})},p=(o,l,e,m)=>{if(l&&typeof l=="object"||typeof l=="function")for(let r of s(l))!b.call(o,r)&&r!==e&&a(o,r,{get:()=>l[r],enumerable:!(m=k(l,r))||m.enumerable});return o};var c=(o,l,e)=>(e=o!=null?i(F(o)):{},p(l||!o||!o.__esModule?a(e,"default",{value:o,enumerable:!0}):e,o)),x=o=>p(a({},"__esModule",{value:!0}),o);var g={};w(g,{faker:()=>d});module.exports=x(g);var t=require("../faker"),f=c(require("../locales/en")),n=c(require("../locales/pl"));const d=new t.Faker({locale:"pl",localeFallback:"en",locales:{pl:n.default,en:f.default}});0&&(module.exports={faker});