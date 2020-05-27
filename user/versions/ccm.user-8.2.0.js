/**
 * @overview ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 * @version 8.2.0
 * @changes
 * version 8.2.0 (13.10.2018)
 * - added realm 'lea'
 * - uses ccm v18.0.5
 * version 8.1.0 (05.10.2018)
 * - added realm 'cloud'
 * version 8.0.0 (07.09.2018)
 * - uses ccm v18.0.0
 * - removed not yet needed HTML templates
 * - changed context mode, observer pattern and waiting list
 * - only realm and user data is privatized
 * - retry for enter username and password when authentication fails
 * - an authentication mode can optionally store more user data than only user and token (all currently implemented authentication modes store only user and token and nothing more)
 * - removed experimental authentication modes for LEA and OpenOLAT
 * - intern parameter for login/logout methods
 * version 7.1.0 (20.08.2018) based on suggestions for changes by mkaul
 * - added realm 'hbrsinfpseudo'
 * - bugfix: input field for username and password is required
 * version 7.0.1 (18.06.2018)
 * - bugfix for context mode
 * version 7.0.0
 * - bootstrap is used for default layout
 * - improved guest mode (any user, all same user, generated one-time pseudonym)
 * - set authentication URL via config
 * - set title of login form via config
 * - disable input field for password of login form via config
 * version 6.0.0
 * - context mode skips user instances with user realm
 * - onchange callback
 * - use of login form in more authentication modes
 * - added ccm authentication mode
 * - changes in logging behaviour
 * - demo authentication uses POST instead of JSONP
 * - updated observer notification handling
 * version 5.0.1 (16.05.2018)
 * - bugfix for close of login form in case of no given own website area
 * - uses ccm v16.6.0
 * version 5.0.0 (15.05.2018)
 * - updated demo authentication
 * - uses ccm.16.5.1
 * version 4.0.1 (18.04.2018)
 * - bugfix for lea authentication
 * version 4.0.0 (07.04.2018)
 * - uses ccm v16.0.0
 * - uses ccm-cloud v3.0.0
 * - 'realm' instead of 'sign_on'
 * - updated LEA sign-on
 * - user and token for realm hbrsinfkaul summarized
 * version 3.1.0 (26.02.2018)
 * - login form for LEA sign-on
 * version 3.0.0 (17.01.2018)
 * - uses ECMAScript 6 syntax
 * - uses ccm v15.0.2
 * - logging support
 * - add LEA authentication
 * version 2.0.1 (04.12.2017)
 * - use JSONP instead of CORS for authentication
 * version 2.0.0 (22.09.2017)
 * - changed structure of user dataset: id, token, name, email
 * version 1.1.0 (18.09.2017)
 * - no observer notification if observer is parent of publisher
 * version 1.0.0 (09.09.2017)
 */

( function () {

  const component = {

    name: 'user',

    version: [ 8, 2, 0 ],

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-18.0.5.js',

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
  //  "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
  //  "onchange": event => console.log( 'User has logged ' + ( event ? 'in' : 'out' ) + '.' )

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
        this.logged_in && await this.login();

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.start();

        // logging of 'start' event
        this.logger && this.logger.log( 'start', this.isLoggedIn() );

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
       * @returns {Promise}
       */
      this.login = async not => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.login( this.onchange );

        // user already logged in? => abort
        if ( this.isLoggedIn() ) return;

        // choose authentication mode and proceed login
        let result;
        do {
          switch ( my.realm ) {
            case 'cloud':
              result = await renderLogin( this.title, true );
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
        this.onchange.forEach( onchange => onchange !== not && onchange( this.isLoggedIn() ) );

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
              parent.appendChild( self.root );

              // show content of parent instance
              self.parent.element.style.display = 'block';

            }

            resolve( result );
          }

        } ); }

      };

      /**
       * logs out user
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
        this.onchange.forEach( onchange => onchange !== not && onchange( this.isLoggedIn() ) );

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