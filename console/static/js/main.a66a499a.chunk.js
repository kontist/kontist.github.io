(this["webpackJsonpapi-console"]=this["webpackJsonpapi-console"]||[]).push([[0],{139:function(e,n){e.exports={appDirectory:"console",baseAPIUrl:"http://localhost:3000",clientId:"fffd5643-fb7b-472f-9623-6b28361b8af9",redirectUri:"http://localhost:3001/console"}},142:function(e,n,t){"use strict";t.r(n);var r=t(0),a=t.n(r),i=t(31),l=t.n(i),c=(t(59),t(21)),o=t.n(c),s=t(23),u=t(13),d=t(24),p=t(14),m=t(3),f=t.n(m),h=t(5),b=t(7),g=t(8),v=t(10),y=t(9),x=t(11),C="\n  {\n    viewer {\n      clients {\n        id\n        redirectUri\n        name\n        grantTypes\n        scopes\n      }\n    }\n  }\n",O="\n  mutation(\n    $name: String!,\n    $redirectUri: String,\n    $secret: String,\n    $scopes: [ScopeType!]!,\n    $grantTypes: [GrantType!]!\n  ) {\n    createClient(\n      client: {\n        name: $name\n        redirectUri: $redirectUri\n        grantTypes: $grantTypes\n        scopes: $scopes\n        secret: $secret\n      }\n    ) {\n      id\n      redirectUri\n      name\n      grantTypes\n      scopes\n    }\n  }\n",E="\n  mutation(\n    $id: String!,\n    $name: String,\n    $redirectUri: String,\n    $secret: String,\n    $scopes: [ScopeType!],\n    $grantTypes: [GrantType!]\n  ) {\n    updateClient(\n      client: {\n        id: $id\n        name: $name\n        redirectUri: $redirectUri\n        grantTypes: $grantTypes\n        scopes: $scopes\n        secret: $secret\n      }\n    ) {\n      id\n      redirectUri\n      name\n      grantTypes\n      scopes\n    }\n  }\n",w="\n  mutation(\n    $id: String!,\n  ) {\n    deleteClient(\n      id: $id\n    ) {\n      id\n    }\n  }\n";function j(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function k(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?j(t,!0).forEach((function(n){Object(p.a)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):j(t).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}var L=a.a.createContext({isLoading:!1,oAuthClients:[],createClient:function(){},updateClient:function(){},deleteClient:function(){}}),S=L.Provider,A=L.Consumer,D=function(e){function n(e){var t;return Object(b.a)(this,n),(t=Object(v.a)(this,Object(y.a)(n).call(this,e))).fetchClients=Object(h.a)(f.a.mark((function e(){var n,r;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.props.kontistClient.graphQL.rawQuery(C);case 2:n=e.sent,r=n.viewer,t.setState({isLoading:!1,oAuthClients:r.clients});case 5:case"end":return e.stop()}}),e)}))),t.createClient=function(){var e=Object(h.a)(f.a.mark((function e(n){var r,a;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t.setState({isLoading:!0}),e.next=3,t.props.kontistClient.graphQL.rawQuery(O,k({},n,{grantTypes:["AUTHORIZATION_CODE","REFRESH_TOKEN"]}));case 3:r=e.sent,a=r.createClient,t.setState((function(e){return k({},e,{isLoading:!1,oAuthClients:[].concat(Object(d.a)(e.oAuthClients),[a])})}));case 6:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),t.updateClient=function(){var e=Object(h.a)(f.a.mark((function e(n){var r,a,i,l,c,o,s,u;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=n.id,a=n.name,i=n.redirectUri,l=n.scopes,c=n.secret,o={id:r,name:a,redirectUri:i,scopes:l},c&&(o.secret=c),e.next=5,t.props.kontistClient.graphQL.rawQuery(E,k({},o,{grantTypes:["AUTHORIZATION_CODE","REFRESH_TOKEN"]}));case 5:s=e.sent,u=s.updateClient,t.setState((function(e){return k({},e,{isLoading:!1,oAuthClients:Object(d.a)(e.oAuthClients).map((function(e){return e.id===u.id?u:e}))})}));case 8:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),t.deleteClient=function(){var e=Object(h.a)(f.a.mark((function e(n){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t.setState({isLoading:!0}),e.next=3,t.props.kontistClient.graphQL.rawQuery(w,n);case 3:t.setState((function(e){return k({},e,{isLoading:!1,oAuthClients:Object(d.a)(e.oAuthClients).filter((function(e){return e.id!==n.id}))})}));case 4:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),t.state={isLoading:!0,oAuthClients:[]},t}return Object(x.a)(n,e),Object(g.a)(n,[{key:"componentDidMount",value:function(){var e=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.fetchClients();case 2:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this.state,n=e.oAuthClients,t=e.isLoading;return a.a.createElement(S,{value:{oAuthClients:n,isLoading:t,createClient:this.createClient,updateClient:this.updateClient,deleteClient:this.deleteClient}},this.props.children)}}]),n}(r.Component),T=function(e){return function(n){function t(){return Object(b.a)(this,t),Object(v.a)(this,Object(y.a)(t).apply(this,arguments))}return Object(x.a)(t,n),Object(g.a)(t,[{key:"render",value:function(){var n=this;return a.a.createElement(A,null,(function(t){var r=t.createClient,i=t.updateClient,l=t.deleteClient,c=t.oAuthClients,o=t.isLoading;return a.a.createElement(e,Object.assign({createClient:r,updateClient:i,deleteClient:l,oAuthClients:c,isLoading:o},n.props))}))}}]),t}(r.Component)},R=t(46),U=t(47),F=t.n(U),P=(t(139),F.a),N=P.baseAPIUrl,B=P.clientId,I=P.redirectUri;sessionStorage.setItem("state",sessionStorage.getItem("state")||(Math.random()+"").substring(2)),sessionStorage.setItem("verifier",sessionStorage.getItem("verifier")||(Math.random()+"").substring(2));var V=new R.Client({baseUrl:N,clientId:B,redirectUri:I,scopes:["clients"],state:sessionStorage.getItem("state")||"",verifier:sessionStorage.getItem("verifier")||""}),H=function(e){return e.children(V)},M=t(1),G=t(2),$=t(22),z=t.n($);function Z(){return(Z=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}function Q(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var W=a.a.createElement("path",{d:"M48 24H42.4615C42.4615 34.196 34.196 42.4615 24 42.4615C13.804 42.4615 5.53846 34.196 5.53846 24C5.53846 13.804 13.804 5.53846 24 5.53846V0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48C37.2548 48 48 37.2548 48 24Z",fill:"#5A2FB1"}),Y=function(e){var n=e.svgRef,t=e.title,r=Q(e,["svgRef","title"]);return a.a.createElement("svg",Z({width:48,height:48,viewBox:"0 0 48 48",fill:"none",ref:n},r),t?a.a.createElement("title",null,t):null,W)},_=a.a.forwardRef((function(e,n){return a.a.createElement(Y,Z({svgRef:n},e))})),K=(t.p,{primaryPurple:"#5A2FB1",primaryBlack:"#180B32",transparentPrimaryPurple:"rgba(90, 47, 177, 0.5)",transparentBlack:"rgba(24, 11, 50, .2)",lightPurple:"rgb(234, 231, 246)",tonedGrey:"#B5B2BA",black:"#111111",darkGrey:"#4D4B51",darkRed:"#E13D00",transparent:"transparent",white:"#FFFFFF",transparentWhite:"rgba(255, 255, 255, 0.5)",seaShell:"#F1F1F1",androidAppBarBg:"#F5F5F5",veryLightGrey:"#EEEEEE",lightGrey:"#DDDDDD",midGrey:"#CCCCCC",midDarkGrey:"#9b9b9b",grey:"#fafafa",secondaryPurple:"#7555B7",darkPurple:"#2C1064",lightGreen:"#BCDEDE",primaryGreen:"#348288",darkGreen:"#114044",brightGreen:"#4CAF50",beige:"#F5F5F1",lightYellow:"#FFDAA0",primaryYellow:"#FDBA50",darkYellow:"#523300",lightRed:"#FFD6C4"});function J(){var e=Object(M.a)(["\n  display: flex;\n  justify-content: center;\n  margin: 1rem;\n\n  &.small {\n    margin: 0;\n  }\n\n  &.white {\n    svg path {\n      fill: ",";\n    }\n  }\n"]);return J=function(){return e},e}function q(){var e=Object(M.a)(["\n  animation: spin 2s linear infinite;\n\n  &.small {\n    width: 24px;\n    height: 24px;\n  }\n\n  @keyframes spin {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n"]);return q=function(){return e},e}var X=Object(G.a)(_)(q()),ee=G.a.div(J(),K.white),ne=function(e){var n=e.small,t=e.white,r=z()({small:n,white:t});return a.a.createElement(ee,{className:r},a.a.createElement(X,{className:r}))};function te(){var e=Object(M.a)(["\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100%;\n  width: 100%;\n"]);return te=function(){return e},e}var re=G.a.div(te()),ae=function(){return a.a.createElement(re,null,a.a.createElement(ne,null))},ie=function(e){function n(e){var t;return Object(b.a)(this,n),(t=Object(v.a)(this,Object(y.a)(n).call(this,e))).state={isAuthenticated:!1},t}return Object(x.a)(n,e),Object(g.a)(n,[{key:"componentDidMount",value:function(){var e=Object(h.a)(f.a.mark((function e(){var n,t,r;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!(n=this.props.kontistClient).auth.token){e.next=4;break}return this.setState({isAuthenticated:!0}),e.abrupt("return");case 4:if(t=new URL(document.location.href).searchParams,t.get("code")){e.next=13;break}return e.next=9,n.auth.getAuthUri();case 9:r=e.sent,window.location.href=r,e.next=16;break;case 13:return e.next=15,n.auth.fetchToken(document.location.href);case 15:this.setState({isAuthenticated:!0});case 16:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){return this.state.isAuthenticated?this.props.children:a.a.createElement(ae,null)}}]),n}(r.Component);function le(){return(le=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}function ce(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var oe=a.a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M2.53025 6.28581V2.96361H6.15609C8.27475 2.96361 10.2526 3.52415 11.928 4.68335C12.4572 3.90815 13.0506 3.16005 13.7017 2.47758C11.5354 0.923799 8.94231 0 6.15609 0H0V6.28581C0 12.6432 3.79537 18.0793 8.85586 20.2004V17.0877C5.06049 15.1174 2.53025 11.0166 2.53025 6.28581ZM28.5538 5.60862C28.5538 11.6351 25.4318 17.8412 19.3059 17.8412H14.3231V13.8478C14.3231 10.8955 15.878 8.02736 18.3541 5.86647C20.7323 3.79139 24.0037 2.54889 26.9968 2.54889H28.5538V5.60862ZM26.9968 0.000169915C19.8651 0.000169915 11.8118 5.58441 11.8118 13.8478V20.3899H19.3059C22.8896 20.3899 25.9044 18.8297 28.1197 15.8388C30.1346 13.1193 31.0651 9.54215 31.0651 5.60862V0.000169915H26.9968ZM43.8422 20.0801V12.4276L45.1437 10.9796L51.7828 20.0801H54.7777L46.9175 9.16768L54.8068 0H51.6954L43.8422 8.70513V0H41.3413V20.0801H43.8422ZM67.2092 13.3772C67.2092 17.4854 65.0238 20.4409 60.7584 20.4409C56.7247 20.4409 54.4524 17.4557 54.4524 13.4068C54.4524 9.35784 56.6666 6.37274 60.8452 6.37274C64.9951 6.37274 67.2092 9.35784 67.2092 13.3772ZM60.787 8.53046C63.399 8.53046 64.8298 10.3921 64.8298 13.4068C64.8298 16.3919 63.399 18.2836 60.787 18.2836C58.2917 18.2836 56.8028 16.4215 56.8028 13.3772C56.8028 10.3921 58.2917 8.53046 60.787 8.53046ZM69.3353 6.6696H71.615V8.3017C72.4039 7.17414 74.0406 6.37274 75.9986 6.37274C79.301 6.37274 80.6746 8.18279 80.6746 11.5655V20.2004H78.3368V11.7736C78.3368 9.66667 77.6061 8.56883 75.2972 8.56883C73.719 8.56883 72.4039 9.67601 71.6731 10.5662V20.2004H69.3353V6.6696ZM88.7952 18.2436C87.5158 18.2436 86.9921 17.472 86.9921 16.2248V8.65431H90.5401V6.60574H86.9921V2.77588L84.695 3.2212V6.60574L82.1648 6.61042V8.65431H84.695V16.4921C84.695 18.8674 85.7127 20.4409 88.1264 20.4409C89.1736 20.4409 90.1621 20.203 90.831 19.8766L90.5983 17.8281C90.0456 18.0656 89.3767 18.2436 88.7952 18.2436ZM93.325 20.0801H95.6029V6.55498H93.325V20.0801ZM94.4353 0C93.5243 0 92.8408 0.504327 92.8408 1.66071C92.8408 2.81753 93.5243 3.26242 94.4353 3.26242C95.2614 3.26242 96.0301 2.81753 96.0301 1.66071C96.0301 0.504327 95.2614 0 94.4353 0ZM106.655 9.71232C105.927 8.91454 104.82 8.26397 103.277 8.26397C101.472 8.26397 100.715 9.20979 100.715 10.3032C100.715 11.1311 101.152 11.7812 102.345 12.0769L104.616 12.6086C107.091 13.2 108.314 14.441 108.314 16.3919C108.314 18.6084 106.625 20.4409 102.986 20.4409C100.191 20.4409 98.7062 19.229 97.9199 18.1947L99.3467 16.7464C100.075 17.633 100.977 18.5788 103.073 18.5788C104.733 18.5788 105.927 17.9287 105.927 16.5691C105.927 15.5641 105.199 15.032 103.947 14.7071L101.618 14.1458C99.4338 13.6136 98.3858 12.2837 98.3858 10.4809C98.3858 8.55964 99.7543 6.37274 103.365 6.37274C105.752 6.37274 107.266 7.34817 108.023 8.26397L106.655 9.71232ZM115.947 18.2423C114.656 18.2423 114.128 17.4702 114.128 16.2223V8.64738H117.707V6.59762H114.128V2.76553L111.811 3.21111V6.59762L109.259 6.59719V8.64738H111.811V16.4897C111.811 18.8664 112.838 20.4408 115.272 20.4408C116.328 20.4408 117.325 20.2028 118 19.8762L117.765 17.8265C117.208 18.0641 116.533 18.2423 115.947 18.2423Z",fill:"#5A2FB1"}),se=function(e){var n=e.svgRef,t=e.title,r=ce(e,["svgRef","title"]);return a.a.createElement("svg",le({width:118,height:21,viewBox:"0 0 118 21",fill:"none",ref:n},r),t?a.a.createElement("title",null,t):null,oe)},ue=a.a.forwardRef((function(e,n){return a.a.createElement(se,le({svgRef:n},e))}));t.p;function de(){var e=Object(M.a)(["\n  width: 660px;\n  max-width: calc(100% - 1rem);\n"]);return de=function(){return e},e}function pe(){var e=Object(M.a)(["\n  height: 30px;\n  width: 100%;\n  flex-shrink: 0;\n"]);return pe=function(){return e},e}function me(){var e=Object(M.a)(["\n  display: flex;\n  flex-shrink: 0;\n  justify-content: center;\n  padding: 1.5rem;\n  margin-bottom: 1rem;\n"]);return me=function(){return e},e}var fe=G.a.header(me()),he=function(){return a.a.createElement(fe,null,a.a.createElement(ue,null))},be=G.a.footer(pe()),ge=G.a.main(de()),ve=function(e){return a.a.createElement(r.Fragment,null,a.a.createElement(he,null),a.a.createElement(ge,null,e.children),a.a.createElement(be,null))};function ye(){var e=Object(M.a)(["\n  font-size: 22px;\n  line-height: 120%;\n  color: ",";\n\n  &.align-center {\n    text-align: center;\n  }\n"]);return ye=function(){return e},e}function xe(){var e=Object(M.a)(["\n  font-size: 26px;\n  line-height: 100%;\n  color: ",";\n  padding-bottom: 12px;\n  &.align-center {\n    text-align: center;\n  }\n"]);return xe=function(){return e},e}function Ce(){var e=Object(M.a)(["\n  font-size: 20px;\n  line-height: 140%;\n  padding-bottom: 16px;\n  color: ",";\n\n  &.without-padding {\n    padding-bottom: 0;\n  }\n\n  &.primary-black {\n    color: ",";\n  }\n\n  &.bold {\n    font-weight: 500;\n  }\n\n  &.small {\n    font-size: 18px;\n  }\n\n  &.x-small {\n    font-size: 16px;\n  }\n\n  &.italic {\n    font-style: italic;\n  }\n\n  &.align-center {\n    text-align: center;\n  }\n\n  @media (max-width: 800px) {\n    font-size: 22px;\n  }\n\n  @media (max-width: 800px) {\n    font-size: 18px;\n  }\n"]);return Ce=function(){return e},e}var Oe=G.a.p(Ce(),K.darkGrey,K.primaryBlack),Ee=G.a.h1(xe(),K.primaryBlack),we=G.a.h4(ye(),K.primaryBlack);function je(){var e=Object(M.a)(["\n  border-style: none;\n  outline: none;\n  cursor: pointer;\n  color: white;\n  min-height: 50px;\n  display: flex;\n  align-items: center;\n  font-weight: 500;\n  font-size: 18px;\n  justify-content: center;\n  border-radius: 4px;\n  padding: 0 32px;\n  background-color: ",";\n  transition: all 0.2s ease;\n  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px;\n  position: relative;\n  z-index: 1;\n\n  &:hover:not([disabled]) {\n    background-color: ",";\n  }\n"]);return je=function(){return e},e}var ke=Object(G.a)(s.b)(je(),K.primaryPurple,K.black);function Le(){var e=Object(M.a)(["\n  border-top: 0.25rem solid ",";\n  border-top-left-radius: 0.25rem;\n  border-top-right-radius: 0.25rem;\n  padding: 1rem;\n  min-height: 30px;\n  display: flex;\n  align-items: center;\n  border-bottom: 1px solid ",";\n"]);return Le=function(){return e},e}function Se(){var e=Object(M.a)(["\n  border-radius: 0.25rem;\n  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);\n"]);return Se=function(){return e},e}var Ae=G.a.div(Se()),De=G.a.div(Le(),K.secondaryPurple,K.veryLightGrey),Te=function(e){return a.a.createElement(Ae,null,a.a.createElement(De,null,e.renderTitle()),e.children)};function Re(){return(Re=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}function Ue(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var Fe=a.a.createElement("path",{d:"M42.5557 83C65.1993 83 83.5557 64.6437 83.5557 42C83.5557 19.3563 65.1993 1 42.5557 1C19.912 1 1.55566 19.3563 1.55566 42C1.55566 64.6437 19.912 83 42.5557 83Z",fill:"#BCDEDE",stroke:"white",strokeWidth:2}),Pe=a.a.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M29.5644 40.6665L25.667 44.6665L36.0602 55.3332L59.4448 32.6665L55.5473 28.6665L36.0602 47.3332L29.5644 40.6665Z",fill:"#348288"}),Ne=function(e){var n=e.svgRef,t=e.title,r=Ue(e,["svgRef","title"]);return a.a.createElement("svg",Re({width:85,height:84,viewBox:"0 0 85 84",fill:"none",ref:n},r),t?a.a.createElement("title",null,t):null,Fe,Pe)},Be=a.a.forwardRef((function(e,n){return a.a.createElement(Ne,Re({svgRef:n},e))}));t.p;function Ie(){var e=Object(M.a)(["\n  display: flex;\n  cursor: pointer;\n  align-items: center;\n  svg:nth-of-type(1) {\n    height: 40px;\n    width: 40px;\n    z-index: 2;\n  }\n\n  svg {\n    position: relative;\n    &.empty {\n      path:nth-of-type(1) {\n        fill: ",";\n      }\n      path:nth-of-type(2) {\n        fill: #fff;\n      }\n    }\n  }\n"]);return Ie=function(){return e},e}function Ve(){var e=Object(M.a)(["\n  padding-left: 1rem;\n  cursor: pointer;\n\n  &.empty {\n    color: ",";\n  }\n"]);return Ve=function(){return e},e}var He=G.a.label(Ve(),K.darkGrey),Me=G.a.div(Ie(),K.veryLightGrey),Ge=function(){},$e=function(e){var n=e.checked,t=e.handleClick,r=e.label,i=e.disabled;return a.a.createElement(Me,{onClick:i?Ge:t},a.a.createElement(Be,{className:n?"":"empty"}),a.a.createElement(He,{className:n?"":"empty"},r))};function ze(){var e=Object(M.a)(["\n  border-style: none;\n  outline: none;\n  cursor: pointer;\n  color: white;\n  min-width: 150px;\n  min-height: 50px;\n  display: flex;\n  align-items: center;\n  font-weight: 500;\n  font-size: 18px;\n  justify-content: center;\n  border-radius: 4px;\n  padding: 0 32px;\n  background-color: ",";\n  transition: all 0.2s ease;\n  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px;\n  position: relative;\n  z-index: 1;\n\n  &.destructive {\n    background-color: ",";\n  }\n\n  &:hover:not([disabled]) {\n    background-color: ",";\n  }\n\n  &:disabled {\n    color: ",";\n    cursor: not-allowed;\n  }\n"]);return ze=function(){return e},e}function Ze(){var e=Object(M.a)(["\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  position: absolute;\n  left: calc(50% - 12px);\n"]);return Ze=function(){return e},e}var Qe=G.a.div(Ze()),We=G.a.button(ze(),K.primaryPurple,K.darkRed,K.black,K.transparentWhite),Ye=function(e){var n=e.children,t=e.disabled,r=e.loading,i=e.onClick,l=e.destructive,c=e.type,o=void 0===c?"submit":c;return a.a.createElement(We,{type:o,disabled:t||r,onClick:i,className:z()({destructive:l})},r&&a.a.createElement(Qe,null,a.a.createElement(ne,{small:!0,white:!0})),n)},_e={dashboard:{title:"Welcome to the Kontist API Console",subtitle:"You can manage your OAuth2 clients below",actionBar:{title:"OAuth2 clients",button:"Create client"},clientList:{emptyListText:"You don't have any existing clients yet.",nameTitle:"Client name",uriTitle:"Redirect URI"},clientDetails:{id:"Client ID",name:"Name",redirectUri:"Redirect URI",updateClientLabel:"Update client",deleteClientLabel:"Delete client"}},createClient:{title:"Create client",buttonLabel:"Create client"},updateClient:{title:"Update client",buttonLabel:"Update client",secretInformation:"Submitting a secret with the update will override the existing secret"},clientForm:{name:"Name",redirectUri:"Redirect URI",secret:"Secret",optionalFields:"Optional",placeholders:{name:"Client name",redirectUri:"https://redirect.uri/callback",secret:"Secret"}},clientDeletion:{title:"Please confirm you want to delete the following OAuth2 client:",subtitle:"This action is not reversible.",confirm:"Delete client",cancel:"Cancel"},scopes:{OFFLINE:"Offline",ACCOUNTS:"Accounts",USERS:"Users",TRANSACTIONS:"Transactions",TRANSFERS:"Transfers",SUBSCRIPTIONS:"Subscriptions",STATEMENTS:"Statements",title:"Scopes"},backButtonLabel:"Back"};function Ke(){var e=Object(M.a)(["\n  display: flex;\n  width: 100%;\n  justify-content: center;\n\n  & > *:first-child {\n    margin-right: 1rem;\n  }\n\n  @media (max-width: 800px) {\n    flex-direction: column;\n    margin-top: 1rem;\n\n    & > *:first-child {\n      margin-right: 0;\n      margin-bottom: 0.5rem;\n    }\n  }\n"]);return Ke=function(){return e},e}var Je=G.a.div(Ke()),qe={overlay:{zIndex:2,backgroundColor:"rgba(0, 0, 0, 0.5)"},content:{top:"50%",left:"50%",right:"auto",bottom:"auto",marginRight:"-50%",transform:"translate(-50%, -50%)",width:"420px",maxWidth:"calc(100% - 4rem)",border:"none"}},Xe=function(e){var n=e.isOpen,t=e.closeModal,r=e.deleteClient,i=e.client,l=e.isLoading;return a.a.createElement(o.a,{isOpen:n,onRequestClose:t,contentLabel:"Confirm client deletion",style:qe},a.a.createElement(we,{className:"align-center"},_e.clientDeletion.title),a.a.createElement(Oe,{className:"italic align-center"},_e.clientDeletion.subtitle),a.a.createElement(mn,{name:_e.dashboard.clientDetails.id,value:i.id}),a.a.createElement(mn,{name:_e.dashboard.clientDetails.name,value:i.name}),a.a.createElement(Je,null,a.a.createElement(Ye,{onClick:r,loading:l,destructive:!0},_e.clientDeletion.confirm),a.a.createElement(Ye,{onClick:t},_e.clientDeletion.cancel)))};function en(){var e=Object(M.a)(["\n  display: flex;\n  width: 100%;\n  justify-content: center;\n\n  & > *:first-child {\n    margin-right: 1rem;\n  }\n\n  @media (max-width: 800px) {\n    flex-direction: column;\n    margin-top: 1rem;\n\n    & > *:first-child {\n      margin-right: 0;\n      margin-bottom: 0.5rem;\n    }\n  }\n"]);return en=function(){return e},e}function nn(){var e=Object(M.a)(["\n  flex: 0 0 30%;\n  padding-bottom: 1rem;\n\n  &.wide {\n    flex: 0 0 70%;\n  }\n\n  @media (max-width: 800px) {\n    flex: 0 0 100%;\n    padding-bottom: 0;\n\n    &.wide {\n      flex: 0 0 100%;\n    }\n  }\n"]);return nn=function(){return e},e}function tn(){var e=Object(M.a)(["\n  padding: 1rem;\n  border-bottom: 1px solid ","\n  display: flex;\n  flex-wrap: wrap;\n"]);return tn=function(){return e},e}function rn(){var e=Object(M.a)([""]);return rn=function(){return e},e}function an(){var e=Object(M.a)(["\n  padding-bottom: 0.5rem;\n"]);return an=function(){return e},e}function ln(){var e=Object(M.a)(["\n  text-align: right;\n  padding-left: 1rem;\n"]);return ln=function(){return e},e}function cn(){var e=Object(M.a)(["\n  flex: 1;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"]);return cn=function(){return e},e}function on(){var e=Object(M.a)(["\n  cursor: pointer;\n  display: block;\n  padding: 1rem;\n  height: 2rem;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid ",";\n"]);return on=function(){return e},e}var sn=G.a.div(on(),K.veryLightGrey),un=Object(G.a)(Oe)(cn()),dn=Object(G.a)(un)(ln()),pn=G.a.div(an()),mn=function(e){var n=e.name,t=e.value;return a.a.createElement(pn,null,a.a.createElement(Oe,{className:"primary-black bold without-padding"},n),a.a.createElement(Oe,{className:"primary-black"},t))},fn=G.a.div(rn()),hn=function(e){var n=e.scopes,t=e.title;return a.a.createElement(fn,null,a.a.createElement(Oe,{className:"primary-black bold"},t),n.map((function(e){return a.a.createElement($e,{label:_e.scopes[e],key:e,checked:!0,disabled:!0})})))},bn=G.a.div(tn(),K.veryLightGrey),gn=G.a.div(nn()),vn=G.a.div(en()),yn=function(e){function n(e){var t;return Object(b.a)(this,n),(t=Object(v.a)(this,Object(y.a)(n).call(this,e))).toggleDetails=function(){t.setState((function(e){return{expanded:!e.expanded}}))},t.openDeletionConfirmation=function(){t.setState({modalOpen:!0})},t.closeDeletionConfirmation=function(){t.setState({modalOpen:!1})},t.deleteClient=Object(h.a)(f.a.mark((function e(){return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.props.deleteClient({id:t.props.client.id});case 2:case"end":return e.stop()}}),e)}))),t.state={expanded:!1,modalOpen:!1},t}return Object(x.a)(n,e),Object(g.a)(n,[{key:"render",value:function(){var e=this.state,n=e.expanded,t=e.modalOpen,i=this.props.client;return a.a.createElement(r.Fragment,null,a.a.createElement(sn,{onClick:this.toggleDetails},a.a.createElement(un,{className:"without-padding primary-black"},i.name),a.a.createElement(dn,{className:"without-padding"},i.redirectUri)),n&&a.a.createElement(bn,null,a.a.createElement(gn,{className:"wide"},a.a.createElement(mn,{name:_e.dashboard.clientDetails.id,value:i.id}),a.a.createElement(mn,{name:_e.dashboard.clientDetails.name,value:i.name}),a.a.createElement(mn,{name:_e.dashboard.clientDetails.redirectUri,value:i.redirectUri||""})),a.a.createElement(gn,null,a.a.createElement(hn,{scopes:i.scopes||[],title:_e.scopes.title})),a.a.createElement(vn,null,a.a.createElement(ke,{to:"/clients/update/".concat(i.id)},_e.dashboard.clientDetails.updateClientLabel),a.a.createElement(Ye,{onClick:this.openDeletionConfirmation,destructive:!0},_e.dashboard.clientDetails.deleteClientLabel))),a.a.createElement(Xe,{isOpen:t,closeModal:this.closeDeletionConfirmation,deleteClient:this.deleteClient,client:i}))}}]),n}(r.Component);function xn(){var e=Object(M.a)(["\n  display: flex;\n  height: 100%;\n  width: 100%;\n  justify-content: space-between;\n"]);return xn=function(){return e},e}var Cn=G.a.div(xn()),On=function(e){return 0===e.clients.length?a.a.createElement(Oe,null,_e.dashboard.clientList.emptyListText):a.a.createElement(Te,{renderTitle:function(){return a.a.createElement(Cn,null,a.a.createElement(Oe,{className:"without-padding primary-black bold"},_e.dashboard.clientList.nameTitle),a.a.createElement(Oe,{className:"without-padding  primary-black bold"},_e.dashboard.clientList.uriTitle))}},e.clients.map((function(n){return a.a.createElement(yn,{key:n.id,client:n,deleteClient:e.deleteClient})})))};function En(){var e=Object(M.a)(["\n  padding: 1rem 0;\n  display: flex;\n  align-items: center;\n\n  &.spaced {\n    justify-content: space-between;\n  }\n"]);return En=function(){return e},e}var wn=G.a.div(En()),jn=function(e){return a.a.createElement(wn,{className:e.className},e.title&&a.a.createElement(Oe,{className:"without-padding"},e.title),e.children)};function kn(){var e=Object(M.a)(["\n  margin-bottom: 1rem;\n"]);return kn=function(){return e},e}var Ln=G.a.div(kn()),Sn=T((function(e){return a.a.createElement(ve,null,a.a.createElement(Ln,null,a.a.createElement(Ee,{className:"align-center"},_e.dashboard.title),a.a.createElement(Oe,{className:"align-center"},_e.dashboard.subtitle)),e.isLoading&&0===e.oAuthClients.length?a.a.createElement(ne,null):a.a.createElement(r.Fragment,null,a.a.createElement(jn,{title:_e.dashboard.actionBar.title,className:"spaced"},a.a.createElement(ke,{to:"/clients/create"},_e.dashboard.actionBar.button)),a.a.createElement(On,{clients:e.oAuthClients,deleteClient:e.deleteClient})))}));function An(){return(An=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}function Dn(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var Tn=a.a.createElement("line",{x1:20.5,y1:12.05,x2:5.5,y2:12.05,stroke:"#5A2FB1",strokeWidth:2.5}),Rn=a.a.createElement("path",{d:"M11 18L4.11577 11.1157",stroke:"#5A2FB1",strokeWidth:2.5}),Un=a.a.createElement("path",{d:"M11 6L5 12",stroke:"#5A2FB1",strokeWidth:2.5}),Fn=function(e){var n=e.svgRef,t=e.title,r=Dn(e,["svgRef","title"]);return a.a.createElement("svg",An({width:24,height:24,viewBox:"0 0 24 24",fill:"none",ref:n},r),t?a.a.createElement("title",null,t):null,Tn,Rn,Un)},Pn=a.a.forwardRef((function(e,n){return a.a.createElement(Fn,An({svgRef:n},e))}));t.p;function Nn(){var e=Object(M.a)(["\n  outline: none;\n  cursor: pointer;\n  min-height: 50px;\n  display: flex;\n  align-items: center;\n  font-weight: 500;\n  font-size: 18px;\n  justify-content: center;\n  flex-direction: column;\n  transition: all 0.2s ease;\n  position: relative;\n  z-index: 1;\n  background-color: ",";\n  color: ",";\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);\n  border-radius: 50%;\n  width: 50px;\n  padding: 0;\n  margin-right: 1rem;\n\n  svg path {\n    fill: ",";\n  }\n\n  &:hover:not([disabled]) {\n    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);\n    background: #eee;\n  }\n\n  &.center {\n    margin: 0 auto;\n  }\n\n  &:disabled {\n    color: ",";\n    cursor: not-allowed;\n  }\n"]);return Nn=function(){return e},e}var Bn=G.a.button(Nn(),K.white,K.primaryPurple,K.primaryPurple,K.transparentPrimaryPurple),In=function(e){var n=e.disabled,t=e.loading,r=e.onClick;return a.a.createElement(Bn,{type:"button",disabled:n||t,onClick:r},a.a.createElement(Pn,null))};function Vn(){var e=Object(M.a)(["\n  flex: 5;\n  font-size: 18px;\n  line-height: 140%;\n  height: 50px;\n  width: 100%;\n  width: fill-available;\n  background: rgba(0, 0, 0, 0.05);\n  padding: 0 12px;\n  display: block;\n  opacity: 1;\n  border-radius: 4px;\n  border: 2px solid transparent;\n  box-sizing: border-box;\n  color: ",";\n  transition: all 0.3s;\n\n  &.invalid {\n    border: 2px solid ",";\n    color: ",";\n  }\n\n  &.invalid:focus {\n    border: 2px solid ",";\n    color: ",";\n  }\n\n  &::placeholder {\n    color: ",";\n  }\n\n  &:focus {\n    border: 2px solid ",";\n    color: ","!important;\n    outline: none;\n    &::placeholder {\n      color: ",";\n    }\n  }\n\n  &:active {\n    border: 2px solid ",";\n    color: ",";\n  }\n\n  &:disabled {\n    opacity: 1;\n    -webkit-text-fill-color: ",";\n  }\n"]);return Vn=function(){return e},e}function Hn(){var e=Object(M.a)(["\n  font-size: 16px;\n  font-style: italic;\n  color: ",";\n  padding-left: 0.5rem;\n"]);return Hn=function(){return e},e}function Mn(){var e=Object(M.a)(["\n  flex: 3;\n  padding-right: 1rem;\n  font-size: 18px;\n\n  @media (max-width: 800px) {\n    padding-bottom: 0.5rem;\n    flex-basis: 100%;\n  }\n"]);return Mn=function(){return e},e}function Gn(){var e=Object(M.a)(["\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 100%;\n  padding-bottom: 0.5rem;\n\n  @media (max-width: 800px) {\n    flex-wrap: wrap;\n  }\n"]);return Gn=function(){return e},e}var $n=G.a.div(Gn()),zn=G.a.label(Mn()),Zn=G.a.span(Hn(),K.darkGrey),Qn=G.a.input(Vn(),K.primaryBlack,K.darkRed,K.darkRed,K.darkRed,K.darkRed,K.midDarkGrey,K.midDarkGrey,K.primaryBlack,K.midGrey,K.midDarkGrey,K.primaryBlack,K.primaryBlack),Wn=function(e){var n=e.placeholder,t=void 0===n?"":n,r=e.value,i=e.label,l=e.type,c=void 0===l?"text":l,o=e.handleChange,s=e.optional,u=e.isInvalid,d=void 0!==u&&u;return a.a.createElement($n,null,a.a.createElement(zn,null,i,s&&a.a.createElement(Zn,null,_e.clientForm.optionalFields)),a.a.createElement(Qn,{type:c,placeholder:t,className:d?"invalid":"",value:r||"",onChange:o}))};function Yn(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function _n(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?Yn(t,!0).forEach((function(n){Object(p.a)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Yn(t).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function Kn(){var e=Object(M.a)(["\n  display: flex;\n  justify-content: center;\n"]);return Kn=function(){return e},e}function Jn(){var e=Object(M.a)(["\n  display: flex;\n  flex-wrap: wrap;\n  padding-bottom: 0.5rem;\n\n  & > * {\n    flex: 1 0 50%;\n    position: relative;\n    left: 1rem;\n  }\n\n  @media (max-width: 800px) {\n    flex-direction: column;\n\n    & > * {\n      flex: 1 0 100%;\n      left: 0;\n    }\n  }\n"]);return Jn=function(){return e},e}function qn(){var e=Object(M.a)(["\n  padding: 1rem;\n"]);return qn=function(){return e},e}function Xn(){var e=Object(M.a)(["\n  height: 1px;\n  width: 100%;\n  margin: 0.5rem 0 1rem;\n  background-color: ",";\n"]);return Xn=function(){return e},e}var et=G.a.div(Xn(),K.veryLightGrey),nt=G.a.form(qn()),tt=G.a.div(Jn()),rt=function(e){var n=e.title,t=e.children;return a.a.createElement(r.Fragment,null,a.a.createElement(Oe,{className:"primary-black small"},n),a.a.createElement(tt,null,t))},at=G.a.div(Kn()),it=function(e){return n=e.scopes,Object.values(n).some((function(e){return e}))&&Boolean(e.redirectUri)&&Boolean(e.name);var n},lt=function(e){var n={isValid:!1,name:void 0,redirectUri:void 0,secret:void 0,scopes:{OFFLINE:!1,ACCOUNTS:!1,USERS:!1,TRANSACTIONS:!1,TRANSFERS:!1,SUBSCRIPTIONS:!1,STATEMENTS:!1}};return _n({},n,{},e?{isValid:!0,name:e.name,redirectUri:e.redirectUri,scopes:_n({},n.scopes,{},(e.scopes||[]).reduce((function(e,n){return _n({},e,Object(p.a)({},n,!0))}),{}))}:{})},ct=function(e){function n(e){var t;return Object(b.a)(this,n),(t=Object(v.a)(this,Object(y.a)(n).call(this,e))).handleTextInputChange=function(e){return function(n){var r=n.target.value;t.setState((function(n){var t=_n({},n,Object(p.a)({},e,r));return _n({},t,{isValid:it(t)})}))}},t.handleCheckboxClick=function(e){return function(){t.setState((function(n){var t=_n({},n.scopes,Object(p.a)({},e,!n.scopes[e])),r=_n({},n,{scopes:t});return _n({},r,{isValid:it(r)})}))}},t.submitForm=function(){var e=Object(h.a)(f.a.mark((function e(n){var r,a,i,l,c,o;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n.preventDefault(),r=t.state,a=r.name,i=r.redirectUri,l=r.secret,c=r.scopes,o=t.props.client,e.next=5,t.props.action(_n({},o?{id:o.id}:{},{name:a,redirectUri:i,secret:l,scopes:Object.keys(c).filter((function(e){return c[e]}))}));case 5:t.props.history.push("/clients");case 6:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),t.state=lt(e.client),t}return Object(x.a)(n,e),Object(g.a)(n,[{key:"render",value:function(){var e=this,n=this.state,t=n.name,r=n.redirectUri,i=n.secret,l=n.scopes,c=n.isValid,o=this.props,s=o.buttonLabel,u=o.isLoading,d=o.client,p=Boolean(d);return a.a.createElement(nt,{onSubmit:this.submitForm},a.a.createElement(Wn,{label:_e.clientForm.name,placeholder:_e.clientForm.placeholders.name,value:t,handleChange:this.handleTextInputChange("name")}),a.a.createElement(Wn,{label:_e.clientForm.redirectUri,placeholder:_e.clientForm.placeholders.redirectUri,value:r||"",handleChange:this.handleTextInputChange("redirectUri")}),a.a.createElement(Wn,{label:_e.clientForm.secret,placeholder:_e.clientForm.placeholders.secret,value:i,optional:!0,handleChange:this.handleTextInputChange("secret")}),p&&a.a.createElement(Oe,{className:"italic x-small"},_e.updateClient.secretInformation),a.a.createElement(rt,{title:_e.scopes.title},Object.keys(l).map((function(n){return a.a.createElement($e,{label:_e.scopes[n],key:n,checked:l[n],handleClick:e.handleCheckboxClick(n)})}))),a.a.createElement(et,null),a.a.createElement(at,null,a.a.createElement(Ye,{type:"submit",loading:u,disabled:!c},s)))}}]),n}(r.Component),ot=T((function(e){var n=e.createClient,t=e.isLoading,r=e.history;return a.a.createElement(ve,null,a.a.createElement(jn,null,a.a.createElement(In,{onClick:function(){return r.goBack()}}),a.a.createElement(Oe,{className:"without-padding primary-black"},_e.backButtonLabel)),a.a.createElement(Te,{renderTitle:function(){return a.a.createElement(Oe,{className:"without-padding primary-black bold"},_e.createClient.title)}},a.a.createElement(ct,{action:n,buttonLabel:_e.createClient.buttonLabel,isLoading:t,history:r})))})),st=T((function(e){var n=e.oAuthClients,t=e.updateClient,r=e.isLoading,i=e.history,l=e.match.params.clientId,c=n.find((function(e){return e.id===l}));return a.a.createElement(ve,null,a.a.createElement(jn,null,a.a.createElement(In,{onClick:function(){return i.goBack()}}),a.a.createElement(Oe,{className:"without-padding primary-black"},_e.backButtonLabel)),a.a.createElement(Te,{renderTitle:function(){return a.a.createElement(Oe,{className:"without-padding primary-black bold"},_e.updateClient.title)}},a.a.createElement(ct,{client:c,action:t,buttonLabel:_e.updateClient.buttonLabel,isLoading:r,history:i})))}));o.a.setAppElement("#root");var ut=function(){return a.a.createElement(H,null,(function(e){return a.a.createElement(s.a,{basename:"/console"},a.a.createElement(ie,{kontistClient:e},a.a.createElement(D,{kontistClient:e},a.a.createElement(u.c,null,a.a.createElement(u.a,{path:"/",exact:!0,component:Sn}),a.a.createElement(u.a,{path:"/clients",exact:!0,component:Sn}),a.a.createElement(u.a,{path:"/clients/create",exact:!0,component:ot}),a.a.createElement(u.a,{path:"/clients/update/:clientId",exact:!0,component:st})))))}))};l.a.render(a.a.createElement(ut,null),document.getElementById("root"))},47:function(e,n){e.exports={appDirectory:"console",baseAPIUrl:"https://api.kontist.com",clientId:"fe8055d9-f496-49e9-9551-5b416139630e",redirectUri:"https://kontist.dev/console/"}},54:function(e,n,t){e.exports=t(142)},59:function(e,n,t){},74:function(e,n){}},[[54,1,2]]]);
//# sourceMappingURL=main.a66a499a.chunk.js.map