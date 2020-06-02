/**
 * @overview ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2017-2020, Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 * @version latest (10.0.0)
 * @changes
 * version 10.0.0 (02.06.2020):
 * - forked user component for modularcms
 */

( () => {

  const component = {

    name: 'user',

    version: [10,0,0],

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

    config: {

      "css": [ "ccm.load",
        "https://modularcms.github.io/modularcms-components/user/resources/default.css"
      ],
//    "guest": "guest",
//    "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
      "html": [ "ccm.get", "https://modularcms.github.io/modularcms-components/user/resources/resources.js", "html" ],
//    "logged_in": true,
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.4.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
//    "map": user => user.user === 'john' ? 'Teacher' : 'Student',
//    "norender": true,
//    "onchange": event => console.log( 'User has logged ' + ( event ? 'in' : 'out' ) + '.' ),
      "picture": "https://modularcms.github.io/modularcms-components/user/resources/icon.svg",
      "realm": "modularcms",
      "restart": true,
//    "store": "ccm-user",
      "title": "Login",
      "url": "https://auth.modularcms.io/login",
      "wrongLoginText": "Wrong login.",
      "logo": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg"
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
        // this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        // higher user instance with same realm exists? => redirect method call
        if ( context ) return context.start();

        // correct state is already rendered? => abort
        if ( this.isLoggedIn() && this.element.querySelector( '#logged_in' ) || !this.isLoggedIn() && this.element.querySelector( '#logged_out' ) ) return;

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
        if ( context ) return context.login( not || this.onchange );

        // user already logged in? => abort
        if ( this.isLoggedIn() ) return this.getValue();

        // choose authentication mode and proceed login
        let result = sessionStorage.getItem( 'ccm-user-' + my.realm );
        if ( result )
          result = $.parse( result );
        else
          do {
            result = await renderLogin( this.title, true );
            if ( !result ) { await this.start(); throw new Error( 'login aborted' ); }
            result = await this.ccm.load( { url: this.url, method: 'POST', params: { realm: my.realm, user: result.user, token: result.token } } );
          } while ( !( $.isObject( result ) && result.user && $.regex( 'key' ).test( result.user ) && typeof result.token === 'string' ) && !alert( 'Authentication failed' ) );

        // remember user data
        data = $.clone( result );
        delete data.apps;
        data.realm = my.realm;
        if ( !data.picture && this.picture ) data.picture = this.picture;

        sessionStorage.setItem( 'ccm-user-' + my.realm, $.stringify( data ) );

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
            wrongLoginText: this.wrongLoginText,
            logo: this.logo,
            login: event => { event.preventDefault(); finish( $.formData( self.element ) ); },
            abort: () => finish()
          } ) );

          // if (this.failedLogin) {
          //   this.element.classList.add('failedLogin');
          // } else {
          //   this.element.classList.remove('failedLogin');
          // }

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
       * returns url for user avatar
       * @returns {string}
       */
      this.getAvatar = () => {
        const user = $.clone( this.getValue() );
        if (user.picture) {
          return user.picture;
        }
        return this.picture;
      };

      /**
       * returns authentication mode
       * @returns {string}
       */
      this.getRealm = () => my.realm;

      /**
       * gets app-specific user data
       * @param {string} key - unique app key
       * @returns {Promise<void>}
       */
      this.getAppData = async key => {
        if ( context && context.getAppData ) return context.getAppData( key );
        return await this.ccm.get( { name: my.store, url: this.url, parent: this }, this.getValue().key + '.apps.' + key );
      };

      /**
       * sets app-specific user data
       * @param {string} app_key - unique app key
       * @param {Object} data
       * @returns {Promise<void>}
       */
      this.setAppData = async ( app_key, data ) => {
        if ( context && context.setAppData ) return context.setAppData( app_key, data );
        const priodata = { key: this.getValue().key, _: { access: { get: 'creator', set: 'creator', del: 'creator' } } };
        const user_data = await this.ccm.get( { name: my.store, url: this.url, parent: this }, this.getValue().key );
        if ( user_data )
          priodata[ 'apps.' + app_key ] = data;
        else {
          priodata.apps = {};
          priodata.apps[ app_key ] = data;
        }
        await this.ccm.set( { name: my.store, url: this.url, parent: this }, $.clone( priodata ) );
      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();