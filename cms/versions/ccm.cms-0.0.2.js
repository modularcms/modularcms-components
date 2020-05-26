/**
 * @overview ccm component for modularcms backend
 * @author Felix Bröhl <broehlfelix@googlemail.com> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 * @changes
 * version 1.0.0 (17.05.2020)
 * - initial commit
 */

 ( () => {

   const component = {

     name: 'cms',

     ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.4.0.js',

     config: {
 //    "add_version": true,
 //    "analytics": [ "ccm.component", "https://ccmjs.github.io/akless-components/dms_analytics/versions/ccm.dms_analytics-1.1.0.js" ],
 //    "app_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/app_manager/versions/ccm.app_manager-2.0.1.js" ],
 //    "apps": [ "ccm.store" ],
       "css": [ "ccm.load",
         "https://modularcms.github.io/modularcms-components/cms/resources/css/dms.css",
         "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
       ],
 //    "component_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/component_manager/versions/ccm.component_manager-3.4.1.js" ],
 //    "components": [ "ccm.store" ],
 //    "default_icon": "https://modularcms.github.io/modularcms-components/cms/resources/img/default.png",
 //    "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "component_meta" ] ],
       "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.0.0.mjs" ],
       "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cms/resources/html/dms.html" ],
 //    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
 //    "listing": { "apps": [ "ccm.component", ... ], "components": [ "ccm.component", ... ] },
 //    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
       "logo": "https://modularcms.github.io/modularcms-components/cms/resources/img/component.png",
       "menu": [ "ccm.component", "https://ccmjs.github.io/akless-components/menu/versions/ccm.menu-3.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "menu" ] ],
 //    "rating": { "apps": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] }, { "components": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] } },
 //    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js" ],
       "title": "Digital Makerspace"
 //    "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.5.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "user" ] ]
     },

     Instance: function () {

       let $;

       this.ready = async () => {
         $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
         this.logger && this.logger.log( 'ready', $.privatize( this, true ) );  // logging of 'ready' event
       };

       this.start = async () => {
         // logging of 'start' event
         this.logger && this.logger.log( 'start' );

         // load all published apps and components

         // render main HTML structure
         $.setContent( this.element, $.html( this.html.main, { logo: this.logo, title: this.title } ) );

         // select content area
         const content = this.element.querySelector( '#content' );
     }

   };

   let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
 } )();
