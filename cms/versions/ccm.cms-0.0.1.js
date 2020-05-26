/**
 * @overview ccm component for modularcms backend
 * @author Felix Bröhl <broehlfelix@googlemail.com> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 * @changes
 * version 1.0.0 (17.05.2020)
 * - initial commit
 */

 ( () => {

   const component = {

     name: 'cms',

     ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.4.0.js',

     config: {
 //    "add_version": true,
 //    "analytics": [ "ccm.component", "https://ccmjs.github.io/akless-components/dms_analytics/versions/ccm.dms_analytics-1.1.0.js" ],
 //    "app_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/app_manager/versions/ccm.app_manager-2.0.1.js" ],
 //    "apps": [ "ccm.store" ],
       "css": [ "ccm.load",
         "https://ccmjs.github.io/akless-components/dms/resources/css/dms.css",
         "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
       ],
 //    "component_manager": [ "ccm.component", "https://ccmjs.github.io/akless-components/component_manager/versions/ccm.component_manager-3.4.1.js" ],
 //    "components": [ "ccm.store" ],
 //    "default_icon": "https://ccmjs.github.io/akless-components/dms/resources/img/default.png",
 //    "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "component_meta" ] ],
       "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.0.0.mjs" ],
       "html": [ "ccm.load", "https://ccmjs.github.io/akless-components/dms/resources/html/dms.html" ],
 //    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
 //    "listing": { "apps": [ "ccm.component", ... ], "components": [ "ccm.component", ... ] },
 //    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
 //    "logo": "https://ccmjs.github.io/akless-components/dms/resources/img/component.png",
       "menu": [ "ccm.component", "https://ccmjs.github.io/akless-components/menu/versions/ccm.menu-3.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/dms/resources/resources.js", "menu" ] ],
 //    "rating": { "apps": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] }, { "components": { "component": [ "ccm.component", ... ], "store": [ "ccm.store", ... ] } },
 //    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js" ],
       "title": "Digital Makerspace"
 //    "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.5.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/dms/resources/resources.js", "user" ] ]
     },

     Instance: function () {

       let $;

       this.ready = async () => {
         $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
         this.logger && this.logger.log( 'ready', $.privatize( this, true ) );  // logging of 'ready' event
       };

       this.start = async () => {

         // logging of 'start' event
         this.logger && this.logger.log( 'start' );

         // load all published apps and components
         const apps = this.apps && await this.ccm.store( await this.apps.get() );
         const components = await this.ccm.store( await this.components.get() );

         // render main HTML structure
         $.setContent( this.element, $.html( this.html.main, { logo: this.logo, title: this.title } ) );

         // select content area
         const content = this.element.querySelector( '#content' );

         /**
          * render functions for each frontend view
          * @type {Object.<string,Function>}
          */
         const view = {

           // Home
           home: async () => {

             // update route
             this.routing && this.routing.set( 'home' );

             // render home section content
             $.setContent( content, $.html( this.html.home ) );

             // render Digital Makerspace analytics
             if ( this.analytics )
               await this.analytics.start( { root: content.querySelector( '#analytics' ) } );
             else
               $.remove( content.querySelector( '#analytics_section' ) );

           },

           // Apps
           apps: async () => {

             // update route
             this.routing && this.routing.set( 'apps' );

             // no listing component or no app datastore? => abort
             if ( !this.listing || !this.listing.apps || !this.apps ) return $.setContent( content, '' );

             // render apps section
             $.setContent( content, $.html( this.html.list ) );

             // determine values for app filters
             let app_titles = {}, component = {}, component_titles = {}, creators = {}, categories = {}, tags = {}, languages = {};
             const add = ( obj, key ) => !obj[ key ] && ( obj[ key ] = true );
             await $.asyncForEach( await apps.get(), async app => {

               add( app_titles, app.title    );  // app title
               add( creators  , app.creator  );  // app creator
               add( categories, app.category );  // app category

               app.tags     && app.tags    .forEach( tag      => add( tags     , tag      ) );  // app tag
               app.language && app.language.forEach( language => add( languages, language ) );  // app language

               // determine component meta data
               let meta = $.convertComponentURL( app.path );
               if ( !component[ app.path ] ) component[ app.path ] = await components.get( meta.index );
               meta = component[ app.path ];

               meta && add( component_titles, meta.title );  // component title

             } );

             // sort determined values for app filters
             app_titles       = Object.keys( app_titles       ).sort();
             creators         = Object.keys( creators         ).sort();
             categories       = Object.keys( categories       ).sort();
             tags             = Object.keys( tags             ).sort();
             languages        = Object.keys( languages        ).sort();
             component_titles = Object.keys( component_titles ).sort();

             /**
              * contains app filters
              * @type {Element}
              */
             const filters = content.querySelector( '#filters' );

             // render app filters
             $.setContent( filters, $.html( this.html.filters ) );
             const append = ( values, id, upper ) => values.forEach( value => $.append( filters.querySelector( '#' + id ), $.html( { tag: 'option', value: upper ? value.toUpperCase() : value } ) ) );
             append( app_titles, 'search_data' );
             append( component_titles, 'component_data' );
             append( creators, 'creator_data' );
             append( categories, 'category_data' );
             append( tags, 'tags_data' );
             append( languages, 'language_data', true );

             /**
              * updates the apps listing
              * @returns {Promise<void>}
              */
             const updateListing = async () => {

               // filter apps
               const filtered_apps = ( await apps.get() ).filter( app => {
                 let value;
                 value = filters.querySelector( '#search'    ).value.toLowerCase(); if ( value && ( !app.title    || !app.title   .toLowerCase().includes( value ) ) ) return false;
                 value = filters.querySelector( '#creator'   ).value.toLowerCase(); if ( value && ( !app.creator  || !app.creator .toLowerCase().includes( value ) ) ) return false;
                 value = filters.querySelector( '#category'  ).value.toLowerCase(); if ( value && ( !app.category || !app.category.toLowerCase().includes( value ) ) ) return false;
                 value = filters.querySelector( '#tags'      ).value.toLowerCase(); if ( value && ( !app.tags     || !app.tags    .some( tag      => tag     .toLowerCase().includes( value ) ) ) ) return false;
                 value = filters.querySelector( '#language'  ).value.toLowerCase(); if ( value && ( !app.language || !app.language.some( language => language.toLowerCase().includes( value ) ) ) ) return false;
                 value = filters.querySelector( '#component' ).value.toLowerCase(); if ( value && ( !component[ app.path ] || !component[ app.path ].title.toLowerCase().includes( value ) ) ) return false;
                 return true;
               } );

               /**
                * local datastore with all app ratings
                * @type {Object}
                */
               const ratings = await this.ccm.store( await this.rating.apps.store.get() );

               // render listing with all apps
               await this.listing.apps.start( {
                 root: content.querySelector( '#listing' ),
                 convert: async app_meta => {
                   const component_meta = await components.get( $.convertComponentURL( app_meta.path ).index );
                   if ( !component_meta ) return app_meta;
                   app_meta.component = component_meta.title;
                   app_meta.version = component_meta.version;
                   return app_meta;
                 },
                 data: { entries: filtered_apps },
                 defaults: { icon: '' },
                 sort: ( a, b ) => {
                   const title_x = a.title.toLowerCase();
                   const title_y = b.title.toLowerCase();
                   const creator_x = ( a.creator || '' ).toLowerCase();
                   const creator_y = ( b.creator || '' ).toLowerCase();
                   if ( title_x < title_y ) return -1;
                   if ( title_x > title_y ) return 1;
                   if ( creator_x < creator_y ) return -1;
                   if ( creator_x > creator_y ) return 1;
                   return 0;
                 },
                 onrender: async event => {

                   // app has no own icon => use component icon or default icon
                   const icon = event.elem.querySelector( '.icon' );
                   if ( !icon.getAttribute( 'src' ) ) {
                     const component = await components.get( $.convertComponentURL( event.data.path ).index );
                     icon.setAttribute( 'src', component && component.icon || this.default_icon|| '' );
                   }
                   if ( !icon.getAttribute( 'src' ) ) $.remove( event.elem.querySelector( '.icon-area' ) );

                   // no component information? => remove element for component information
                   if ( !event.data.component || !event.data.version ) $.remove( event.elem.querySelector( '.component' ) );

                   // render rating
                   this.rating && this.rating.apps && this.rating.apps.component.start( {
                     root: event.elem.querySelector( '.rating' ),
                     'data.store': ratings,
                     'data.key': event.data.key
                   } );

                 },
                 onchange: async event => {
                   this.logger && this.logger.log( 'app', $.clone( event.data ) );
                   await showApp( event.data.key );
                 }
               } );

             };

             // set change events of app filters
             filters.querySelectorAll( '.filter input' ).forEach( filter => filter.addEventListener( 'change', updateListing ) );

             // render apps listing
             await updateListing();

           },

           // Components
           components: async () =>  {

             // update route
             this.routing && this.routing.set( 'components' );

             // no listing component? => abort
             if ( !this.listing || !this.listing.components ) return $.setContent( content, '' );

             // render components section
             $.setContent( content, $.html( this.html.list ) );

             // filter highest version of each component
             const filtered_components = await this.ccm.store( await components.get() );
             await $.asyncForEach( await filtered_components.get(), async component => {
               let highest = component;
               const results = await filtered_components.get( { identifier: component.identifier } );
               results.forEach( result => {
                 const compare = $.compareVersions( result.version, highest.version );
                 compare > 0 && filtered_components.del( highest.key );
                 compare < 0 && filtered_components.del( result.key );
               } );
             } );

             // determine values for component filters
             let titles = {}, publishers = {}, categories = {}, tags = {};
             const add = ( obj, key ) => !obj[ key ] && ( obj[ key ] = true );
             await $.asyncForEach( await filtered_components.get(), async component => {

               add( titles,     component.title    );  // component title
               add( publishers, component.creator  );  // component publisher
               add( categories, component.category );  // component category

               component.tags && component.tags.forEach( tag => add( tags , tag ) );  // component tag

             } );

             // sort determined values for component filters
             titles     = Object.keys( titles     ).sort();
             publishers = Object.keys( publishers ).sort();
             categories = Object.keys( categories ).sort();
             tags       = Object.keys( tags       ).sort();

             /**
              * contains component filters
              * @type {Element}
              */
             const filters = content.querySelector( '#filters' );

             // render component filters
             $.setContent( filters, $.html( this.html.filters ) );
             const append = ( values, id ) => values.forEach( value => $.append( filters.querySelector( '#' + id ), $.html( { tag: 'option', value: value } ) ) );
             $.remove( filters.querySelector( '#component_filter' ) );
             $.remove( filters.querySelector( '#language_filter' ) );
             append( titles, 'search_data' );
             append( publishers, 'creator_data' );
             append( categories, 'category_data' );
             append( tags, 'tags_data' );

             /**
              * updates the components listing
              * @returns {Promise<void>}
              */
             const updateListing = async () => {

               // filter components
               const components = ( await filtered_components.get() ).filter( component => {
                 let value;
                 value = filters.querySelector( '#search'    ).value.toLowerCase(); if ( value && ( !component.title    || !component.title   .toLowerCase().includes( value ) ) ) return false;
                 value = filters.querySelector( '#creator'   ).value.toLowerCase(); if ( value && ( !component.creator  || !component.creator .toLowerCase().includes( value ) ) ) return false;
                 value = filters.querySelector( '#category'  ).value.toLowerCase(); if ( value && ( !component.category || !component.category.toLowerCase().includes( value ) ) ) return false;
                 value = filters.querySelector( '#tags'      ).value.toLowerCase(); if ( value && ( !component.tags     || !component.tags    .some( tag => tag.toLowerCase().includes( value ) ) ) ) return false;
                 return true;
               } );

               /**
                * local datastore with all component ratings
                * @type {Object}
                */
               const ratings = await this.ccm.store( await this.rating.components.store.get() );

               // render listing of all components
               await this.listing.components.start( {
                 root: content.querySelector( '#listing' ),
                 data: { entries: components },
                 defaults: {
                   icon: this.default_icon,
                   subject: ''
                 },
                 sort: ( a, b ) => {
                   const title_x = a.title.toLowerCase();
                   const title_y = b.title.toLowerCase();
                   const creator_x = ( a.creator || '' ).toLowerCase();
                   const creator_y = ( b.creator || '' ).toLowerCase();
                   if ( title_x < title_y ) return -1;
                   if ( title_x > title_y ) return 1;
                   if ( creator_x < creator_y ) return -1;
                   if ( creator_x > creator_y ) return 1;
                   return 0;
                 },
                 onrender: event => {

                   // no component icon? => remove header
                   if ( !event.data.icon && !this.default_icon ) $.remove( event.elem.querySelector( '.header' ) );

                   // render rating
                   this.rating && this.rating.components && this.rating.components.component.start( {
                     root: event.elem.querySelector( '.rating' ),
                     'data.store': ratings,
                     'data.key': event.data.key
                   } );

                 },
                 onchange: async event => {
                   this.logger && this.logger.log( 'component', $.clone( event.data ) );
                   this.component_manager && await showComponent( event.data.key );
                 }
               } );

             };

             // set change events of component filters
             filters.querySelectorAll( '.filter input' ).forEach( filter => filter.addEventListener( 'change', updateListing ) );

             // render components listing
             await updateListing();

           },

           // Publish
           publish: () => {

             // update route
             this.routing && this.routing.set( 'publish' );

             // no user or no data store or no form? => abort
             if ( !this.user || !this.components || !this.form ) return $.setContent( content, '' );

             // render publish component form
             this.form.start( {
               root: content,
               data: { store: [ 'ccm.store', this.components.source() ] },
               onfinish: {
                 condition: async results => {

                   // validate component object
                   try {
                     await this.ccm.component( results.path );
                   }
                   catch ( e ) {
                     alert( 'Publish failed. Your component is not valid.' );
                     return false;
                   }

                   // validate component name
                   const data = $.convertComponentURL( results.path );
                   const component = await this.components.get( { name: data.name } );
                   if ( component.length )
                     alert( `Publish failed. A component with the unique name '${data.name}' has already been released.` );
                   return !component.length;

                 },
                 convert: async ( json, instance ) => {

                   /**
                    * user data
                    * @type {Object}
                    */
                   const user = this.user.data();

                   // expand entered component metadata
                   Object.assign( json, {
                     key: instance.data.key = $.convertComponentURL( json.path ).index,
                     metaFormat: 'ccm-meta',
                     metaVersion: '2.0.0',
                     format: 'application/js',
                     license: 'MIT Licence',
                     creator: user.name || user.user || user.key || '',
                     tags: [],
                     ignore: { demos: [], builders: [] },
                     _: { access: { get: 'all', set: 'creator', del: 'creator' } }
                   } );
                   if ( !json.icon && this.default_icon ) json.icon = this.default_icon;

                   // set component identifier and version
                   json.version = json.key.split( '-' );
                   json.identifier = json.version.shift();
                   json.version = json.version.join( '.' );

                   return json;
                 },
                 login: true,
                 store: true,
                 alert: 'Congratulations! You have successfully published a component.',
                 callback: async results => {
                   this.logger && this.logger.log( 'publish', $.clone( results ) );
                   await components.set( results );     // add component in local components data
                   await showComponent( results.key );  // show published component in component manager
                 }
               }
             } );

           }

         };

         /**
          * shows an app
          * @param {string} id - app ID
          * @returns {Promise<void>}
          */
         const showApp = async id => {

           // update route
           this.routing && this.routing.set( `app-${id}` );

           // no app manager? => abort
           if ( !this.app_manager ) return $.setContent( content, '' );

           // render app manager
           await this.app_manager.start( {
             root: content,
             data: {
               store: [ 'ccm.store', this.apps.source() ],
               key: id
             },
             default_icon: ( await components.get( $.convertComponentURL( ( await apps.get( id ) ).path ).index ) ).icon || this.default_icon,
             onchange: async event => {

               // edited app metadata? => update app in local apps data
               if ( event.event === 'update' ) await apps.set( await this.apps.get( id ) );

               // deleted app metadata and config?
               if ( event.event === 'delete' ) {
                 await apps.del( event.dataset.key );  // delete app in local apps data
                 alert( 'App deleted successfully' );  // success message for the user
                 menu.select( 'apps' );                // render apps view
               }

             },
             onstart: async app_manager => {

               /**
                * app metadata
                * @type {Object}
                */
               const meta = await apps.get( id );

               // render 'Create Similar App' button
               $.append( app_manager.element.querySelector( '#main' ), $.html( {
                 "id": "create_similar_app",
                 "inner": {
                   "tag": "button",
                   "style": "font-size: large; padding: 0.5em; margin: 1em 0; width: 100%;",
                   "inner": app_manager.user && app_manager.user.isLoggedIn() && app_manager.user.data().name === meta.creator ? "Edit App Configuration" : "Create Similar App",
                   "onclick": async () => await showComponent( $.convertComponentURL( meta.path ).index, await $.solveDependency( [ 'ccm.get', meta.source[ 0 ], meta.source[ 1 ] ] ) )
                 }
               } ) );

             }
           } );

         };

         /**
          * shows a component
          * @param {string} index - component index
          * @param {Object} [config] - initial app configuration for app creation
          * @returns {Promise<void>}
          */
         const showComponent = async ( index, config ) => {

           // update route
           this.routing && this.routing.set( `component-${index}` );

           // set active menu entry
           await menu.select( 'components', true );

           // no component manager? => abort
           if ( !this.component_manager ) return $.setContent( content, '' );

           // render component manager
           await this.component_manager.start( {
             root: content,
             data: {
               store: this.components,
               key: index
             },
             'ignore.create_similar_app': $.clone( config ),
             onchange: async event => {
               switch ( event.event ) {
                 case 'edit':
                   await components.set( event.dataset );
                   break;
                 case 'del':
                   await components.del( event.dataset.key );
                   await menu.select( 'components' );
                   break;
               }
             },
             onstart: async component_manager => {

               // replace version number with selector box
               const version_number = component_manager.element.querySelector( '#version_number' );
               if ( !version_number ) return;
               const options = [];
               let version = index.split( '-' );
               const identifier = version.shift();
               version = version.join( '.' );
               const versions = ( await this.ccm.get( this.components, { identifier: identifier } ) ).map( component => component.version ).sort( $.compareVersions ).reverse();
               versions.forEach( value => options.push( { tag: 'option', inner: value, selected: value === version } ) );
               const component = await components.get( index );
               if ( this.user && this.user.isLoggedIn() && component._ && component._.creator === this.user.data().key && this.add_version )
                 options.push( { tag: 'option', value: 'add', inner: 'Add Version' } );
               options.length > 1 && $.replace( version_number, $.html( { tag: 'select', id: 'version_number', class: 'text-muted', inner: options, onchange: async event => {
                 if ( event.target.value === 'add' ) {
                   let url = prompt( 'Please enter the URL of the component version file:' );
                   if ( !url || typeof url !== 'string' || !$.regex( 'filename' ).test( url.split( '/' ).pop() ) ) return alert( 'Invalid component URL' );
                   url = $.convertComponentURL( url );
                   if ( url.name !== component.identifier ) return alert( 'Invalid component name' );
                   if ( versions.includes( url.version ) ) return alert( 'Version already exists' );
                   component.path = url.url; component.version = url.version; component.key = url.index; delete component.created_at; delete component.updated_at;
                   component.ignore.demos.forEach( demo => demo.app[ 1 ] = component.path );
                   await this.components.set( component );
                   await components.set( component );
                   await showComponent( component.key );
                 }
                 else showComponent( `${identifier}-${event.target.value.split('.').join('-')}` );
               } } ) );

             },
             'routing.2.app': this.routing.app + '_' + index.replace( /-/g, '_' )
           } );

         };

         // render header menu
         const menu = await this.menu.start( {
           root: this.element.querySelector( '#menu' ),
           onchange: event => {
             this.logger && this.logger.log( 'menu', event.id );
             view[ event.id ]();
           },
           selected: this.routing && this.routing.get() ? null : undefined
         } );

         // render top container
         if ( this.lang ) { $.append( this.element.querySelector( '#top' ), this.lang.root ); this.lang.start(); }
         if ( this.user ) { $.append( this.element.querySelector( '#top' ), this.user.root ); this.user.start(); }

         // translate content
         this.lang && this.lang.translate();

         // define and check routes
         this.routing && await this.routing.define( {
           home:       () => menu.select( 'home' ),
           apps:       () => menu.select( 'apps' ),
           components: () => menu.select( 'components' ),
           publish:    () => menu.select( 'publish' ),
           app:        showApp,
           component:  ( name, major, minor, patch ) => showComponent( `${name}-${major}-${minor}-${patch}` )
         } );

       };

     }

   };

   let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
 } )();
