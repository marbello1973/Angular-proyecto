"use strict";var f=Object.create;var r=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var p=Object.getOwnPropertyNames;var i=Object.getPrototypeOf,s=Object.prototype.hasOwnProperty;var F=(e,o)=>{for(var l in o)r(e,l,{get:o[l],enumerable:!0})},n=(e,o,l,c)=>{if(o&&typeof o=="object"||typeof o=="function")for(let a of p(o))!s.call(e,a)&&a!==l&&r(e,a,{get:()=>o[a],enumerable:!(c=k(o,a))||c.enumerable});return e};var b=(e,o,l)=>(l=e!=null?f(i(e)):{},n(o||!e||!e.__esModule?r(l,"default",{value:e,enumerable:!0}):l,e)),w=e=>n(r({},"__esModule",{value:!0}),e);var d={};F(d,{faker:()=>x});module.exports=w(d);var m=require("../faker"),t=b(require("../locales/en"));const x=new m.Faker({locale:"en",localeFallback:"en",locales:{en:t.default}});0&&(module.exports={faker});