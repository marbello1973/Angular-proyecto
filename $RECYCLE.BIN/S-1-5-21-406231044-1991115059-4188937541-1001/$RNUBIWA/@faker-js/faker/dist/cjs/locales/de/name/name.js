"use strict";var t=Object.defineProperty;var i=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var s=Object.prototype.hasOwnProperty;var f=(e,a)=>{for(var n in a)t(e,n,{get:a[n],enumerable:!0})},r=(e,a,n,_)=>{if(a&&typeof a=="object"||typeof a=="function")for(let m of l(a))!s.call(e,m)&&m!==n&&t(e,m,{get:()=>a[m],enumerable:!(_=i(a,m))||_.enumerable});return e};var p=e=>r(t({},"__esModule",{value:!0}),e);var o={};f(o,{default:()=>x});module.exports=p(o);var x=["{{name.prefix}} {{name.first_name}} {{name.last_name}}","{{name.first_name}} {{name.nobility_title_prefix}} {{name.last_name}}","{{name.first_name}} {{name.last_name}}","{{name.male_first_name}} {{name.last_name}}","{{name.female_first_name}} {{name.last_name}}"];0&&(module.exports={});