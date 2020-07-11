/**
 * @overview ccm component for modularcms backend
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

( () => {

  const component = {

    name: 'cms',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

    config: {
      "css": [ "ccm.load",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/colors.css",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/style.css",
        "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
      ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
      "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cms/resources/html/cms.html" ],
      "logo": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg",
      "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
      "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
      "user": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/user/versions/ccm.user-10.0.0.js" ],
      "menu": [
        {"title": "Pages", "route": "/pages"},
        {"title": "Users", "route": "/users", "role": "admin"},
        {"title": "Theme definitions", "route": "/theme-definitions", "role": "admin"}
      ],
      "page_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/page_manager/versions/ccm.page_manager-1.0.0.js" ],
      "website_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/website_manager/versions/ccm.website_manager-1.0.0.js" ],
      "user_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/user_manager/versions/ccm.user_manager-1.0.0.js" ],
      "theme_definition_manager": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/theme_definition_manager/versions/ccm.theme_definition_manager-1.0.0.js" ],
      "profile_editor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/profile_editor/versions/ccm.profile_editor-1.0.0.js" ],
      "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
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
            } else if (detail.url.indexOf('/theme-definitions') == 0) {
              if (currentContent != '/theme-definitions') {
                await this.theme_definition_manager.start();
                $.setContent(content, this.theme_definition_manager.root, {});
                currentContent = '/theme-definitions';
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
          const newUrl = window.location.pathname.split('/').filter((item, index) => index <= 1).join('/');
          if (newUrl != window.location.pathname) {
            this.routing.navigateTo(newUrl);
          } else {
            this.routing.changeUrl(newUrl, true);
          }
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
