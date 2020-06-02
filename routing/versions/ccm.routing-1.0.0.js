/**
 * @overview ccm component for routing
 * @author Dominik Banduch <dominik.banduch89@googlemail.com> 2019
 * @license MIT License
 * @version 1.0.0
 * @changes
 * version 1.0.0 (02.12.2019):
 */

( () => {
    const component = {

        name: 'routing',
        
        version: [1, 0, 0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.0.0.js',

        config: {
            shadow: 'open',
            entryPoint: "/digital-maker-space/",
            routes : {
                'browse-apps': {
                    component: 'browseapps'
                },
                'publish-app': {
                    component: 'publishapp'
                },
                '': {
                    component: 'allcomponents',
                    entryPoint: true
                },
                'publish-component': {
                    component: 'publishcomponent'
                },
                'detail': {
                    component: 'listingDetailComponent',
                    detailPage: true,
                    '': {
                        component: 'listingTabComponent',
                        tabPage: true
                    },
                    'description': {
                        component: 'listingTabComponent',
                        tabPage: true
                    },
                    'rating': {
                        component: 'listingTabComponent',
                        tabPage: true
                    },
                    'discussion': {
                        component: 'listingTabComponent',
                        tabPage: true
                    },
                    'demo': {
                        component: 'listingTabComponent',
                        tabPage: true
                    },
                    'create-app': {
                        component: 'listingTabComponent',
                        tabPage: true
                    }
                },
            }
        },

        Instance: function(){
            const self = this;
            let $;

            this.ready = async () => {
                // set shortcut to help functions
                $ = this.ccm.helper;

                // logging of 'ready' event
                this.logger && this.logger.log( 'ready', $.privatize( this, true ) );
            };

            this.start = async () => {
                //var url = location.href;
                // var url = 'http://site.com/users/listing';
                var url = location.href;

                // this was considered a matching rule while it shouldn't
                // var route = '/users/list';
                // this works better
                var route = '/users/list' + '(?:\\/|$)';

                var match = url.match(new RegExp(route));
            };

            /**
             * returns object route
             * @returns {object} route key and component
             */
            this.getComponentFromRouteAttribute = (element, key, title) => {
                let route, routeSplit, object;
                // Read value of route attribute
                route = element.getAttribute('route');
                routeSplit = route.split('/');

                let keyFound = routeSplit.find(function(element) {
                    return element === '%key%';
                });

                // Get component object from routes
                switch(routeSplit.length) {
                    case 2:
                        if(keyFound) {
                            route = route.replace(routeSplit[1], key);
                            object = this.routes[routeSplit[0]];
                            object.key = routeSplit[1];
                        } else {
                            object = this.routes[routeSplit[0]];
                            object.key = routeSplit[1];
                        }
                        break;
                    case 3:
                        if(keyFound) {
                            object = this.routes[routeSplit[0]];
                            object = object[routeSplit[2]];
                            route = route.replace(routeSplit[1], key);
                            object.key = key;
                        }
                        break;
                    default:
                        object = this.routes[route];
                }

                console.log(object);
                // Build url with entryPoint
                let url = self.entryPoint + (object.entryPoint ? '' : route);

                // Change URL in browser & add to HTML5 history API pushState
                window.history.pushState(object, title ? title : element.textContent, url);

                return object;
            };

            this.get = () => {
                let url = window.location.pathname, urlSplit, route, entryPoint, tab,
                output = { component: '', key: '' };

                urlSplit = url.slice(1).split('/');
                entryPoint = urlSplit[0];
                route = urlSplit[1];
                key = urlSplit[2];
                tab = urlSplit[3];

                switch(urlSplit.length) {
                    case 2:
                        if (entryPoint === self.entryPoint.slice(1,-1)) {
                            try {
                                output.component = self.routes[route].component;
                            } catch (err) {}
                        }
                        break;
                    case 3:
                        if (entryPoint === self.entryPoint.slice(1,-1) && this.routes[route].detailPage) {
                            try {
                                output.key = key;
                                output.component = self.routes[route].component;
                            } catch (err) {}
                        }
                        break;
                    case 4:
                        try {
                            if (entryPoint === self.entryPoint.slice(1,-1) && this.routes[route].detailPage && this.routes[route][tab].tabPage) {
                                output.key = key;
                                output.tab = tab;
                                output.component = self.routes[route][tab].component;
                            }
                        } catch (err) {
                            output = {};
                        }
                        break;
                    default:

                }

                return output;
            };
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
})();