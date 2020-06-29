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
      // "apps": [ "ccm.store", { "name": "dms-apps", "url": "https://ccm2.inf.h-brs.de" } ],
      "css": [ "ccm.load",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/colors.css",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/style.css",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
      ],
      //    "component_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/component_manager/versions/ccm.component_manager-3.4.1.js" ],
      // "components": [ "ccm.store", { "name": "dms-components", "url": "https://ccm2.inf.h-brs.de" } ],
      //    "default_icon": "https://modularcms.github.io/modularcms-components/cms/resources/img/default.png",
      //    "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "component_meta" ] ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
      "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cms/resources/html/cms.html" ],
      //    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
      //    "listing": { "apps": [ "ccm.component", ... ], "components": [ "ccm.component", ... ] },
      //    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
      "logo": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg",
      //    "rating": { "apps": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] }, { "components": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] } },
      "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
      "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
      "user": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/user/versions/ccm.user-10.0.0.js" ],
      "menu": [
        {"title": "Pages", "route": "/pages"},
        {"title": "Users", "route": "/users", "role": "admin"},
        {"title": "Themes", "route": "/themes", "role": "admin"},
        {"title": "Layouts", "route": "/layouts", "role": "admin"}
      ],
      "page_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/page_manager/versions/ccm.page_manager-1.0.0.js" ],
      "website_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/website_manager/versions/ccm.website_manager-1.0.0.js" ],
      "user_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/user_manager/versions/ccm.user_manager-1.0.0.js" ],
      "theme_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/theme_manager/versions/ccm.theme_manager-1.0.0.js" ],
      "layout_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/layout_manager/versions/ccm.layout_manager-1.0.0.js" ],
      "profile_editor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/profile_editor/versions/ccm.profile_editor-1.0.0.js" ],
      "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );  // logging of 'ready' event
      };

      let content;
      let currentContent = '';

      /**
       * Component start closure
       * @returns {Promise<void>}
       */
      this.start = async () => {
        // logging of 'start' event
        this.logger && this.logger.log('start');

        // load all published apps and components

        // render main HTML structure
        $.setContent(this.element, $.html(this.html.main, {logo: this.logo, title: this.title}));

        // init website manager
        if ( this.website_manager ) { $.append( this.element.querySelector('#website-manager-wrapper'), this.website_manager.root ); this.website_manager.start(); }

        // load editor.js
        let editorJsScriptElement = document.createElement('script');
        editorJsScriptElement.src = 'https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest';
        document.head.appendChild(editorJsScriptElement);

        // select content area
        content = this.element.querySelector('#content');
        const menu = this.element.querySelector('#menu');
        const hamburger = this.element.querySelector('#hamburger-button');

        if ( this.user ) { $.append( this.element.querySelector('#user-component-wrapper'), this.user.root ); this.user.start(); }

        // create menu items
        await this.renderMenu();

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

        // user authentication
        loggedIn = this.user && this.user.isLoggedIn();

        // listen to routes
        currentContent = '';
        await this.routing.registerRoutingCallback(async (detail) => {
          // handle routes with user logged in
          if (loggedIn) {
            // handle the different routes
            if (detail.url == '/') {
              this.routing.navigateTo('/pages');
            } else if (detail.url.indexOf('/pages') == 0) {
              if (currentContent != '/pages') {
                await this.page_manager.start();
                $.setContent(content, this.page_manager.root, {});
                currentContent = '/pages';
              }
            } else if (detail.url.indexOf('/users') == 0) {
              if (currentContent != '/users') {
                await this.user_manager.start();
                $.setContent(content, this.user_manager.root, {});
                currentContent = '/users';
              }
            } else if (detail.url.indexOf('/themes') == 0) {
              if (currentContent != '/themes') {
                await this.theme_manager.start();
                $.setContent(content, this.theme_manager.root, {});
                currentContent = '/themes';
              }
            } else if (detail.url.indexOf('/layouts') == 0) {
              if (currentContent != '/layouts') {
                await this.layout_manager.start();
                $.setContent(content, this.layout_manager.root, {});
                currentContent = '/layouts';
              }
            } else if (detail.url.indexOf('/profile') == 0) {
              if (currentContent != '/profile') {
                await this.profile_editor.start();
                $.setContent(content, this.profile_editor.root, {});
                currentContent = '/profile';
              }
            } else if (detail.url.indexOf('/websites') != 0) {
              currentContent = detail.url;
              $.setContent(content, $.html(this.html.error404, {}));
            }
          }
          // handle routes with user logged out
          else {
            if (detail.url != '/login' && detail.url != '/register') {
              this.user && this.user.abortLogin();
              this.user && this.user.abortRegister();
            }

            // handle the different routes
            switch(detail.url) {
              case '/login':
                // Handle the login
                this.user.login().then(() => {
                  this.changeLoginState(true);
                }).catch(() => {
                  this.changeLoginState(this.user && this.user.isLoggedIn());
                });
                break;
              case '/register':
                // handle the account registration
                this.user.register().then(() => {
                  this.changeLoginState(true);
                }).catch(() => {
                  this.changeLoginState(this.user && this.user.isLoggedIn());
                });
                break;
            }
          }

          //mark the right menu item as active
          this.markMenuItemActive();

          //hide the mobile menu on routing change
          if (hamburger.classList.contains('active')) {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
          }
        }, this.index);
        window.addEventListener('selectedWebsiteChanged', async () => {
          this.routing.changeUrl(window.location.pathname, true);
          await this.renderMenu();
        })

        // user authentication
        await this.changeLoginState(loggedIn, true);
      };


      let loggedIn;
      /**
       * CHanges the login state
       * @param {boolean} newState  The new login state
       * @param {boolean} force     Should the state be forced?
       * @returns {Promise<void>}
       */
      this.changeLoginState = async (newState, force = false) => {
        if (loggedIn != newState || force) {
          loggedIn = newState;
          if (loggedIn) {
            if (window.location.pathname === '/login') {
              this.routing.navigateRoot('/pages');
              await this.website_manager.start();
              await this.renderMenu();
            } else if (window.location.pathname === '/register') {
              await this.website_manager.start();
              this.routing.navigateRoot('/websites/create');
            }
            this.element.classList.add('loggedIn');
          } else {
            this.routing.navigateRoot('/login');
            this.element.classList.remove('loggedIn');
          }
        }
      }

      /**
       * Renders the menu
       * @returns {Promise<void>}
       */
      this.renderMenu = async () => {
        const menuWrapper = this.element.querySelector('#menu #menu-items-wrapper');
        const selectedWebsiteKey = await this.data_controller.getSelectedWebsiteKey();
        const username = await this.data_controller.getCurrentWorkingUsername();
        const userRole = (selectedWebsiteKey != null && username != null)?(await this.data_controller.getUserWebsiteRole(username, selectedWebsiteKey)):null;
        menuWrapper.innerHTML = '';
        this.menu.filter((item) => item.role === undefined || (userRole != null && item.role == userRole)).forEach((item) => {
          $.append(menuWrapper, $.html(this.html.menuitem, {title: item.title, route: item.route}));
        });
        this.markMenuItemActive();
      }

      /**
       * Marks the right menu item as active
       */
      this.markMenuItemActive = () => {
        const menu = this.element.querySelector('#menu');
        let menuItems = menu.querySelectorAll('#menu-items-wrapper li');
        menuItems.forEach((elem) => elem.classList.remove('active'));
        menuItems.forEach((elem) => {
          if (elem.querySelector('a').getAttribute('href') == currentContent) {
            elem.classList.add('active')
          }
        });
      }
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
