/**
 * @overview ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 * @version 7.0.0
 * @changes
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

{
  var component = {

    /**
     * unique component name
     * @type {string}
     */
    name: 'user',

    /**
     * component version
     * @type {number[]}
     */
    version: [ 7, 0, 0 ],

    /**
     * reference to used framework version
     * @type {Object}
     */
    ccm: {
      url: 'https://ccmjs.github.io/ccm/versions/ccm-16.6.1.js',
      integrity: 'sha384-zCsUcQEg4NqpF91vJatXIU7aDUcYENcTCchNCwisDiA1ZzTR+ShsqJtmYIHG120k',
      crossorigin: 'anonymous'
    },

    /**
     * default instance configuration
     * @type {Object}
     */
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
        "login_form": {
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
                                "name": "username",
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
                                "name": "password",
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
                                  "tag": "a",
                                  "id": "btn-login",
                                  "class": "btn btn-success",
                                  "onclick": "%login%",
                                  "inner": "Login"
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
                          }/*,
                          {
                            "class": "form-group",
                            "inner": {
                              "class": "col-md-12 control",
                              "inner":  {
                                "style": "border-top: 1px solid#888; padding-top:15px; font-size:85%",
                                "inner": [
                                  "Don't have an account!",
                                  {
                                    "tag": "a",
                                    "onclick": "%signup%",
                                    "inner": "&nbsp Sign Up Here"
                                  }
                                ]
                              }
                            }
                          }*/
                        ]
                      }
                    ]
                  }
                ]
              }
            },
            {
              "id": "signupbox",
              "style": "display:none; margin-top:50px",
              "class": "mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2",
              "inner": {
                "class": "panel panel-info",
                "inner": [
                  {
                    "class": "panel-heading",
                    "inner": [
                      {
                        "class": "panel-title",
                        "inner": "Sign Up"
                      },
                      {
                        "style": "float:right; font-size: 85%; position: relative; top:-10px",
                        "inner": {
                          "tag": "a",
                          "id": "signinlink",
                          "onclick": "%loginbox%",
                          "inner": "Sign In"
                        }
                      }
                    ]
                  },
                  {
                    "class": "panel-body",
                    "inner": {
                      "id": "signupform",
                      "class": "form-horizontal",
                      "role": "form",
                      "inner": [
                        {
                          "id": "signupalert",
                          "style": "display:none",
                          "class": "alert alert-danger",
                          "inner": [
                            {
                              "tag": "p",
                              "inner": "Error:"
                            },
                            {

                            }
                          ]
                        },
                        {
                          "class": "form-group",
                          "inner": [
                            {
                              "tag": "label",
                              "for": "email",
                              "class": "col-md-3 control-label",
                              "inner": "Email"
                            },
                            {
                              "class":" col-md-9",
                              "inner": {
                                "tag": "input",
                                "type": "text",
                                "class": "form-control",
                                "id": "email",
                                "name": "email",
                                "placeholder": "Email Address"
                              }
                            }
                          ]
                        },
                        {
                          "class": "form-group",
                          "inner": [
                            {
                              "tag": "label",
                              "for": "firstname",
                              "class": "col-md-3 control-label",
                              "inner": "Frist Name"
                            },
                            {
                              "class":" col-md-9",
                              "inner": {
                                "tag": "input",
                                "type": "text",
                                "class": "form-control",
                                "id": "firstname",
                                "name": "firstname",
                                "placeholder": "First Name"
                              }
                            }
                          ]
                        },
                        {
                          "class": "form-group",
                          "inner": [
                            {
                              "tag": "label",
                              "for": "lastname",
                              "class": "col-md-3 control-label",
                              "inner": "Last Name"
                            },
                            {
                              "class":" col-md-9",
                              "inner": {
                                "tag": "input",
                                "type": "text",
                                "class": "form-control",
                                "id": "lastname",
                                "name": "lastname",
                                "placeholder": "Last Name"
                              }
                            }
                          ]
                        },
                        {
                          "class": "form-group",
                          "inner": [
                            {
                              "tag": "label",
                              "for": "password",
                              "class": "col-md-3 control-label",
                              "inner": "Password"
                            },
                            {
                              "class":" col-md-9",
                              "inner": {
                                "tag": "input",
                                "type": "text",
                                "class": "form-control",
                                "id": "password",
                                "name": "password",
                                "placeholder": "Password"
                              }
                            }
                          ]
                        },
                        {
                          "class": "form-group",
                          "inner": [
                            {
                              "tag": "label",
                              "for": "icode",
                              "class": "col-md-3 control-label",
                              "inner": "Invitation Code"
                            },
                            {
                              "class":" col-md-9",
                              "inner": {
                                "tag": "input",
                                "type": "text",
                                "class": "form-control",
                                "id": "icode",
                                "name": "icode"
                              }
                            }
                          ]
                        },
                        {
                          "class": "form-group",
                          "inner": {
                            "class": "col-md-offset-3 col-md-9",
                            "inner": {
                              "tag": "button",
                              "id": "btn-signup",
                              "type": "button",
                              "class": "btn btn-primary",
                              "inner": [
                                {
                                  "tag": "i",
                                  "class": "glyphicon glyphicon-hand-right",
                                },
                                "&nbsp; Sign Up"
                              ]
                            }
                          }
                        }
                      ]
                    }
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
      ],
      "context": true,
      "realm": "guest",
      "title": "Please enter username and password"

  //  "guest": "guest",
  //  "url": "ccm2.inf.h-brs.de",
  //  "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/user/resources/default.css" ],
  //  "logged_in": true,
  //  "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-3.1.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
  //  "onchange": event => console.log( 'User has logged ' + ( event ? 'in' : 'out ) + '.' )

    },

    /**
     * for creating instances out of this component
     * @constructor
     */
    Instance: function () {

      /**
       * own reference for inner functions
       * @type {Instance}
       */
      const self = this;

      /**
       * privatized instance members
       * @type {Object}
       */
      let my;

      /**
       * shortcut to help functions
       * @type {Object.<string,function>}
       */
      let $;

      /**
       * data of the current logged in user
       * @type {{user: string, token: string}}
       */
      let dataset;

      /**
       * index of parent instance
       * @type {string}
       */
      let owner;

      /**
       * @summary observers for login and logout event
       * @description List of observer functions that must be performed on a login and logout event.
       * @type {Object.<string,function>}
       */
      const observers = {};

      /**
       * true during a login or logout request
       * @type {boolean}
       */
      let loading = false;

      /**
       * @summary waitlist during a login or logout request
       * @description Waitlist of actions that must be performed after a successful login or logout request.
       * @private
       * @type {Array[]}
       */
      const waitlist = [];

      /**
       * is called once after all dependencies are solved and is then deleted
       * @param {function} callback - called after all synchronous and asynchronous operations are complete
       */
      this.init = callback => {

        // context mode? => set context to highest ccm instance for user authentication (with same realm) in current ccm context
        if ( self.context ) {
          let context = self;
          do
            context = self.ccm.context.find( context, 'user' );
          while ( context && context.realm !== self.realm );
          self.context = context && context.context || context || false;
        }

        callback();
      };

      /**
       * is called once after the initialization and is then deleted
       * @param {function} callback - called after all synchronous and asynchronous operations are complete
       */
      this.ready = callback => {

        // set shortcut to help functions
        $ = self.ccm.helper;

        // privatize all possible instance members
        my = $.privatize( self );

        // has logger instance? => log 'ready' event
        self.logger && self.logger.log( 'ready', $.clone( my ) );

        // remember index of parent instance
        owner = self.parent && self.parent.index;

        // parent listens to login/logout events? => listen to all login/logout events in ccm context
        if ( self.onchange && self.parent ) { self.addObserver( self.parent.index, self.onchange ); delete self.onchange; }

        // immediate login? => login user
        my.logged_in ? self.login( callback ) : callback();

      };

      /**
       * starts the instance
       * @param {function} [callback] - called after all synchronous and asynchronous operations are complete
       */
      this.start = callback => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.start( callback );

        // has logger instance? => log 'start' event
        self.logger && self.logger.log( 'start', self.isLoggedIn() );

        // render logged in or logged out view
        ( self.isLoggedIn() ? renderLoggedIn : renderLoggedOut )();

        // rendering completed => perform callback
        callback && callback();

        /** renders logged in view */
        function renderLoggedIn() {

          $.setContent( self.element, $.html( my.html.logged_in, {
            user: dataset.user,
            click: () => self.logout( undefined, '#' )
          } ) );

        }

        /** renders logged out view */
        function renderLoggedOut() {

          $.setContent( self.element, $.html( my.html.logged_out, {
            click: () => self.login( undefined, '#' )
          } ) );

        }

      };

      /**
       * login user
       * @param {function} [callback] - will be called after login (or directly if user is already logged in)
       * @param {string} propagated - propagated call (intern parameter)
       */
      this.login = ( callback, propagated ) => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.login( callback, propagated || owner );

        // user already logged in? => perform callback directly
        if ( self.isLoggedIn() ) return callback && callback();

        // prevent more than one request on parallel login/logout calls
        if ( loading ) return waitlist.push( [ self.login, callback ] );

        /**
         * parent of parent element
         * @type {Element}
         */
        const element_parent = self.parent && self.parent.element && self.parent.element.parentNode;

        /**
         * parent of own root element
         * @type {Element}
         */
        const root_parent = element_parent ? self.root.parentNode || document.createElement( 'div' ) : null;

        // choose authentication mode and proceed login
        switch ( my.realm ) {
          case 'guest':
            if ( my.guest )
              success( my.guest === true ? $.generateKey() : my.guest );
            else
              renderLoginForm( { title: my.title }, username => success( username ) );
            break;
          case 'hbrsinfkaul':
            self.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/login.php', method: 'JSONP', params: { realm: my.realm } }, response => {
              response.token = response.user + '#' + response.token;
              success( response );
            } );
            break;
          case 'LEA':  // experimental
            lea();
            break;
          case 'VCRP_OpenOLAT':  // experimental
            renderLoginForm( { title: 'Please enter your OpenOLAT username and password' }, ( username, password ) =>
              self.ccm.load( { url: 'https://olat.vcrp.de/restapi/auth/' + username, params: { password: password } }, success ) );
            break;
          default:
            renderLoginForm( { title: my.title }, ( username, password ) =>
              self.ccm.load( { url: my.url, method: 'POST', params: { realm: my.realm, username: username, password: password } }, success ) );
        }

        /**
         * renders login form
         * @param {Object} settings
         * @param {string} settings.title - login form title
         * @param {function} callback - when username and password has been entered
         */
        function renderLoginForm( settings, callback ) {

          // is not a standalone instance? => show login form in website area of parent instance
          if ( element_parent ) {

            // hide content of parent instance
            self.parent.element.style.display = 'none';

            // move own root element into Shadow DOM of parent instance
            self.parent.element.parentNode.appendChild( self.root );

          }

          // render login form
          $.setContent( self.element, $.html( my.html.login_form, {
            title: settings.title,
            login: () => callback( self.element.querySelector( 'input[name="username"]' ).value, self.element.querySelector( 'input[name="password"]' ).value ),
            abort: () => {
              if ( element_parent ) {
                root_parent.appendChild( self.root );
                self.parent.element.style.display = 'block';
              }
              self.element && self.start();
            },
            loginbox: () => {
              self.element.querySelector( '#loginbox' ).style.display = 'block';
              self.element.querySelector( '#signupbox' ).style.display = 'none';
            },
            signup: () => {
              self.element.querySelector( '#loginbox' ).style.display = 'none';
              self.element.querySelector( '#signupbox' ).style.display = 'block';
            }
          } ) );

          // no password needed? => hide input field for password
          if ( my.no_password ) self.element.querySelector( '#password-entry' ).style.display = 'none';

        }

        /**
         * callback when login was successful
         * @param {{username: string, password: string}|string} response - server response with user data
         */
        function success( response ) {

          // hold user data
          dataset = typeof response === 'string' ? { user: response, token: response } : $.filterProperties( response, 'user', 'token' );

          // is not a standalone instance? => abort
          if ( element_parent ) {

            // move own root element back to original position
            root_parent && root_parent.appendChild( self.root );

            // show content of the parent instance
            self.parent.element.style.display = 'block';

          }

          // request is finished
          loading = false;

          // has logger instance? => log 'login' event
          self.logger && self.logger.log( 'login' );

          // perform waiting functions
          while ( waitlist.length > 0 ) $.action( waitlist.shift() );

          // (re)render own content
          self.start();

          // perform callback
          callback && callback();

          // notify observers about logout event
          notify( true, propagated || owner );

        }

        /** performs LEA authentication mode */
        function lea() {

          // render login form
          renderLoginForm( { title: my.title }, ( username, password ) => {

            // perform login
            soap( {
              domain: 'http://ilias-ccm.bib.h-brs.de',
              url: 'http://ilias-ccm.bib.h-brs.de/webservice/soap/server.php',
              method: 'login',
              params: {
                client: 'iliasccm',
                username: username,
                password: password
              }
            }, result => {

              /**
               * security token
               * @type {string}
               */
              const token = />([^>]+::.+)<\/sid>/.exec( result )[ 1 ];

              // perform success callback
              success( username );

            }, () =>
              confirm( 'Try again?' ) && lea() );  // render login form again if user credentials are invalid

          } );

        }

      };

      /**
       * logout user
       * @param {function} [callback] will be called after logout (or directly if user is already logged out)
       * @param {string} propagated - index of caller instance (intern parameter)
       */
      this.logout = ( callback, propagated ) => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.logout( callback, propagated || owner );

        // user already logged out? => perform callback directly
        if ( !self.isLoggedIn() ) { callback && callback(); return self; }

        // prevent more than one request on parallel login/logout calls
        if ( loading ) { waitlist.push( [ self.logout, callback ] ); return self; }

        // choose authentication mode and proceed logout
        switch ( my.realm ) {
          case 'guest':
            success();
            break;
          case 'hbrsinfkaul':
            self.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/logout.php', method: 'JSONP', params: { realm: my.realm } } );
            success();
            break;
          case 'LEA':   // experimental
            soap( {
              domain: 'http://ilias-ccm.bib.h-brs.de',
              url:    'http://ilias-ccm.bib.h-brs.de/webservice/soap/server.php',
              method: 'logout',
              params: {
                sid: self.data().token
              }
            }, success );
            break;
          default:
            self.ccm.load( { url: my.url, method: 'POST', params: { realm: my.realm, token: self.data().token } }, success );
            break;
        }

        return self;

        /** callback when logout was successful */
        function success() {

          dataset = undefined;  // forget user data
          loading = false;      // request is finished

          // has logger instance? => log 'logout' event
          self.logger && self.logger.log( 'logout' );

          // perform waiting functions
          while ( waitlist.length > 0 ) $.action( waitlist.shift() );

          // (re)render own content
          self.start();

          // perform callback
          callback && callback();

          // notify observers about logout event
          notify( false, propagated || owner );

        }

      };

      /**
       * checks if user is logged in
       * @returns {boolean}
       */
      this.isLoggedIn = () => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.isLoggedIn();

        // user is logged in if user data exists
        return !!dataset;

      };

      /**
       * returns user data
       * @returns {Object}
       */
      this.data = () => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.data();

        return dataset;
      };

      /**
       * returns authentication mode
       * @returns {string}
       */
      this.getRealm = () => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.getRealm();

        return my.realm;
      };

      /**
       * adds an observer for login and logout events of other user instances in ccm context
       * @param {string} observer - index of observer instance
       * @param {function} callback - will be performed when event fires (first parameter is kind of event -> true: login, false: logout)
       */
      this.addObserver = ( observer, callback ) => {

        // context mode? => delegate method call
        if ( my.context ) return my.context.addObserver( observer, callback );

        // add function to observers
        observers[ observer ] = callback;

      };

      /**
       * notifies observers
       * @param {boolean} event - true: login, false: logout
       * @param {string} caller - index of the instance that calls login/logout
       */
      function notify( event, caller ) {

        for ( const index in observers ) {
          if ( index === caller ) continue;  // skip if observer is caller
          observers[ index ]( event );
        }

      }

      /**
       * sends a HTTP request for communication via SOAP with XML
       * @param {Object} settings - settings for the HTTP request
       * @param {function} success - success callback
       * @param {function} error - error callback
       */
      function soap( settings, success, error ) {

        // prepare parameters to be sent
        let params = '';
        for ( const key in settings.params )
          params += '<' + key + '>' + settings.params[ key ] + '</' + key + '>'

        // prepare request data for SOAP
        const xml = `<?xml version="1.0" encoding="utf-8"?>
        <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
          <SOAP-ENV:Body>
            <m:${settings.method} xmlns:m="${settings.domain}">
               ${params}
            </m:${settings.method}>
          </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>`;

        // prepare request object for SOAP
        const request = new XMLHttpRequest();
        request.open( 'POST', settings.url, true );
        request.setRequestHeader( 'Content-Type', 'text/xml' );
        request.onreadystatechange = () => {
          if ( request.readyState !== 4 ) return;
          if ( request.status === 200 && success ) success( request.response );
          if ( request.status !== 200 && error   )   error( request.response, request.status );
        };

        // send request
        request.send( xml );

      }

    }

  };

  function p(){window.ccm[v].component(component)}const f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{const n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"==typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{const e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}}
}