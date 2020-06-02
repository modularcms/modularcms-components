/**
 * @overview ccm component for modularcms backend
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 * @changes
 * version 1.0.0 (17.05.2020)
 * - initial commit
 */

( () => {

  const component = {

    name: 'cms',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

    config: {
      //    "add_version": true,
      //    "analytics": [ "ccm.component", "https://ccmjs.github.io/akless-components/dms_analytics/versions/ccm.dms_analytics-1.1.0.js" ],
      //    "app_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/app_manager/versions/ccm.app_manager-2.0.1.js" ],
      "apps": [ "ccm.store", { "name": "dms-apps", "url": "https://ccm2.inf.h-brs.de" } ],
      "css": [ "ccm.load",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/colors.css",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/style.css"
      ],
      //    "component_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/component_manager/versions/ccm.component_manager-3.4.1.js" ],
      "components": [ "ccm.store", { "name": "dms-components", "url": "https://ccm2.inf.h-brs.de" } ],
      //    "default_icon": "https://modularcms.github.io/modularcms-components/cms/resources/img/default.png",
      //    "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "component_meta" ] ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
      "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cms/resources/html/cms.html" ],
      //    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
      //    "listing": { "apps": [ "ccm.component", ... ], "components": [ "ccm.component", ... ] },
      //    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
      "logo": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg",
      //    "rating": { "apps": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] }, { "components": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] } },
      //    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js" ],
      "user": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/user/versions/ccm.user-10.0.0.js" ],
      "menu": [
        {"title": "Pages", "route": "/pages"},
        {"title": "Users", "route": "/users"},
        {"title": "Themes", "route": "/themes"},
        {"title": "Layouts", "route": "/layouts"},
        {"title": "Sites", "route": "/sites"}
      ]
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );  // logging of 'ready' event
      };

      let content;

      this.start = async () => {
        // logging of 'start' event
        this.logger && this.logger.log('start');

        // load all published apps and components

        // render main HTML structure
        $.setContent(this.element, $.html(this.html.main, {logo: this.logo, title: this.title}));

        // select content area
        content = this.element.querySelector('#content');
        const menu = this.element.querySelector('#menu');
        const hamburger = this.element.querySelector('#hamburger-button');

        if ( this.user ) { $.append( this.element.querySelector('#user-component-wrapper'), this.user.root ); this.user.start(); }

        this.menu.forEach((item) => {
          $.append(this.element.querySelector('#menu ul'), $.html(this.html.menuitem, {title: item.title}));
        })

        // hamburger button
        hamburger.onclick = () => {
          if (hamburger.classList.contains('active')) {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
          } else {
            menu.classList.add('active');
            hamburger.classList.add('active');
          }
        };

        loggedIn = this.user && this.user.isLoggedIn();
        this.changeLoginState(loggedIn);
        if (!loggedIn) {
          this.user.login().then(() => {
            this.changeLoginState(true);
          }).catch(() => {
            this.changeLoginState(false);
          });
        }
      };

      let loggedIn;
      this.changeLoginState = (newState) => {
        loggedIn = newState;
        if (loggedIn) {
          $.setContent(content, $.html(this.html.pages, {}));
          this.element.classList.add('loggedIn');
        } else {
          this.element.classList.remove('loggedIn');
        }
      }
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
