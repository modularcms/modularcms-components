/**
 * @overview ccm component for rendering a menu
 * @author André Kless <andre.kless@web.de> 2015-2016, 2018-2019
 * @license The MIT License (MIT)
 * @version latest (2.8.5)
 * @changes
 * version 2.8.5 (27.11.2019):
 * - uses ccm v24.1.1
 * version 2.8.4 (10.10.2019):
 * - uses ccm v24.0.1
 * version 2.8.3 (03.10.2019):
 * - bug fix for trigger already selected menu entry
 * - bug fix for set menu entry via route
 * - uses ccm v22.7.2
 * version 2.8.2 (24.09.2019):
 * - bug fix for select menu entry by ID
 * - uses ccm v22.6.1
 * version 2.8.1 (15.09.2019):
 * - bug fix for menu entry ID and routing
 * - uses ccm v22.6.0
 * version 2.8.0 (19.07.2019):
 * - HTML template via HTML file
 * - slide mode support
 * - uses ccm 22.2.0
 * version 2.7.0 (22.06.2019):
 * - support of multilingualism
 * - uses ccm v21.0.1
 * version 2.6.0 (21.05.2019):
 * - deselection of selected menu entry with this.select()
 * - uses ccm v20.7.1
 * version 2.5.1 (20.05.2019):
 * - bug fix for render content via instance
 * version 2.5.0 (20.05.2019):
 * - added routing support
 * - uses ccm v20.6.2
 * version 2.4.4 (06.02.2019):
 * - uses ccm v20.0.0
 * version 2.4.3 (09.01.2019):
 * - added HTML class 'active' also for first child of selected entry
 * - uses ccm v18.6.8
 * version 2.4.2 (02.01.2019): uses ccm v18.6.6
 * version 2.4.1 (25.10.2018):
 * - bug fix for setting action data with string as function name
 * - uses ccm v18.0.6
 * version 2.4.0 (27.09.2018): added 'trigger_selected' property
 * version 2.3.0 (26.09.2018): added select method for select a menu entry by HTML ID or menu entry number
 * version 2.2.0 (21.09.2018): menu entry data is integrated in event data
 * version 2.1.0 (13.09.2018):
 * - a menu entry can be disabled
 * - menu entry has HTML ID (customizable)
 * - reference of menu entry element is passed to click actions and callback
 * version 2.0.0 (08.09.2018):
 * - uses ccm v18.0.0
 * - supports optional deselection of active menu entry
 * (for older version changes see ccm.routing-1.2.1.js)
 */

