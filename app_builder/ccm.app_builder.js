/**
 * @overview ccm component for app creation
 * @author André Kless <andre.kless@web.de> 2018-2020
 * @license The MIT License (MIT)
 * @version latest (4.2.0)
 * @changes
 * version 4.2.0 (21.04.2020):
 * - uses ccm v25.4.0
 * - uses helper.mjs v5.1.0 as default
 * - uses ccm.json_builder.js v2.1.0 as default
 * - added optional defaults for app configuration
 * - no global loading of bootstrap 4 as default
 * version 4.1.1 (24.03.2020):
 * - preview is inside the ccm context
 * - uses ccm v25.1.0
 * - uses Bootstrap 4 from CDN as default
 * - uses helper.mjs v4.1.1 as default
 * version 4.1.0 (09.02.2020):
 * - uses ccm v25.0.0
 * - uses module helper functions
 * - supports handle of app configuration without datastore
 * - creation of apps does not need a logged in user
 * - bug fix that buttons always stay on bottom
 * - added 'Permission denied' messages
 * - initial dataset which not exists in the datastore counts as new app configuration
 * - apps with to much config size can only be created as logged in user
 * - previewed app is independent of own context (no parent dependency)
 * - uses ccm.json_builder.js v2.0.0 as default
 * version 4.0.0 (18.09.2019):
 * - changed config parameters
 * - many config properties are now optional
 * - can work without modal dialogs, handover app and app metadata
 * - uses ccm v22.6.1
 * (for older version changes see ccm.app_builder-3.1.0.js)
 */

