"use strict";var x=Object.create;var e=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var N=Object.getPrototypeOf,b=Object.prototype.hasOwnProperty;var c=(m,i)=>{for(var o in i)e(m,o,{get:i[o],enumerable:!0})},n=(m,i,o,f)=>{if(i&&typeof i=="object"||typeof i=="function")for(let t of D(i))!b.call(m,t)&&t!==o&&e(m,t,{get:()=>i[t],enumerable:!(f=y(i,t))||f.enumerable});return m};var r=(m,i,o)=>(o=m!=null?x(N(m)):{},n(i||!m||!m.__esModule?e(o,"default",{value:m,enumerable:!0}):o,m)),d=m=>n(e({},"__esModule",{value:!0}),m);var h={};c(h,{default:()=>g});module.exports=d(h);var p=r(require("./first_name")),a=r(require("./last_name")),s=r(require("./name")),_=r(require("./nobility_title_prefix")),l=r(require("./prefix"));const u={first_name:p.default,last_name:a.default,name:s.default,nobility_title_prefix:_.default,prefix:l.default};var g=u;0&&(module.exports={});