"use strict";var l=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var t=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var p=(e,a)=>{for(var n in a)l(e,n,{get:a[n],enumerable:!0})},o=(e,a,n,_)=>{if(a&&typeof a=="object"||typeof a=="function")for(let m of t(a))!f.call(e,m)&&m!==n&&l(e,m,{get:()=>a[m],enumerable:!(_=s(a,m))||_.enumerable});return e};var x=e=>o(l({},"__esModule",{value:!0}),e);var i={};p(i,{default:()=>c});module.exports=x(i);var c=["{{company.prefix}} {{name.male_last_name}}","{{company.prefix}} {{name.male_last_name}} {{company.suffix}}","{{company.prefix}} {{name.female_last_name}} {{company.suffix}}","{{name.male_last_name}} un {{name.male_last_name}}","{{name.male_last_name}}, {{name.male_last_name}} un {{name.male_last_name}}"];0&&(module.exports={});