/**
 * @overview ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2017-2019
 * @license The MIT License (MIT)
 * @version 9.1.0
 * @changes
 * version 9.1.0 (15.05.2019):
 * - login function returns user data
 * - uses ccm v20.4.0
 * version 9.0.1 (03.04.2019):
 * - bug fix for realm 'hbrsinfpseudo'
 * version 9.0.0 (11.02.2019):
 * - removed realm 'idento'
 * (for older version changes see ccm.user-8.3.1.js)
 */

( () => {

  const component = {

    name: 'user', version: [ 9, 1, 0 ],

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.4.0.js',

    config: {

      "html": {
        "logged_in": {
          "id": "logged_in",
          "class": "well well-sm",
          "inner": [
            {
              "id": "user",
              "inner": [
                { "class": "glyphicon glyphicon-user" },
                "%user%"
              ]
            },
            {
              "id": "button",
              "class": "btn btn-default btn-xs",
              "inner": [
                {
                  "tag": "span",
                  "class": "glyphicon glyphicon-log-out"
                },
                "Logout"
              ],
              "onclick": "%click%"
            }
          ]
        },
        "logged_out": {
          "id": "logged_out",
          "class": "well well-sm",
          "inner": {
            "id": "button",
            "class": "btn btn-default btn-xs",
            "inner": [
              {
                "tag": "span",
                "class": "glyphicon glyphicon-log-in"
              },
              "Login"
            ],
            "onclick": "%click%"
          }
        },
        "login": {
          "id": "login-form",
          "class": "container",
          "inner": [
            {
              "id": "loginbox",
              "class": "mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2",
              "inner": {
                "class": "panel panel-info",
                "inner": [
                  {
                    "class": "panel-heading",
                    "inner": {
                      "class": "panel-title",
                      "inner": "%title%"
                    }
                  },
                  {
                    "class": "panel-body",
                    "inner": [
                      {
                        "tag": "form",
                        "id": "loginform",
                        "class": "form-horizontal",
                        "role": "form",
                        "onsubmit": "%login%",
                        "inner": [
                          {
                            "id": "username-entry",
                            "class": "input-group",
                            "inner": [
                              {
                                "tag": "span",
                                "class": "input-group-addon",
                                "inner": {
                                  "tag": "i",
                                  "class": "glyphicon glyphicon-user"
                                }
                              },
                              {
                                "tag": "input",
                                "id": "login-username",
                                "type": "text",
                                "class": "form-control",
                                "name": "user",
                                "placeholder": "username",
                                "required": true
                              }
                            ]
                          },
                          {
                            "id": "password-entry",
                            "class": "input-group",
                            "inner": [
                              {
                                "tag": "span",
                                "class": "input-group-addon",
                                "inner": {
                                  "tag": "i",
                                  "class": "glyphicon glyphicon-lock"
                                }
                              },
                              {
                                "tag": "input",
                                "id": "login-password",
                                "type": "password",
                                "class": "form-control",
                                "name": "token",
                                "placeholder": "password",
                                "required": true
                              }
                            ]
                          },
                          {
                            "class": "form-group",
                            "inner": {
                              "class": "col-sm-12 controls",
                              "inner": [
                                {
                                  "tag": "input",
                                  "type": "submit",
                                  "id": "btn-login",
                                  "class": "btn btn-success",
                                  "value": "Login"
                                },
                                {
                                  "tag": "a",
                                  "id": "btn-abort",
                                  "class": "btn btn-warning",
                                  "onclick": "%abort%",
                                  "inner": "Abort"
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      },
      "css": [ "ccm.load",
        "https://ccmjs.github.io/akless-components/libs/bootstrap/css/bootstrap.css",
        { "context": "head", "url": "https://ccmjs.github.io/akless-components/libs/bootstrap/css/font-face.css" },
        "https://ccmjs.github.io/akless-components/user/resources/default.css"
      ]

  //  "realm": "guest",
  //  "guest": "guest",
  //  "title": "Please enter username and password",
  //  "url": "ccm2.inf.h-brs.de",
  //  "store": "ccm-user",
  //  "logged_in": true,
  //  "norender": true,
  //  "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
  //  "onchange": event => console.log( 'User has logged ' + ( event ? 'in' : 'out' ) + '.' ),
  //  "hash": [ "ccm.load", { "url": "https://ccmjs.github.io/akless-components/modules/md5.mjs", "type": "module" } ]

    },

    Instance: function () {

      const self = this;
      let $, my, data, context = this;

      this.init = async () => {

        // set shortcut to help functions
        $ = this.ccm.helper;

        // privatize authentication relevant instance members
        my = $.privatize( this, 'realm', 'store' );

        // set context to highest user instance with same realm
        let instance = this;
        while ( instance = instance.parent )
          if ( $.isInstance( instance.user ) && instance.user.getRealm() === this.getRealm() )
            context = instance.user;
        if ( context === this ) {
          context = null;
          this.onchange = this.onchange ? [ this.onchange ] : [];
        }
        else if ( this.onchange ) context.onchange.push( this.onchange );

      };

      this.ready = async () => {

        // immediate login? => login user
        this.logged_in && await this.login( true );

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.start();

        // logging of 'start' event
        this.logger && this.logger.log( 'start', this.isLoggedIn() );

        // no login/logout button? => clear website area and abort
        if ( this.norender ) return $.setContent( this.element, '' );

        // render logged in or logged out view
        if ( this.isLoggedIn() )
          $.setContent( this.element, $.html( this.html.logged_in, {
            click: this.logout,
            user: data.user
          } ) );
        else
          $.setContent( this.element, $.html( this.html.logged_out, {
            click: this.login
          } ) );

      };

      /**
       * logs in user
       * @param {boolean|function} not - prevent all or a specific onchange callback from being triggered
       * @returns {Promise<Object>}
       */
      this.login = async not => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.login( this.onchange );

        // user already logged in? => abort
        if ( this.isLoggedIn() ) return this.data();

        // choose authentication mode and proceed login
        let result;
        do {
          switch ( my.realm ) {
            case 'cloud':
              result = await renderLogin( this.title, true );
              if ( !result ) { await this.start(); return null; }
              if ( this.hash ) result.token = this.hash.md5( result.token );
              result.realm = my.realm;
              result.store = my.store;
              try { result = await this.ccm.load( { url: this.url, params: result } ); } catch ( e ) { result = undefined; }
              break;
            case 'guest':
              if ( this.guest )
                result = { user: this.guest === true ? $.generateKey() : this.guest };
              else {
                result = await renderLogin( this.title );
                if ( !result ) return await this.start();
              }
              result.token = result.user;
              break;
            case 'hbrsinfkaul':
              result = await this.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/login.php', method: 'JSONP', params: { realm: my.realm } } );
              if ( $.isObject( result ) ) result.token = result.user + '#' + result.token;
              break;
            case 'hbrsinfpseudo':
              result = await this.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/login_pseudonym.php', method: 'JSONP', params: { realm: my.realm } } );
              if ( $.isObject( result ) ) result.token = result.user + '#' + result.token;
              break;
            case 'lea':
              result = { user: sessionStorage.getItem( 'ccm@lea-user' ), token: sessionStorage.getItem( 'ccm@lea-token' ) };
              if ( !( $.isObject( result ) && result.user && $.regex( 'key' ).test( result.user ) && typeof result.token === 'string' ) ) return alert( 'Authentication failed' );
              break;
            default:
              if ( !( result = await renderLogin( this.title, true ) ) ) return await this.start();
              result = await this.ccm.load( { url: this.url, method: 'POST', params: { realm: my.realm, user: result.user, token: result.token } } );
          }
        } while ( !( $.isObject( result ) && result.user && $.regex( 'key' ).test( result.user ) && typeof result.token === 'string' ) && !alert( 'Authentication failed' ) );

        // remember user data (privatized)
        data = $.clone( result );

        // logging of 'login' event
        this.logger && this.logger.log( 'login' );

        // (re)render own content
        await this.start();

        // perform 'onchange' callbacks
        not !== true && this.onchange.forEach( onchange => onchange !== not && onchange( this.isLoggedIn() ) );

        return data;

        /**
         * renders login form
         * @param {string} title - login form title
         * @param {boolean} password - show input field for password
         * @returns {Promise}
         */
        async function renderLogin( title, password ) { return new Promise( resolve => {

          /**
           * Shadow DOM of parent instance
           * @type {Element}
           */
          const shadow = self.parent && self.parent.element && self.parent.element.parentNode;

          /**
           * parent of own root element
           * @type {Element}
           */
          const parent = shadow ? self.root.parentNode || document.createElement( 'div' ) : null;

          // is not a standalone instance? => show login form in website area of parent instance
          if ( shadow ) {

            // hide content of parent instance
            self.parent.element.style.display = 'none';

            // move own root element into Shadow DOM of parent instance
            shadow.appendChild( self.root );

          }

          // render login form
          $.setContent( self.element, $.html( self.html.login, {
            title: title,
            login: event => { event.preventDefault(); finish( $.formData( self.element ) ); },
            abort: () => finish()
          } ) );

          // no password needed? => remove input field for password
          !password && $.removeElement( self.element.querySelector( '#password-entry' ) );

          /**
           * finishes login form
           * @param {Object} [result] - user data
           */
          function finish( result ) {

            // is not a standalone instance?
            if ( shadow ) {

              // move own root element back to original position
              parent[ parent.nodeType === 11 ? 'removeChild' : 'appendChild' ]( self.root );

              // show content of parent instance
              self.parent.element.style.removeProperty('display' );

            }

            resolve( result );
          }

        } ); }

      };

      /**
       * logs out user
       * @param {boolean|function} not - prevent all or a specific onchange callback from being triggered
       * @returns {Promise}
       */
      this.logout = async not => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.logout( this.onchange );

        // user already logged out? => abort
        if ( !this.isLoggedIn() ) return;

        // choose authentication mode and proceed logout
        switch ( my.realm ) {
          case 'cloud':
          case 'guest':
            break;
          case 'hbrsinfkaul':
          case 'hbrsinfpseudo':
            await this.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/logout.php', method: 'JSONP', params: { realm: my.realm } } ).catch( () => {} );
          break;
          case 'lea':
            sessionStorage.removeItem( 'ccm@lea-user' );
            sessionStorage.removeItem( 'ccm@lea-token' );
            break;
          default:
            await this.ccm.load( { url: this.url, method: 'POST', params: { realm: my.realm, token: data.token } } );
            break;
        }

        // clear user data
        data = undefined;

        // logging of 'logout' event
        this.logger && this.logger.log( 'logout' );

        // (re)render own content
        await this.start();

        // perform 'onchange' callbacks
        not !== true && this.onchange.forEach( onchange => onchange !== not && onchange( this.isLoggedIn() ) );

      };

      /**
       * checks if user is logged in
       * @returns {boolean}
       */
      this.isLoggedIn = () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.isLoggedIn();

        return !!data;
      };

      /**
       * returns user data
       * @returns {Object}
       */
      this.data = () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.data();

        return $.clone( data );
      };

      /**
       * returns authentication mode
       * @returns {string}
       */
      this.getRealm = () => my.realm;

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();