( () => {

  const component = {

    name: 'menu',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-24.1.1.js',

    config: {

      "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/default.css" ],
      "data": { "store": [ "ccm.store" ] },
//    "deselectable": true,
      "html": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/templates.html" ],
//    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-4.0.2.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
//    "onclick": ( event_data, instance ) => console.log( event_data, instance ),
//    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.4.js", { "app": true } ],
      "selected": 1,
//    "trigger_selected": true

    },

    Instance: function () {

      let $;

      this.init = async () => {

        // no given Light DOM? => abort
        if ( !this.inner ) return;

        // determine dataset for rendering via Light DOM
        const entries = [];
        [ ...this.inner.children ].forEach( child => {
          if ( child.tagName && child.tagName === 'ENTRY' )
            entries.push( { title: child.getAttribute( 'title' ), content: child.innerHTML } );
        } );
        this.data = { entries: entries };

      };

      this.ready = async () => {

        // set shortcut to help functions
        $ = this.ccm.helper;

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      this.start = async () => {

        // get dataset for rendering
        const dataset = await $.dataset( this.data );

        // has logger instance? => log 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main, {
          onprev: () => ( this.element.querySelector( '.entry.active' ).previousElementSibling || this.element.querySelector( '#entries' ).lastElementChild ).click(),
          onnext: () => ( this.element.querySelector( '.entry.active' ).    nextElementSibling || this.element.querySelector( '#entries' ).firstElementChild ).click()
        } ) );

        /**
         * contains menu entries
         * @type {Element}
         */
        const entries_elem = this.element.querySelector( '#entries' );

        /**
         * contains menu entry content
         * @type {Element}
         */
        const content_elem = this.element.querySelector( '#content' );

        // render menu entries
        const self = this; dataset.entries && dataset.entries.forEach( renderMenuEntry );

        // want specific preselected menu entry? => trigger click event
        if ( this.selected && ( !this.routing || !this.routing.get() ) ) {
          if ( typeof this.selected === 'string' )
            entries_elem.querySelector( '#entry-' + this.selected ).click();
          else
            entries_elem.querySelectorAll( '.entry' )[ this.selected - 1 ].click();
        }

        // translate content
        const lang_elem = this.element.querySelector( '#lang' );
        if ( self.lang ) {
          await self.lang.start();
          lang_elem && $.setContent( lang_elem, self.lang.root );
          self.lang.translate();
        }
        else $.removeElement( lang_elem );

        // define and check routes
        this.routing && this.routing.define( { entry: id => entries_elem.querySelector( '#entry-' + id ).click() } );
        this.routing && this.routing.refresh();

        /**
         * renders a menu entry
         * @param {Object|string} entry_data - menu entry data or title
         * @param {number} i - array index of menu entry
         */
        function renderMenuEntry( entry_data, i ) {

          // entry is given as string? => use it as menu entry title without content
          if ( typeof entry_data === 'string' ) entry_data = { title: entry_data };

          // set HTML ID of menu entry
          if ( !entry_data.id ) entry_data.id = i + 1;

          /**
           * menu entry
           * @type {Element}
           */
          const entry_elem = $.html( self.html.entry, { id: 'entry-' + entry_data.id, click: onClick } );

          // add menu entry title
          const title_elem = entry_elem.querySelector( '.title' );
          if ( title_elem )
            if ( self.lang )
              title_elem.setAttribute( 'data-' + self.lang.component.name, entry_data.title );
            else
              $.setContent( title_elem, $.html( entry_data.title ) );

          // disabling of menu entry
          if ( entry_data.disabled ) { entry_elem.disabled = true; entry_elem.classList.add( 'disabled' ); entry_elem.removeEventListener( 'click', onClick ) }

          // add menu entry to other entries
          entries_elem.appendChild( entry_elem );

          /** when menu entry is clicked */
          async function onClick() {

            // update route
            self.routing && self.routing.set( 'entry-' + entry_data.id );

            /**
             * clicked entry is already selected entry
             * @type {boolean}
             */
            const selected = entry_elem.classList.contains( 'selected' );

            /**
             * clicked menu entry event data
             * @type {Object}
             */
            let event_data = { title: entry_data.title, id: entry_data.id, nr: i + 1 };

            // unselect selected menu entry (if any)
            const selected_entry = entries_elem.querySelector( '.entry.selected' );
            if ( selected_entry ) {
              selected_entry.classList.remove( 'selected', 'active' );
              selected_entry.firstChild.classList.remove( 'active' );
            }

            // select clicked menu entry
            if ( !selected || !self.deselectable ) {
              entry_elem.classList.add( 'selected', 'active' );
              entry_elem.firstChild.classList.add( 'active' );
            }

            // clear menu entry content
            self.deselectable && $.setContent( content_elem, '' );

            // clicked already selected entry? => abort
            if ( selected && !self.trigger_selected ) return;

            // logging of 'click' event
            self.logger && self.logger.log( 'click', $.clone( event_data ) );

            // render menu entry title
            const title_elem = self.element.querySelector( '#title' );
            if ( title_elem ) {
              if ( self.lang )
                title_elem.setAttribute( 'data-' + self.lang.component.name, entry_data.title );
              else
                $.setContent( title_elem, $.html( entry_data.title ) );

              // restart fade effect for menu entry title
              title_elem.classList.remove( 'fade' );
              void title_elem.offsetWidth;
              title_elem.classList.add( 'fade' );

            }

            // render menu entry content
            await renderContent();

            // perform menu entry actions
            performActions();

            // translate content
            self.lang && self.lang.translate();

            /**
             * renders menu entry content
             * @returns {Promise}
             */
            async function renderContent() {

              // content is given as ccm dependency? => solve dependency
              entry_data.content = await $.solveDependency( entry_data.content );

              // no menu entry content? => abort
              if ( !entry_data.content ) return;

              // content is ccm instance? => render instance as content
              if ( $.isInstance( entry_data.content ) ) {
                await entry_data.content.start();
                entry_data.content.parent = self;
                $.setContent( content_elem, entry_data.content.root );
              }

              // has content component? => render content via content component
              else if ( self.content ) await self.content.start( { root: content_elem, inner: entry_data.content } );

              // render given content
              else $.setContent( content_elem, $.html( entry_data.content ) );

              // restart fade effect for content
              content_elem.classList.remove( 'fade' );
              void content_elem.offsetWidth;
              content_elem.classList.add( 'fade' );

            }

            /** performs menu entry actions */
            function performActions() {

              // prepare event data
              event_data = Object.assign( event_data, entry_data );
              event_data.content = content_elem;
              event_data.entry = entry_elem;
              delete event_data.actions;

              // perform menu entry actions
              if ( entry_data.actions )
                if ( typeof ( entry_data.actions ) === 'function' )
                  entry_data.actions( $.clone( event_data ), self );
                else
                  entry_data.actions.forEach( action => $.action( action ) );

              // perform callback for clicked menu entry
              self.onclick && $.action( [ self.onclick, $.clone( event_data ), self ] );

            }

          }

        }

      };

      /**
       * selects a menu entry
       * @param {string|number} [entry] - HTML ID or number of menu entry (default: no entry selected)
       */
      this.select = entry => {

        /**
         * menu entry to be selected
         * @type {Element}
         */
        const element = ( typeof entry === 'string' ? this.element.querySelector( '#entry-' + entry ) : this.element.querySelectorAll( '.entry' )[ entry - 1 ] );

        // already selected and should not be trigger again? => abort
        if ( element.classList.contains( 'active' ) && !this.trigger_selected ) return;

        // deselect already selected menu entry
        const selected_entry = this.element.querySelector( '.selected.active' );
        if ( selected_entry ) {
          selected_entry.classList.remove( 'selected', 'active' );
          selected_entry.firstChild.classList.remove( 'active' );
        }

        // select menu entry
        entry && element.click();

      }

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();