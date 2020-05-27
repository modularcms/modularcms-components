/**
 * @overview ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 * @version 8.3.0
 * @changes
 * version 8.3.0 (03.11.2018)
 * - added realm 'idento'
 * - uses ccm v18.6.4
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

    version: [ 8, 3, 0 ],

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-18.6.4.js',

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
            case 'idento':
              result = await renderLogin( this.title, true );
              result = {
                email: result.user,
                password: this.hash ? this.hash.md5( result.token ) : result.token,
                clientHash: jQuery && await generateClientHash()
              };
              try {
                result = await this.ccm.load( { url: this.url + '/login', params: result } );
                result = { user: result.description.UUID, token: result.description.token };
              }
              catch ( e ) {
                result = undefined;
              }
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

        /**
         * generates client hash required by idento.one company
         * @returns {Promise}
         */
        function generateClientHash() {

          return new Promise( ( success, failed ) => {

            const params = {
              rid: 'rid',
              cid: 'cid',
              sid: 'sid',
              saleOrder: 'saleOrder',
              saleSum: 'saleSum',
              saleCurr: 'saleCurr',
              saleZinfo: 'saleZinfo',
              saleBasket: 'saleBasket',
              title: 'title',
              url: 'http://81.169.231.30:8088/api/receiver'
            };

            var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
            $jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var a=0;return function(b){return $jscomp.SYMBOL_PREFIX+(b||"")+a++}}();
            $jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var b=0;return $jscomp.iteratorPrototype(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})};
            $jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.makeIterator=function(a){$jscomp.initSymbolIterator();var b=a[Symbol.iterator];return b?b.call(a):$jscomp.arrayIterator(a)};
            $jscomp.polyfill=function(a,b,c,e){if(b){c=$jscomp.global;a=a.split(".");for(e=0;e<a.length-1;e++){var d=a[e];d in c||(c[d]={});c=c[d]}a=a[a.length-1];e=c[a];b=b(e);b!=e&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.FORCE_POLYFILL_PROMISE=!1;
            $jscomp.polyfill("Promise",function(a){function b(){this.batch_=null}function c(a){return a instanceof d?a:new d(function(b,f){b(a)})}if(a&&!$jscomp.FORCE_POLYFILL_PROMISE)return a;b.prototype.asyncExecute=function(a){null==this.batch_&&(this.batch_=[],this.asyncExecuteBatch_());this.batch_.push(a);return this};b.prototype.asyncExecuteBatch_=function(){var a=this;this.asyncExecuteFunction(function(){a.executeBatch_()})};var e=$jscomp.global.setTimeout;b.prototype.asyncExecuteFunction=function(a){e(a,
              0)};b.prototype.executeBatch_=function(){for(;this.batch_&&this.batch_.length;){var a=this.batch_;this.batch_=[];for(var b=0;b<a.length;++b){var c=a[b];a[b]=null;try{c()}catch(h){this.asyncThrow_(h)}}}this.batch_=null};b.prototype.asyncThrow_=function(a){this.asyncExecuteFunction(function(){throw a;})};var d=function(a){this.state_=0;this.result_=void 0;this.onSettledCallbacks_=[];var b=this.createResolveAndReject_();try{a(b.resolve,b.reject)}catch(l){b.reject(l)}};d.prototype.createResolveAndReject_=
              function(){function a(a){return function(f){c||(c=!0,a.call(b,f))}}var b=this,c=!1;return{resolve:a(this.resolveTo_),reject:a(this.reject_)}};d.prototype.resolveTo_=function(a){if(a===this)this.reject_(new TypeError("A Promise cannot resolve to itself"));else if(a instanceof d)this.settleSameAsPromise_(a);else{a:switch(typeof a){case "object":var b=null!=a;break a;case "function":b=!0;break a;default:b=!1}b?this.resolveToNonPromiseObj_(a):this.fulfill_(a)}};d.prototype.resolveToNonPromiseObj_=function(a){var b=
              void 0;try{b=a.then}catch(l){this.reject_(l);return}"function"==typeof b?this.settleSameAsThenable_(b,a):this.fulfill_(a)};d.prototype.reject_=function(a){this.settle_(2,a)};d.prototype.fulfill_=function(a){this.settle_(1,a)};d.prototype.settle_=function(a,b){if(0!=this.state_)throw Error("Cannot settle("+a+", "+b+"): Promise already settled in state"+this.state_);this.state_=a;this.result_=b;this.executeOnSettledCallbacks_()};d.prototype.executeOnSettledCallbacks_=function(){if(null!=this.onSettledCallbacks_){for(var a=
              0;a<this.onSettledCallbacks_.length;++a)g.asyncExecute(this.onSettledCallbacks_[a]);this.onSettledCallbacks_=null}};var g=new b;d.prototype.settleSameAsPromise_=function(a){var b=this.createResolveAndReject_();a.callWhenSettled_(b.resolve,b.reject)};d.prototype.settleSameAsThenable_=function(a,b){var c=this.createResolveAndReject_();try{a.call(b,c.resolve,c.reject)}catch(h){c.reject(h)}};d.prototype.then=function(a,b){function c(a,b){return"function"==typeof a?function(b){try{e(a(b))}catch(t){f(t)}}:
              b}var e,f,g=new d(function(a,b){e=a;f=b});this.callWhenSettled_(c(a,e),c(b,f));return g};d.prototype.catch=function(a){return this.then(void 0,a)};d.prototype.callWhenSettled_=function(a,b){function c(){switch(d.state_){case 1:a(d.result_);break;case 2:b(d.result_);break;default:throw Error("Unexpected state: "+d.state_);}}var d=this;null==this.onSettledCallbacks_?g.asyncExecute(c):this.onSettledCallbacks_.push(c)};d.resolve=c;d.reject=function(a){return new d(function(b,c){c(a)})};d.race=function(a){return new d(function(b,
              d){for(var e=$jscomp.makeIterator(a),f=e.next();!f.done;f=e.next())c(f.value).callWhenSettled_(b,d)})};d.all=function(a){var b=$jscomp.makeIterator(a),e=b.next();return e.done?c([]):new d(function(a,d){function f(b){return function(c){g[b]=c;p--;0==p&&a(g)}}var g=[],p=0;do g.push(void 0),p++,c(e.value).callWhenSettled_(f(g.length-1),d),e=b.next();while(!e.done)})};return d},"es6","es3");var nexwareFunctions$$module$nexwareFunctions=function(){};nexwareFunctions$$module$nexwareFunctions.getUA=function(){return navigator.userAgent};
            nexwareFunctions$$module$nexwareFunctions.getIT=function(){try{return document.createEvent("TouchEvent"),"true"}catch(a){return"false"}};nexwareFunctions$$module$nexwareFunctions.getMT=function(){for(var a="",b=0;b<navigator.mimeTypes.length;b++)a+=navigator.mimeTypes[b].description+" "+navigator.mimeTypes[b].name+" "+navigator.mimeTypes[b].version+" & ";return a};
            nexwareFunctions$$module$nexwareFunctions.getP=function(){for(var a="",b=0;b<navigator.plugins.length;b++)a+=navigator.plugins[b].description+" "+navigator.plugins[b].name+" "+navigator.plugins[b].version+" & ";return a};nexwareFunctions$$module$nexwareFunctions.getBL=function(){return navigator.language};nexwareFunctions$$module$nexwareFunctions.getBAL=function(){return navigator.languages};nexwareFunctions$$module$nexwareFunctions.getW=function(){return window.width||screen.width};
            nexwareFunctions$$module$nexwareFunctions.getH=function(){return window.height||screen.height};nexwareFunctions$$module$nexwareFunctions.getDNT=function(){return navigator.doNotTrack||!1};nexwareFunctions$$module$nexwareFunctions.getJE=function(){return navigator.javaEnabled()};nexwareFunctions$$module$nexwareFunctions.getTZO=function(){return(new Date).getTimezoneOffset()};nexwareFunctions$$module$nexwareFunctions.getCE=function(){return navigator.cookieEnabled};
            nexwareFunctions$$module$nexwareFunctions.getHC=function(){return navigator.hardwareConcurrency||0};nexwareFunctions$$module$nexwareFunctions.getM3S=function(){return document.createElement("audio").canPlayType("audio/mpeg")};nexwareFunctions$$module$nexwareFunctions.getM4S=function(){return document.createElement("audio").canPlayType("audio/mp4")};nexwareFunctions$$module$nexwareFunctions.getCD=function(){return window.colorDepth||screen.colorDepth};
            nexwareFunctions$$module$nexwareFunctions.getMTP=function(){return navigator.maxTouchPoints||0};nexwareFunctions$$module$nexwareFunctions.getID=function(){try{return!!window.indexedDB}catch(a){return!0}};nexwareFunctions$$module$nexwareFunctions.getSS=function(){try{return!!window.sessionStorage}catch(a){return!0}};nexwareFunctions$$module$nexwareFunctions.getCS=function(){var a=document.createElement("canvas");return!(!a.getContext||!a.getContext("2d"))};
            nexwareFunctions$$module$nexwareFunctions.getRU=function(){return document.referrer};nexwareFunctions$$module$nexwareFunctions.getU=function(){return document.location.href};nexwareFunctions$$module$nexwareFunctions.getT=function(){return Date.now()};
            nexwareFunctions$$module$nexwareFunctions.getFS=function(){var a,b,c,e,d;var g=!1;var f=d=b=a=null;if("undefined"!==typeof screen.fontSmoothingEnabled)g=screen.fontSmoothingEnabled;else try{for(a=document.createElement("canvas"),a.width="35",a.height="35",a.style.display="none",document.body.appendChild(a),b=a.getContext("2d"),b.textBaseline="top",b.font="32px Arial",b.fillStyle="black",b.strokeStyle="black",b.fillText("O",0,0),e=8;32>=e;e+=1)for(c=1;32>=c;c+=1)d=b.getImageData(c,e,1,1).data,f=d[3],
            255!==f&&0!==f&&(g=!0)}catch(n){return"Unknown"}return g};nexwareFunctions$$module$nexwareFunctions.getCP=function(){for(var a=performance.now(),b=0;15E7>b;b++);return performance.now()-a};
            nexwareFunctions$$module$nexwareFunctions.getG=function(){var a=jQuery("<canvas />",{width:"1",height:"1"}).appendTo("body"),b;(2===(0<window.location.search.indexOf("v=2")?2:1)?["webgl2","experimental-webgl2"]:["webgl","experimental-webgl"]).forEach(function(c){b=a[0].getContext(c,{stencil:!0})});a.remove();var c=function(a){var b={renderer:"",vendor:""},c=a.getExtension("WEBGL_debug_renderer_info");null!=c&&(b.renderer=a.getParameter(c.UNMASKED_RENDERER_WEBGL),b.vendor=a.getParameter(c.UNMASKED_VENDOR_WEBGL));
              return b}(b);return c.renderer+"/"+c.vendor};nexwareFunctions$$module$nexwareFunctions.getDM=function(){return navigator.deviceMemory||0};nexwareFunctions$$module$nexwareFunctions.getAB=function(){var a=document.createElement("div");a.innerHTML="&nbsp;";a.className="adsbox";var b=!0;try{document.body.appendChild(a),b=0===document.getElementsByClassName("adsbox")[0].offsetHeight,document.body.removeChild(a)}catch(c){b=!1}return b};
            nexwareFunctions$$module$nexwareFunctions.getDO=function(){return window.innerHeight>window.innerWidth?"portrait":"landscape"};nexwareFunctions$$module$nexwareFunctions.getDOC=function(){function a(c){b+=c.alpha+","+c.beta+","+c.gamma;window.removeEventListener("deviceorientation",a)}var b="";window.addEventListener("deviceorientation",a);return b};
            nexwareFunctions$$module$nexwareFunctions.getF=function(){var a=["monospace","sans-serif","serif"],b="Andale Mono;Arial;Arial Black;Arial Hebrew;Arial MT;Arial Narrow;Arial Rounded MT Bold;Arial Unicode MS;Bitstream Vera Sans Mono;Book Antiqua;Bookman Old Style;Calibri;Cambria;Cambria Math;Century;Century Gothic;Century Schoolbook;Comic Sans;Comic Sans MS;Consolas;Courier;Courier New;Garamond;Geneva;Georgia;Helvetica;Helvetica Neue;Impact;Lucida Bright;Lucida Calligraphy;Lucida Console;Lucida Fax;LUCIDA GRANDE;Lucida Handwriting;Lucida Sans;Lucida Sans Typewriter;Lucida Sans Unicode;Microsoft Sans Serif;Monaco;Monotype Corsiva;MS Gothic;MS Outlook;MS PGothic;MS Reference Sans Serif;MS Sans Serif;MS Serif;MYRIAD;MYRIAD PRO;Palatino;Palatino Linotype;Segoe Print;Segoe Script;Segoe UI;Segoe UI Light;Segoe UI Semibold;Segoe UI Symbol;Tahoma;Times;Times New Roman;Times New Roman PS;Trebuchet MS;Verdana;Wingdings;Wingdings 2;Wingdings 3".split(";"),c=
              document.getElementsByTagName("body")[0],e=document.createElement("div"),d=document.createElement("div"),g={},f={},n=function(){var a=document.createElement("span");a.style.position="absolute";a.style.left="-9999px";a.style.fontSize="72px";a.style.lineHeight="normal";a.innerHTML="mmmmmmmmmmlli";return a},l=function(b){for(var c=!1,d=0;d<a.length&&!(c=b[d].offsetWidth!==g[a[d]]||b[d].offsetHeight!==f[a[d]]);d++);return c},h=function(){for(var b=[],c=0,d=a.length;c<d;c++){var f=n();f.style.fontFamily=
              a[c];e.appendChild(f);b.push(f)}return b}();c.appendChild(e);for(var k=0,m=a.length;k<m;k++)g[a[k]]=h[k].offsetWidth,f[a[k]]=h[k].offsetHeight;k=function(){for(var c={},e=0,f=b.length;e<f;e++){for(var g=[],h=0,l=a.length;h<l;h++){var k=b[e];var m=a[h],q=n();q.style.fontFamily="'"+k+"',"+m;k=q;d.appendChild(k);g.push(k)}c[b[e]]=g}return c}();c.appendChild(d);h=[];m=0;for(var r=b.length;m<r;m++)l(k[b[m]])&&h.push(b[m]);c.removeChild(d);c.removeChild(e);c="";for(l=0;l<h.length;l++)c+=h[l];return c};
            nexwareFunctions$$module$nexwareFunctions.getZ=function(){return Math.round(100*window.devicePixelRatio)};
            nexwareFunctions$$module$nexwareFunctions.getC=function(){var a,b;var c=b=a=null;try{return a=document.createElement("canvas"),b=a.getContext("2d"),b.textBaseline="top",b.font="14px 'Arial'",b.textBaseline="alphabetic",b.fillStyle="#f60",b.fillRect(125,1,62,20),b.fillStyle="#069",b.fillText("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~1!2@3#4$5%6^7&8*9(0)-_=+[{]}|;:',<.>/?",2,15),b.fillStyle="rgba(102, 204, 0, 0.7)",b.fillText("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~1!2@3#4$5%6^7&8*9(0)-_=+[{]}|;:',<.>/?",
              4,17),c=a.toDataURL()}catch(e){return"Error"}};nexwareFunctions$$module$nexwareFunctions.getA=function(){try{var a=new (window.AudioContext||window.webkitAudioContext);a.createOscillator();a.createAnalyser();a.createGain();a.createScriptProcessor(4096,1,1);var b=a.destination;return a.sampleRate.toString()+"_"+b.maxChannelCount+"_"+b.numberOfInputs+"_"+b.numberOfOutputs+"_"+b.channelCount+"_"+b.channelCountMode+"_"+b.channelInterpretation}catch(c){return""}};
            nexwareFunctions$$module$nexwareFunctions.getCC=function(){return navigator.cpuClass||""};nexwareFunctions$$module$nexwareFunctions.getOL=function(){return navigator.systemLanguage||navigator.language};var module$nexwareFunctions={};module$nexwareFunctions.nexwareFunctions=nexwareFunctions$$module$nexwareFunctions;var nexwareEngine$$module$nexwareEngine=function(){};
            nexwareEngine$$module$nexwareEngine.start=function(a){return new Promise(function(b,c){c={rid:a.rid,cid:a.cid,sid:a.sid,saleOrder:a.saleOrder,saleSum:a.saleSum,saleCurr:a.saleCurr,saleZinfo:a.saleZinfo,saleBasket:a.saleBasket,title:a.title,isTouch:nexwareFunctions$$module$nexwareFunctions.getIT(),userAgent:nexwareFunctions$$module$nexwareFunctions.getUA(),mimeTypes:nexwareFunctions$$module$nexwareFunctions.getMT(),browserLanguage:nexwareFunctions$$module$nexwareFunctions.getBL(),browserAcceptedLanguages:nexwareFunctions$$module$nexwareFunctions.getBAL(),
              width:nexwareFunctions$$module$nexwareFunctions.getW(),height:nexwareFunctions$$module$nexwareFunctions.getH(),doNotTrack:nexwareFunctions$$module$nexwareFunctions.getDNT(),javaEnabled:nexwareFunctions$$module$nexwareFunctions.getJE(),timeZone:nexwareFunctions$$module$nexwareFunctions.getTZO(),cookieEnabled:nexwareFunctions$$module$nexwareFunctions.getCE(),hardwareConcurrency:nexwareFunctions$$module$nexwareFunctions.getHC(),mp3Support:nexwareFunctions$$module$nexwareFunctions.getM3S(),mp4Support:nexwareFunctions$$module$nexwareFunctions.getM4S(),
              colorDepth:nexwareFunctions$$module$nexwareFunctions.getCD(),plugins:nexwareFunctions$$module$nexwareFunctions.getP(),maxTouchPoints:nexwareFunctions$$module$nexwareFunctions.getMTP(),indexedDb:nexwareFunctions$$module$nexwareFunctions.getID(),sessionStorage:nexwareFunctions$$module$nexwareFunctions.getSS(),CanvasSupport:nexwareFunctions$$module$nexwareFunctions.getCS(),fonts:nexwareFunctions$$module$nexwareFunctions.getF(),refUrl:nexwareFunctions$$module$nexwareFunctions.getRU(),url:nexwareFunctions$$module$nexwareFunctions.getU(),
              time:nexwareFunctions$$module$nexwareFunctions.getT(),fontSmoothing:nexwareFunctions$$module$nexwareFunctions.getFS(),canvas:nexwareFunctions$$module$nexwareFunctions.getC(),cpuPower:nexwareFunctions$$module$nexwareFunctions.getCP(),gpuVendor:nexwareFunctions$$module$nexwareFunctions.getG(),deviceMemory:nexwareFunctions$$module$nexwareFunctions.getDM(),adBlock:nexwareFunctions$$module$nexwareFunctions.getAB(),deviceOrientation:nexwareFunctions$$module$nexwareFunctions.getDO(),deviceOrientationCords:nexwareFunctions$$module$nexwareFunctions.getDOC(),
              zoom:nexwareFunctions$$module$nexwareFunctions.getZ(),audio:nexwareFunctions$$module$nexwareFunctions.getA(),cpuClass:nexwareFunctions$$module$nexwareFunctions.getCC(),osLanguage:nexwareFunctions$$module$nexwareFunctions.getOL()};jQuery.post(a.url,c,function(a){b(a)})})};var module$nexwareEngine={};module$nexwareEngine.nexwareEngine=nexwareEngine$$module$nexwareEngine;(function(){nexwareEngine$$module$nexwareEngine.start(params?params:{cid:ac_mand_CID||"default",sid:ac_mand_SID||"default",rid:ac_mand_RID||"default",saleOrder:"default",saleSum:"default",saleCurr:"default",saleZinfo:"default",saleBasket:"default",title:ac_mand_TIT||"default",url:"http://81.169.231.30:8088/api/receiver"}).then(success).catch(failed)})();var module$nexwareTracker={};

          } );

        }

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
          case 'idento':
            await this.ccm.load( { url: this.url + '/logout', params: { access_token: data.token } } ).catch( () => {} );
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