( () => {

  const component = {

    name: 'app_builder',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.4.0.js',

    config: {
//    "app": [ "ccm.component", "https://ccmjs.github.io/akless-components/cloze/versions/ccm.cloze-7.0.0.js" ],
      "builder": [ "ccm.component", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", { "directly": true, "nosubmit": true } ],
//    "convert": json => json,
      "css": [ "ccm.load",
        "https://ccmjs.github.io/akless-components/app_builder/resources/styles.css",
        "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
      ],
      "data": {},
//    "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "app_meta_create" ] ],
//    "handover_app": [ "ccm.component", "https://ccmjs.github.io/akless-components/handover_app/versions/ccm.handover_app-2.0.0.js" ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/akless-components/app_builder/resources/templates.html" ],
      "ignore": { "defaults": {} },
//    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
//    "meta_store": [ "ccm.store" ],
//    "modal_dialog": [ "ccm.component", "https://ccmjs.github.io/tkless-components/modal/versions/ccm.modal-2.0.0.js" ],
//    "onchange": ( instance, event ) => { console.log( event, instance.getValue() ); },
//    "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.5.0.js" ]
      "warning": "Are you sure you want to delete this App?"
    },

    Instance: function () {

      let $; const self = this;

      /**
       * currently used builder instance
       * @type {Object}
       */
      let builder;

      this.init = async () => {

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper );

      };

      this.ready = async () => {

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        /**
         * app configuration
         * @type {Object}
         */
        let dataset = await $.dataset( this.data );

        // logging of 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );

        /**
         * app configuration is stored in a datastore
         * @type {boolean}
         */
        const has_store = $.isDatastore( this.data.store );

        /**
         * app configuration is managed in a local datastore
         * @type {boolean}
         */
        const is_local = has_store && !this.data.store.source().name;

        /**
         * dataset key of app configuration
         * @type {string}
         */
        let app_id = has_store && !is_local && ( dataset.key ); delete dataset.key;

        /**
         * starting with new app configuration
         * @type {boolean}
         */
        let is_new = !Object.keys( dataset ).length || app_id && !await this.data.store.get( app_id );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main, {
          onCreate: createApp,
          onRead:   readApp,
          onUpdate: updateApp,
          onDelete: deleteApp
        } ) );

        // remove no needed areas
        if ( !this.app ) $.remove( this.element.querySelector( '#preview' ) );

        // render language area
        if ( this.lang ) { $.append( this.element.querySelector( '#top' ), this.lang.root ); this.lang.start(); }

        // render login/logout area
        if ( this.user ) $.append( this.element.querySelector( '#top' ), this.user.root );

        // render initial app state
        await renderApp();

        // activate/disable "Update" and "Delete" button
        updateButtons();

        /**
         * renders app-specific builder and updates preview
         * @returns {Promise}
         */
        async function renderApp() {

          // render new app-specific builder with loaded app configuration as start values
          builder = await self.builder.start( {
            root: self.element.querySelector( '#builder' ),
            data: {
              store: [ 'ccm.store', { app: $.clone( dataset ) } ],
              key: 'app'
            },
            'ignore.defaults': await $.integrate( $.deepValue( self.builder.config, 'ignore.defaults' ), self.ignore.defaults ),
            onchange: async () => {
              self.onchange && self.onchange( self, 'change' );   // perform 'onchange' callback
              await updatePreview();                              // update preview section
            }
          } );

          // update preview of build app
          await updatePreview();

          /** updates website area for app preview */
          async function updatePreview() {

            // no app component? => abort
            if ( !self.app ) return;

            // prepare app configuration
            let config = self.getValue();
            if ( self.convert ) config = await self.convert( config );
            config.root = self.element.querySelector( '#app' );
            config.parent = self;

            // render app in preview section
            await self.app.start( config );

          }

        }

        /** activates/disables "Update" and "Delete" button */
        function updateButtons() {

          if ( has_store && !is_local && app_id && !is_new )
            self.element.querySelectorAll( '.disabled' ).forEach( button => button.classList.remove( 'disabled' ) );
          else {
            self.element.querySelector( '#button-update' ).classList.add( 'disabled' );
            self.element.querySelector( '#button-delete' ).classList.add( 'disabled' );
          }

        }

        /** when "Create" button has been clicked */
        async function createApp() {

          // get current app configuration from app-specific builder
          dataset = self.getValue(); delete dataset.key;

          // config size is to much? => user must login or app creation fails
          if ( $.stringify( dataset ).length > 500000 )
            if ( self.user ) {
              if ( !self.user.isLoggedIn() )
                alert( 'Apps of this size can only be created as logged in user.' );
              await self.user.login();
            }
            else return alert( 'Failed: App size is to big' );

          // get app metadata from user
          const metadata = await getMetadata();

          // add permission settings and dataset key of metadata
          if ( self.user && self.user.isLoggedIn() && has_store && !is_local ) dataset._ = { access: { get: 'all', set: 'creator', del: 'creator' } };
          if ( metadata ) dataset.meta = [ self.meta_store.source(), metadata.key ];

          // save app configuration
          if ( self.user && self.user.isLoggedIn() && has_store && !is_local ) {
            app_id = await self.data.store.set( dataset );
            delete dataset.key;
          }

          // has metadata?
          if ( metadata && app_id ) {
            metadata.source = [ metadata.source, app_id ];  // add app ID to source information
            await self.meta_store.set( metadata );          // save metadata
          }

          // logging of 'create' event
          self.logger && self.logger.log( 'create', { config: $.clone( dataset ), metadata: $.clone( metadata ) } );

          // no more a new app configuration
          is_new = !( self.user && self.user.isLoggedIn() && has_store && !is_local );

          // no component for modal dialog? => show alert message instead
          if ( !self.modal_dialog ) alert( 'App created successfully.' + ( app_id ? ' App ID: ' + app_id : '' ) );

          // activate "Update" and "Delete" button
          updateButtons();

          // perform 'onchange' callback
          self.onchange && self.onchange( self, 'create' );

          // give app to user
          await handoverApp();

          /**
           * renders publish form for app metadata and returns resulting app metadata
           * @returns {Promise<Object>} app metadata
           */
          function getMetadata() { return new Promise( resolve => {

            // check whether all requirements for the creation of metadata are met
            if ( !self.user || !self.user.isLoggedIn() || !self.meta_store || !self.form || !has_store || is_local ) return resolve( null );

            // hide main area and add container for publish form
            self.element.querySelector( '#main' ).style.visibility = 'hidden';
            $.prepend( self.element, $.html( { id: 'form' } ) );

            // render publish form
            self.form.start( {
              root: self.element.querySelector( '#form' ),
              data: {
                store: [ 'ccm.store', self.data.store.source() ]
              },
              onfinish: async ( results, form ) => {

                // user has to be logged in
                try { self.user && await self.user.login(); } catch ( e ) { return; }

                // show main area
                $.remove( self.element.querySelector( '#form' ) );
                self.element.querySelector( '#main' ).style.visibility = 'visible';

                /**
                 * app metadata
                 * @type {Object}
                 */
                const meta = form.getValue();

                /**
                 * user data
                 * @type {Object}
                 */
                const user = self.user.data();

                // expand metadata
                Object.assign( meta, {
                  key: $.generateKey(),
                  metaFormat: 'ccm-meta',
                  metaVersion: '2.0.0',
                  format: 'application/json',
                  license: 'CC0',
                  path: self.app.url || self.app.index,
                  source: self.data.store.source(),
                  creator: user.name || user.user || user.key || '',
                  tags: [],
                  ignore: { demos: [], builders: [] },
                  _: { access: { get: 'all', set: 'creator', del: 'creator' } }
                } );

                resolve( meta );
              }
            } );

          } ); }

        }

        /** when "Read" button has been clicked */
        async function readApp() {

          // logging of 'read' event
          self.logger && self.logger.log( 'read' );

          // has component for modal dialog? => load app via modal dialog
          if ( self.modal_dialog ) {

            /**
             * modal dialog content for loading an existing app
             * @type {Element}
             */
            const content = $.html( self.html.read, {
              embed: async () => {

                /**
                 * decomposed embed code
                 * @type {Object}
                 */
                const result = self.helper.decomposeEmbedCode( content.querySelector( '#embed_code' ).value.trim() );

                // load app
                result && await load( result.config );

                // remove modal dialog
                dialog.close();

              },
              app_id: async () => {

                // load app
                await load( { store: self.data.store, key: content.querySelector( '#app_id' ).value.trim() } );

                // remove modal dialog
                dialog.close();

              },
              url: async () => {

                /**
                 * decomposed app URL
                 * @type {Object}
                 */
                const result = self.helper.decomposeAppURL( content.querySelector( '#app_url' ).value.trim() );

                // load app
                result && await load( result.config );

                // remove modal dialog
                dialog.close();

              }
            } );

            // remove no needed areas
            if ( !has_store || is_local ) $.remove( content.querySelector( '#id' ) );

            // render modal dialog
            const dialog = await self.modal_dialog.start( {
              modal_title: 'Loading an existing App',
              modal_content: content,
              footer: null
            } );

          }
          else await load( { store: self.data.store, key: prompt( 'Please enter the App ID' ) } );

          /**
           * loads a ccm-based app
           * @param {Object|{store: Object, key: string|string[]}} [config] - app configuration (or object with store and key where the app configuration is stored)
           * @returns {Promise<void>}
           */
          async function load( config ) {

            // app configuration is stored in a datastore?
            if ( config && config.store && config.key ) {

              // load app configuration
              try { dataset = await self.ccm.get( config.store, config.key ); } catch ( e ) { alert( 'Permission denied' ); }

            }
            // app configuration is given directly
            else dataset = config || {};

            // app configuration not exists? => abort
            if ( !dataset ) return alert( 'Loading of the App failed' );

            // logging of 'load' event
            self.logger && self.logger.log( 'load', $.clone( dataset ) );

            // remember App ID
            app_id = has_store && !is_local && dataset.key; delete dataset.key;

            // starts not from new app configuration
            is_new = !app_id;

            // no component for app preview? => success message
            if ( !self.app ) alert( 'App successfully loaded' );

            // render loaded app
            await renderApp();

            // activate "Update" and "Delete" button
            updateButtons();

            // perform 'onchange' callback
            self.onchange && self.onchange( self, 'read' );

          }

        }

        /** when "Save Changes" button has been clicked */
        async function updateApp() {

          // invalid state? => abort
          if ( !has_store || is_local || !app_id || is_new ) return;

          // user has to be logged in
          try { self.user && await self.user.login(); } catch ( e ) { return; }

          // get current app configuration from app-specific builder
          dataset = builder.getValue();

          // add App-ID to app configuration (to save app under same App-ID again)
          dataset.key = app_id;

          // logging of 'update' event
          self.logger && self.logger.log( 'update', $.clone( dataset ) );

          // save app configuration
          try { app_id = await self.data.store.set( dataset ); delete dataset.key; } catch ( e ) { return alert( 'Permission denied' ); }

          // no component for modal dialog? => abort
          if ( !self.modal_dialog ) alert( 'App updated successfully. App ID: ' + app_id );

          // activate "Update" and "Delete" button
          updateButtons();

          // has 'change' callback? => perform it
          self.onchange && self.onchange( self, 'update' );

          // give app to user
          await handoverApp();

        }

        /** when "Delete" button has been clicked */
        async function deleteApp() {

          // invalid state? => abort
          if ( !has_store || is_local || !app_id || is_new ) return;

          // user has to be logged in
          try { self.user && await self.user.login(); } catch ( e ) { return; }

          // user is not sure about deletion? => abort
          if ( !confirm( self.warning ) ) return;

          // logging of 'delete' event
          self.logger && self.logger.log( 'delete', $.clone( app_id ) );

          try {

            // delete app metadata
            if ( dataset.meta && self.meta_store && !is_local ) {
              dataset = await self.data.store.get( app_id );
              await self.meta_store.del( dataset.meta[ 1 ] );
            }

            // delete app configuration
            await self.data.store.del( app_id );

          } catch ( e ) { return alert( 'Permission denied' ); }

          // forget App-ID
          app_id = undefined;

          // up to now: creation of a new app configuration
          is_new = true;

          // continue with new empty app configuration
          dataset = { key: $.generateKey() };

          // update frontend
          await renderApp();

          // activate "Update" and "Delete" button
          updateButtons();

          // perform 'onchange' callback
          self.onchange && self.onchange( self, 'delete' );

        }

        /** gives app to user */
        async function handoverApp() {

          // render modal dialog for handover of the app
          self.modal_dialog && await self.modal_dialog.start( {
            modal_title: 'Handover of the App',
            modal_content: ( await self.handover_app.start( {
              data: self.user && self.user.isLoggedIn() && has_store && !is_local && app_id ? {
                store: [ 'ccm.store', self.data.store.source() ],
                key: app_id
              } : {
                store: [ 'ccm.store', { app: $.clone( dataset ) } ],
                key: 'app'
              },
              component_url: self.app && self.app.url
            } ) ).root,
            footer: null
          } );

        }

      };

      /** @returns {Object} instance configuration for target component */
      this.getValue = () => builder && builder.getValue && $.clone( builder.getValue() ) || null;

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();