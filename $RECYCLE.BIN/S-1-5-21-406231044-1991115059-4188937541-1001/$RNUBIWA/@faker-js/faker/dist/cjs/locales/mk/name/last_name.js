"use strict";var p=Object.create;var l=Object.defineProperty;var i=Object.getOwnPropertyDescriptor;var s=Object.getOwnPropertyNames;var d=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty;var w=(e,m)=>{for(var a in m)l(e,a,{get:m[a],enumerable:!0})},r=(e,m,a,o)=>{if(m&&typeof m=="object"||typeof m=="function")for(let t of s(m))!u.call(e,t)&&t!==a&&l(e,t,{get:()=>m[t],enumerable:!(o=i(m,t))||o.enumerable});return e};var f=(e,m,a)=>(a=e!=null?p(d(e)):{},r(m||!e||!e.__esModule?l(a,"default",{value:e,enumerable:!0}):a,e)),x=e=>r(l({},"__esModule",{value:!0}),e);var b={};w(b,{default:()=>S});module.exports=x(b);var _=f(require("./female_last_name")),n=f(require("./male_last_name")),S=[...new Set([..._.default,...n.default])];0&&(module.exports={});