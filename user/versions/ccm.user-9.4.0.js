/**
 * @overview ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2017-2020
 * @license The MIT License (MIT)
 * @version 9.4.0
 * @changes
 * version 9.4.0 (25.03.2020):
 * - uses ccm v25.2.0
 * - uses helper.mjs v4.1.1 as default
 * - added getValue() method
 * - data() method is deprecated
 * - added getUsername() method
 * - added optional mapping function for displayed username
 * version 9.3.1 (12.02.2020):
 * - uses ccm v25.0.0
 * - bug fix for user key
 * - changed default title text of login dialog
 * version 9.3.0 (09.10.2019):
 * - added optional restart of parent instance after logout
 * version 9.2.1 (09.10.2019):
 * - prevent render of same state twice
 * - uses ccm v24.0.1
 * version 9.2.0 (05.07.2019):
 * - uses Session Storage to remember user data
 * - throws error if you click on Abort in login area
 * - uses ccm v21.1.2
 * version 9.1.1 (29.05.2019):
 * - clears website area before redirect call
 * - uses ccm v20.7.1
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

    name: 'user', version: [ 9, 4, 0 ],

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.2.0.js',

    config: {

      "css": [ "ccm.load",
        "https://ccmjs.github.io/akless-components/libs/bootstrap/css/bootstrap.css",
        { "context": "head", "url": "https://ccmjs.github.io/akless-components/libs/bootstrap/css/font-face.css" },
        "https://ccmjs.github.io/akless-components/user/resources/default.css"
      ],
//    "guest": "guest",
//    "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-4.1.1.mjs" ],
      "html": [ "ccm.get", "https://ccmjs.github.io/akless-components/user/resources/resources.js", "html" ],
//    "logged_in": true,
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.3.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
//    "map": user => user.user === 'john' ? 'Teacher' : 'Student',
//    "norender": true,
//    "onchange": event => console.log( 'User has logged ' + ( event ? 'in' : 'out' ) + '.' ),
      "realm": "guest",
//    "restart": true,
//    "store": "ccm-user",
      "title": "Guest Mode: Please enter any username"
//    "url": "ccm2.inf.h-brs.de"

    },

    Instance: function () {

      const self = this;
      let $, my, data, context = this;

      this.init = async () => {

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper );

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

        // clear own website area
        $.setContent( this.element, '' );

        // immediate login? => login user
        if ( this.logged_in || sessionStorage.getItem( 'ccm-user-' + my.realm ) ) await this.login( true );

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.start();

        // correct state is already rendered? => abort
        if ( this.isLoggedIn() && this.element.querySelector( '#logged_in' ) || !this.isLoggedIn() && this.element.querySelector( '#logged_out' ) ) return;

        // logging of 'start' event
        this.logger && this.logger.log( 'start', this.isLoggedIn() );

        // no login/logout button? => abort
        if ( this.norender ) return;

        // render logged in or logged out view
        if ( this.isLoggedIn() )
          $.setContent( this.element, $.html( this.html.logged_in, {
            click: this.logout,
            user: this.getUsername()
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
        if ( this.isLoggedIn() ) return this.getValue();

        // choose authentication mode and proceed login
        let result = sessionStorage.getItem( 'ccm-user-' + my.realm );
        if ( result )
          result = $.parse( result );
        else
          do {
            switch ( my.realm ) {
              case 'cloud':
                result = await renderLogin( this.title, true );
                if ( !result ) { await this.start(); throw new Error( 'login aborted' ); }
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
                  if ( !result ) { await this.start(); throw new Error( 'login aborted' ); }
                }
                result.key = result.token = result.user;
                break;
              case 'hbrsinfkaul':
                result = await this.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/login.php', method: 'JSONP', params: { realm: my.realm } } );
                if ( $.isObject( result ) ) {
                  result.key = result.user;
                  result.token = result.user + '#' + result.token;
                }
                break;
              case 'hbrsinfpseudo':
                result = await this.ccm.load( { url: 'https://kaul.inf.h-brs.de/login/login_pseudonym.php', method: 'JSONP', params: { realm: my.realm } } );
                if ( $.isObject( result ) ) {
                  result.key = result.user;
                  result.token = result.user + '#' + result.token;
                }
                break;
              case 'lea':
                result = { user: sessionStorage.getItem( 'ccm@lea-user' ), token: sessionStorage.getItem( 'ccm@lea-token' ) };
                if ( !( $.isObject( result ) && result.user && $.regex( 'key' ).test( result.user ) && typeof result.token === 'string' ) ) return alert( 'Authentication failed' );
                break;
              default:
                result = await renderLogin( this.title, true );
                if ( !result ) { await this.start(); throw new Error( 'login aborted' ); }
                result = await this.ccm.load( { url: this.url, method: 'POST', params: { realm: my.realm, user: result.user, token: result.token } } );
            }
          } while ( !( $.isObject( result ) && result.user && $.regex( 'key' ).test( result.user ) && typeof result.token === 'string' ) && !alert( 'Authentication failed' ) );

        // remember user data
        data = $.clone( result );

        sessionStorage.setItem( 'ccm-user-' + my.realm, $.stringify( data ) );

        // logging of 'login' event
        this.logger && this.logger.log( 'login' );

        // (re)render own content
        await this.start();

        // perform 'onchange' callbacks
        not !== true && await $.asyncForEach( this.onchange, async onchange => onchange !== not && await onchange( this.isLoggedIn() ) );

        return this.getValue();

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
          !password && $.remove( self.element.querySelector( '#password-entry' ) );

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
        sessionStorage.removeItem( 'ccm-user-' + my.realm );

        // logging of 'logout' event
        this.logger && this.logger.log( 'logout' );

        // restart after logout?
        if ( this.restart && this.parent ) {
          $.setContent( this.parent.element, $.loading() );   // clear parent content
          await this.parent.start();                          // restart parent
        }
        // (re)render own content
        else await this.start();

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
       * returns current result data
       * @returns {Object} user data
       */
      this.getValue = () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context && context.getValue ) return context.getValue();

        return $.clone( data );
      };

      /** @deprecated */
      this.data = this.getValue;

      /**
       * returns displayed username
       * @returns {string}
       */
      this.getUsername = () => {
        const user = $.clone( this.getValue() );
        return this.map && this.map( user ) || user.name || user.user || user.key;
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