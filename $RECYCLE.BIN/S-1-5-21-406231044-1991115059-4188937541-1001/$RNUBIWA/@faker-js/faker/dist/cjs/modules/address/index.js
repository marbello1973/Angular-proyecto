"use strict";var d=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var y=(a,e)=>{for(var r in e)d(a,r,{get:e[r],enumerable:!0})},b=(a,e,r,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of k(e))!m.call(a,i)&&i!==r&&d(a,i,{get:()=>e[i],enumerable:!(t=p(e,i))||t.enumerable});return a};var g=a=>b(d({},"__esModule",{value:!0}),a);var _={};y(_,{AddressModule:()=>f});module.exports=g(_);var n=require("../../internal/deprecated");class f{constructor(e){this.faker=e;for(const r of Object.getOwnPropertyNames(f.prototype))r==="constructor"||typeof this[r]!="function"||(this[r]=this[r].bind(this))}zipCode(e){if(e==null){const r=this.faker.definitions.address.postcode;typeof r=="string"?e=r:e=this.faker.helpers.arrayElement(r)}return this.faker.helpers.replaceSymbols(e)}zipCodeByState(e){var t;const r=(t=this.faker.definitions.address.postcode_by_state)==null?void 0:t[e];return r?String(this.faker.datatype.number(r)):this.zipCode()}city(e){e!=null&&(0,n.deprecated)({deprecated:"faker.address.city(format)",proposed:"faker.address.city() or faker.helpers.fake(format)",since:"7.0",until:"8.0"});const r=this.faker.definitions.address.city;return typeof e!="number"&&(e=this.faker.datatype.number(r.length-1)),this.faker.helpers.fake(r[e])}cityPrefix(){return(0,n.deprecated)({deprecated:"faker.address.cityPrefix()",proposed:"faker.address.city() or faker.fake('{{address.city_prefix}}')",since:"7.2",until:"8.0"}),this.faker.helpers.arrayElement(this.faker.definitions.address.city_prefix)}citySuffix(){return(0,n.deprecated)({deprecated:"faker.address.citySuffix()",proposed:"faker.address.city() or faker.helpers.fake('{{address.city_suffix}}')",since:"7.2",until:"8.0"}),this.faker.helpers.arrayElement(this.faker.definitions.address.city_suffix)}cityName(){return this.faker.helpers.arrayElement(this.faker.definitions.address.city_name)}buildingNumber(){const e=this.faker.helpers.arrayElement(this.faker.definitions.address.building_number);return this.faker.helpers.replaceSymbolWithNumber(e)}street(){const e=this.faker.helpers.arrayElement(this.faker.definitions.address.street);return this.faker.helpers.fake(e)}streetName(){return this.faker.definitions.address.street_name==null?((0,n.deprecated)({deprecated:"faker.address.streetName() without address.street_name definitions",proposed:"faker.address.street() or provide address.street_name definitions",since:"7.0",until:"8.0"}),this.street()):this.faker.helpers.arrayElement(this.faker.definitions.address.street_name)}streetAddress(e=!1){const t=this.faker.definitions.address.street_address[e?"full":"normal"];return this.faker.helpers.fake(t)}streetSuffix(){return(0,n.deprecated)({deprecated:"faker.address.streetSuffix()",proposed:"faker.address.street()",since:"7.4",until:"8.0"}),this.faker.helpers.arrayElement(this.faker.definitions.address.street_suffix)}streetPrefix(){return(0,n.deprecated)({deprecated:"faker.address.streetPrefix()",proposed:"faker.address.street()",since:"7.4",until:"8.0"}),this.faker.helpers.arrayElement(this.faker.definitions.address.street_prefix)}secondaryAddress(){return this.faker.helpers.replaceSymbolWithNumber(this.faker.helpers.arrayElement(this.faker.definitions.address.secondary_address))}county(){return this.faker.helpers.arrayElement(this.faker.definitions.address.county)}country(){return this.faker.helpers.arrayElement(this.faker.definitions.address.country)}countryCode(e="alpha-2"){const r=e==="alpha-3"?"country_code_alpha_3":"country_code";return this.faker.helpers.arrayElement(this.faker.definitions.address[r])}state(){return this.faker.helpers.arrayElement(this.faker.definitions.address.state)}stateAbbr(){return this.faker.helpers.arrayElement(this.faker.definitions.address.state_abbr)}latitude(e=90,r=-90,t=4){return this.faker.datatype.number({min:r,max:e,precision:parseFloat(`${0 .toPrecision(t)}1`)}).toFixed(t)}longitude(e=180,r=-180,t=4){return this.faker.datatype.number({max:e,min:r,precision:parseFloat(`${0 .toPrecision(t)}1`)}).toFixed(t)}direction(e=!1){return e?this.faker.helpers.arrayElement(this.faker.definitions.address.direction_abbr):this.faker.helpers.arrayElement(this.faker.definitions.address.direction)}cardinalDirection(e=!1){return e?this.faker.helpers.arrayElement(this.faker.definitions.address.direction_abbr.slice(0,4)):this.faker.helpers.arrayElement(this.faker.definitions.address.direction.slice(0,4))}ordinalDirection(e=!1){return e?this.faker.helpers.arrayElement(this.faker.definitions.address.direction_abbr.slice(4,8)):this.faker.helpers.arrayElement(this.faker.definitions.address.direction.slice(4,8))}nearbyGPSCoordinate(e,r=10,t=!1){if(e===void 0)return[this.latitude(),this.longitude()];const i=this.faker.datatype.float({min:0,max:2*Math.PI,precision:1e-5}),l=t?r:r*1.60934,h=.995,u=this.faker.datatype.float({min:0,max:l,precision:.001})*h,c=4e4/360,o=u/c,s=[e[0]+Math.sin(i)*o,e[1]+Math.cos(i)*o];return s[0]=s[0]%180,(s[0]<-90||s[0]>90)&&(s[0]=Math.sign(s[0])*180-s[0],s[1]+=180),s[1]=(s[1]%360+540)%360-180,[s[0].toFixed(4),s[1].toFixed(4)]}timeZone(){return this.faker.helpers.arrayElement(this.faker.definitions.address.time_zone)}}0&&(module.exports={AddressModule});
