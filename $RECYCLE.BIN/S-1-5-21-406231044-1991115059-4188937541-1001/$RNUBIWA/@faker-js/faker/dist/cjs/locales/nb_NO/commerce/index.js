"use strict";var f=Object.create;var r=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var s=Object.getOwnPropertyNames;var a=Object.getPrototypeOf,d=Object.prototype.hasOwnProperty;var C=(e,m)=>{for(var o in m)r(e,o,{get:m[o],enumerable:!0})},n=(e,m,o,i)=>{if(m&&typeof m=="object"||typeof m=="function")for(let t of s(m))!d.call(e,t)&&t!==o&&r(e,t,{get:()=>m[t],enumerable:!(i=p(m,t))||i.enumerable});return e};var D=(e,m,o)=>(o=e!=null?f(a(e)):{},n(m||!e||!e.__esModule?r(o,"default",{value:e,enumerable:!0}):o,e)),l=e=>n(r({},"__esModule",{value:!0}),e);var y={};C(y,{default:()=>x});module.exports=l(y);var c=D(require("./department"));const u={department:c.default};var x=u;0&&(module.exports={});