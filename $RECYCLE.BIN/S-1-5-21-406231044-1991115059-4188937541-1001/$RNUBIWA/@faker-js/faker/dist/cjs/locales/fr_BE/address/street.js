"use strict";var a=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var _=Object.getOwnPropertyNames;var i=Object.prototype.hasOwnProperty;var x=(s,e)=>{for(var t in e)a(s,t,{get:e[t],enumerable:!0})},m=(s,e,t,d)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of _(e))!i.call(s,r)&&r!==t&&a(s,r,{get:()=>e[r],enumerable:!(d=f(e,r))||d.enumerable});return s};var n=s=>m(a({},"__esModule",{value:!0}),s);var l={};x(l,{default:()=>p});module.exports=n(l);var p=["{{address.street_prefix}} {{name.first_name}}","{{address.street_prefix}} {{name.last_name}}","{{address.street_prefix}} {{address.street_suffix}}"];0&&(module.exports={});