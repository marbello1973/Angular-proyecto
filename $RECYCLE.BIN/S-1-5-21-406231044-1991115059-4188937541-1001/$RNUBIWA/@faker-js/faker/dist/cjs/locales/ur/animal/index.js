"use strict";var d=Object.create;var p=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var b=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty;var w=(o,i)=>{for(var m in i)p(o,m,{get:i[m],enumerable:!0})},n=(o,i,m,f)=>{if(i&&typeof i=="object"||typeof i=="function")for(let t of D(i))!u.call(o,t)&&t!==m&&p(o,t,{get:()=>i[t],enumerable:!(f=A(i,t))||f.enumerable});return o};var r=(o,i,m)=>(m=o!=null?d(b(o)):{},n(i||!o||!o.__esModule?p(m,"default",{value:o,enumerable:!0}):m,o)),x=o=>n(p({},"__esModule",{value:!0}),o);var h={};w(h,{default:()=>g});module.exports=x(h);var e=r(require("./bear")),a=r(require("./cow")),l=r(require("./crocodilia")),c=r(require("./insect")),s=r(require("./lion")),y=r(require("./type"));const _={bear:e.default,cow:a.default,crocodilia:l.default,insect:c.default,lion:s.default,type:y.default};var g=_;0&&(module.exports={});
