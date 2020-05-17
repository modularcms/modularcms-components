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
      "apps": [ "ccm.store" ],
//    "chart": [ "ccm.component", "https://ccmjs.github.io/akless-components/highchart/versions/ccm.highchart-3.0.2.js" ],
      "components": [ "ccm.store" ],
      "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/dms_analytics/resources/styles.css" ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.0.0.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/akless-components/dms_analytics/resources/templates.html" ],
//    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js" ],
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.js", "greedy" ] ],
//    "logs": [ "ccm.store" ],
      "menu": [ "ccm.component", "https://ccmjs.github.io/akless-components/menu/versions/ccm.menu-3.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/dms_analytics/resources/configs.js", "menu" ] ],
//    "reload": true,
//    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js" ],
//    "user": [ "ccm.instance", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.5.0.js" ]
    },

    Instance: function () {

      let $, apps, components;

      this.ready = async () => {

        $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );  // logging of 'ready' event

        // load all published apps and components
        apps       = await this.ccm.store( await this.apps      .get() );
        components = await this.ccm.store( await this.components.get() );

        // listen to datastore changes => update local data storage
        this.apps      .onchange = async () => { apps       = await this.ccm.store( await this.apps      .get() ); this.start(); };
        this.components.onchange = async () => { components = await this.ccm.store( await this.components.get() ); this.start(); };

      };

      this.start = async () => {

        $.setContent( this.element, $.loading( this ) );         // render loading icon
        this.logger && this.logger.log( 'start' );               // logging of 'start' event
        const main_elem = $.html( this.html.main, this.start );  // render main HTML structure
        const content = main_elem.querySelector( '#content' );   // select content area

        /**
         * render functions for each frontend view
         * @type {Function[]}
         */
        const view = {

          // Pie Chart: Apps created with Components
          apps: async () => {

            // no chart component? => abort
            if ( !this.chart ) return;

            // update route
            this.routing && this.routing.set( 'apps' );

            // clear content area
            $.setContent( content, $.loading() );

            // determine pie chart data and total amount of apps
            let data = {}, total = 0;
            await $.asyncForEach( await apps.get(), async app => {
              const component_index = $.convertComponentURL( app.path ).index;
              const component_name = component_index.split( '-' ).shift();
              if ( !data[ component_name ] ) {
                const component_meta = await components.get( component_index );
                if ( component_meta )
                  data[ component_name ] = { name: component_meta.title, y: 1 };
              }
              else
                data[ component_name ].y++;
              total++;
            } );
            data = Object.values( data );
            if ( data.length ) {
              const max = data.reduce( ( total, value ) => value.y > total.y ? value : total );
              max.sliced = true;
              max.selected = true;
            }

            // render pie chart
            await this.chart.start( {
              root: content,
              settings: {
                chart: {
                  type: 'pie'
                },
                title: {
                  text: 'Total: ' + total + ' Apps'
                },
                subtitle: {
                  text: 'This Diagram shows how many Apps were created with which Component.'
                },
                tooltip: {
                  pointFormat: '<b>{point.y}</b> Apps were created with this Component.'
                },
                plotOptions: {
                  pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                      enabled: true,
                      format: '<b>{point.name}</b>: {point.y}'
                    }
                  }
                },
                series: [ {
                  data: data
                } ]
              }
            } );

          },

          // Semi Pie Chart: Published Components by Category
          components: async () => {

            // no chart component? => abort
            if ( !this.chart ) return;

            // update route
            this.routing && this.routing.set( 'components' );

            // clear content area
            $.setContent( content, $.loading() );

            // filter highest version of each component
            const filtered = await this.ccm.store( await components.get() );
            await $.asyncForEach( await filtered.get(), async component => {
              let highest = component;
              const results = await filtered.get( { identifier: component.identifier } );
              results.forEach( result => {
                const compare = $.compareVersions( result.version, highest.version );
                compare > 0 && filtered.del( highest.key );
                compare < 0 && filtered.del( result.key );
              } );
            } );

            // determine semi pie chart data
            let data = {}, total = 0;
            await $.asyncForEach( await filtered.get(), async component => {
              if ( !data[ component.category ] )
                data[ component.category ] = { name: component.category || 'Without Category', y: 1 };
              else
                data[ component.category ].y++;
              total++;
            } );
            data = Object.values( data );

            // render semi pie chart
            await this.chart.start( {
              root: content,
              settings: {
                title: {
                  text: `Total:<br>${total} Components`,
                  verticalAlign: 'middle',
                  y: 40
                },
                subtitle: {
                  text: 'This Diagram shows how many Components were published under which Category.',
                  y: -70,
                  verticalAlign: 'bottom'
                },
                tooltip: {
                  pointFormat: '{point.y} Components have been published under this Category.'
                },
                plotOptions: {
                  pie: {
                    dataLabels: {
                      enabled: true,
                      format: '<b>{point.name}</b>: {point.y}'
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: [ '50%', '75%' ],
                    size: '110%'
                  }
                },
                series: [
                  {
                    type: 'pie',
                    innerSize: '50%',
                    data: data
                  }
                ]
              }
            } );

          },

          // Bar Chart: Apps created by App Creators
          app_creators: async () => {

            // no chart component? => abort
            if ( !this.chart ) return;

            // update route
            this.routing && this.routing.set( 'app_creators' );

            // clear content area
            $.setContent( content, $.loading() );

            // determine bar chart data
            let data = {}, total = 0;
            await $.asyncForEach( await apps.get(), async app => {
              const creator = app._.creator;
              if ( !data[ creator ] )
                data[ creator ] = { name: app.creator, y: 1 };
              else
                data[ creator ].y++;
              total++;
            } );
            data = Object.values( data );

            // sort by app creator names
            data.sort( ( a, b ) => {
              a = a.name.toLowerCase();
              b = b.name.toLowerCase();
              return a < b ? -1 : ( a > b ? 1 : 0 );
            } );

            /**
             * names of component developers
             * @type {string[]}
             */
            const users = data.map( value => value.name );

            // render bar chart
            await this.chart.start( {
              root: content,
              settings: {
                chart: {
                  type: 'bar'
                },
                title: {
                  text: `<b>${users.length} App Creators</b> have created <b>${total} Apps</b>`
                },
                xAxis: {
                  categories: users
                },
                yAxis: {
                  allowDecimals: false,
                  min: 0,
                  title: {
                    text: null,
                  }
                },
                tooltip: {
                  pointFormat: '<b>{point.y}</b> Apps were created by this App Creator.'
                },
                plotOptions: {
                  bar: {
                    dataLabels: {
                      enabled: true
                    }
                  }
                },
                series: [
                  {
                    name: 'Created Apps',
                    data: data
                  }
                ]
              }
            } );

          },

          // Bar Chart: Components published by Component Developers
          component_developers: async () => {

            // no chart component? => abort
            if ( !this.chart ) return;

            // update route
            this.routing && this.routing.set( 'component_developers' );

            // clear content area
            $.setContent( content, $.loading() );

            // filter highest version of each component
            const filtered = await this.ccm.store( await components.get() );
            await $.asyncForEach( await filtered.get(), async component => {
              let highest = component;
              const results = await filtered.get( { identifier: component.identifier } );
              results.forEach( result => {
                const compare = $.compareVersions( result.version, highest.version );
                compare > 0 && filtered.del( highest.key );
                compare < 0 && filtered.del( result.key );
              } );
            } );

            // determine bar chart data
            let data = {}, total = 0;
            await $.asyncForEach( await filtered.get(), async component => {
              const creator = component._.creator;
              if ( !data[ creator ] )
                data[ creator ] = { name: component.creator, y: 1 };
              else
                data[ creator ].y++;
              total++;
            } );
            data = Object.values( data );

            // sort by component developer names
            data.sort( ( a, b ) => {
              a = a.name.toLowerCase();
              b = b.name.toLowerCase();
              return a < b ? -1 : ( a > b ? 1 : 0 );
            } );

            /**
             * names of component developers
             * @type {string[]}
             */
            const users = data.map( value => value.name );

            // render bar chart
            await this.chart.start( {
              root: content,
              settings: {
                chart: {
                  type: 'bar'
                },
                title: {
                  text: `<b>${users.length} Component Developers</b> have published <b>${total} Components</b>`
                },
                xAxis: {
                  categories: users
                },
                yAxis: {
                  allowDecimals: false,
                  min: 0,
                  title: {
                    text: null,
                  }
                },
                tooltip: {
                  pointFormat: '<b>{point.y}</b> Components were published by this Component Developer.'
                },
                plotOptions: {
                  bar: {
                    dataLabels: {
                      enabled: true
                    }
                  }
                },
                series: [
                  {
                    name: 'Published Components',
                    data: data
                  }
                ]
              }
            } );

          },

          // Line Chart: Visitors per Day
          visitors: async () => {

            if ( !this.chart || !this.logs ) return;         // no chart component or datastore for logs? => abort
            this.routing && this.routing.set( 'visitors' );  // update route
            $.setContent( content, $.loading() );            // clear content area and show loading icon

            // set initial series data for line chart
            const series = [ { type: 'line', name: 'Visits a Day', data: [] } ];

            // prepare line chart data
            const results = await this.logs.get( { event: 'ready' } );
            const visitors = {};
            const add = ( time, obj ) => {

              time = new Date( time );
              time.setHours( 0 );
              time.setMinutes( 0 );
              time.setSeconds( 0 );
              time.setMilliseconds( 0 );
              time = time.getTime();

              obj[ time ] ? obj[ time ]++ : obj[ time ] = 1;

              if ( obj[ time ] !== 1 ) return;

              const before = time - ( 24 * 60 * 60 * 1000 );
              const after  = time + ( 24 * 60 * 60 * 1000 );

              if ( !obj[ before ] ) obj[ before ] = 0;
              if ( !obj[ after  ] ) obj[ after  ] = 0;

            };
            results.forEach( result => add( result.created_at, visitors ) );
            let n = -2, sum = 0;
            for ( const time in visitors ) {
              n++;
              sum += visitors[ time ];
              series[ 0 ].data.push( [ parseInt( time ), visitors[ time ] ] );
            }
            series[ 0 ].data.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
            series[ 0 ].data.shift(); series[ 0 ].data.pop();

            // render chart
            await this.chart.start( {
              root: content,
              settings: {
                chart: { zoomType: 'x' },
                title: {
                  text: `Total: ${sum} Visits`
                },
                subtitle: {
                  text: `On Average ${Math.round(sum/n)} Visits a Day`
                },
                time: {
                  timezoneOffset: new Date().getTimezoneOffset()
                },
                xAxis: { type: 'datetime' },
                yAxis: {
                  title: { text: 'Results' },
                  tickInterval: 1
                },
                tooltip: {
                  pointFormat: 'The Digital Makerspace was visited <b>{point.y}</b> time(s) that day.'
                },
                legend: { enabled: true },
                series: series
              }
            } );

          }

        };

        // render menu
        const menu = await this.menu.start( {
          root: main_elem.querySelector( '#menu' ),
          onchange: event => view[ event.id ](),
          selected: this.routing && this.routing.get() ? null : undefined
        } );

        // render top container
        !this.reload && $.remove( main_elem.querySelector( '#reload' ) );
        if ( this.lang ) { $.append( main_elem.querySelector( '#top' ), this.lang.root ); this.lang.start(); }
        if ( this.user ) { $.append( main_elem.querySelector( '#top' ), this.user.root ); this.user.start(); }

        $.setContent( this.element, main_elem );  // show prepared main HTML structure (removes loading icon)
        this.lang && this.lang.translate();       // translate own content

        // define and check routes
        this.routing && await this.routing.define( {
          apps:                 () => menu.select( 'apps'                 ),
          components:           () => menu.select( 'components'           ),
          app_creators:         () => menu.select( 'app_creators'         ),
          component_developers: () => menu.select( 'component_developers' ),
          visitors:             () => menu.select( 'visitors'             )
        } );

      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
