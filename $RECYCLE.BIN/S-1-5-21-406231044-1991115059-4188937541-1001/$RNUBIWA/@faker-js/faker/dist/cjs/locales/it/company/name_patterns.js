"use strict";var s=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var _=Object.prototype.hasOwnProperty;var o=(e,a)=>{for(var n in a)s(e,n,{get:a[n],enumerable:!0})},p=(e,a,n,t)=>{if(a&&typeof a=="object"||typeof a=="function")for(let m of l(a))!_.call(e,m)&&m!==n&&s(e,m,{get:()=>a[m],enumerable:!(t=f(a,m))||t.enumerable});return e};var u=e=>p(s({},"__esModule",{value:!0}),e);var c={};o(c,{default:()=>x});module.exports=u(c);var x=["{{name.last_name}} {{company.suffix}}","{{name.last_name}}-{{name.last_name}} {{company.suffix}}","{{name.last_name}}, {{name.last_name}} e {{name.last_name}} {{company.suffix}}"];0&&(module.exports={});