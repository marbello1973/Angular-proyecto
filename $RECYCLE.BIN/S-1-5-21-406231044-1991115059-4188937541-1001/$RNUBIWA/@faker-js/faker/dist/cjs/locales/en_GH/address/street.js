"use strict";var a=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var _=Object.prototype.hasOwnProperty;var i=(s,e)=>{for(var r in e)a(s,r,{get:e[r],enumerable:!0})},u=(s,e,r,d)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of x(e))!_.call(s,t)&&t!==r&&a(s,t,{get:()=>e[t],enumerable:!(d=f(e,t))||d.enumerable});return s};var l=s=>u(a({},"__esModule",{value:!0}),s);var n={};i(n,{default:()=>m});module.exports=l(n);var m=["{{name.last_name}} {{address.street_suffix}}","{{address.street_prefix}} {{address.street_suffix}}"];0&&(module.exports={});