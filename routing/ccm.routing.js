/**
 * @overview ccm component for routing
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license MIT License
 * @version 1.0.0
 * @changes
 * version 1.0.0 (02.12.2019):
 */

( () => {
    const component = {

        name: 'routing',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        config: {
            shadow: 'open',
            entryPoint: "/",
            routes : {}
        },

        Instance: function() {
            const self = this;
            let $;

            this.ready = async () => {
                // Init static vars
                if (!window.ccmRouting) {
                    window.ccmRouting = {
                        uniqueStateIndex: 0,
                        currentUrl: '/',
                        started: false,
                        routingCallbacks: {}
                    };
                }

                // Listen to routing sensors
                window.addEventListener('routingSensorWasTriggered', (e) => {
                    let href = e.detail.href;
                    this.navigateTo(href);
                });

                // Listen to browser back event
                window.addEventListener('popstate', (e) => {
                    if (e.state !== null) {
                        this.changeUrl(e.state.url, true);
                    }
                });
            };

            this.start = async () => {};

            /**
             * Registriert einen callback
             * @param {() => void}    callbackFunction    The callback function
             * @param {string}        index               A named callback origin component index (if the component-index is already assigned the old callback is replaced)
             * @returns {Promise<void>}
             */
            this.registerRoutingCallback = async (callbackFunction, index ) => {
                window.ccmRouting.routingCallbacks[index] = callbackFunction;
                callbackFunction(this.getRoutingDetails(window.location.pathname));

                if (!window.ccmRouting.started) {
                    window.ccmRouting.started = true;
                    this.changeUrl(window.location.pathname, true);
                }
            };

            /**
             * Navigates by an url to root
             * @param {string} url
             */
            this.navigateRoot = (url) => {
                if (url != window.ccmRouting.currentUrl) {
                    this.changeUrl(url);
                } else {
                    console.warn('Did not perform navigate, because the current url is the same');
                }
            }

            /**
             * Navigates by an url on the existing
             * @param {string} url
             */
            this.navigateTo = (url) => {
                //@TODO Check if route is valid
                if (url != window.ccmRouting.currentUrl) {
                    this.changeUrl(url);
                } else {
                    console.warn('Did not perform navigate, because the current url is the same');
                }
            }

            /**
             * Navigates back
             * @param {string} url
             */
            this.navigateBack = (url = null) => {
                if (url != window.ccmRouting.currentUrl) {
                    if (url != null) {
                        this.changeUrl(url);
                    } else {
                        window.history.back();
                    }
                } else {
                    console.warn('Did not perform navigate, because the current url is the same');
                }
            }

            /**
             * Generates the routing details object
             * @param   {string}    url     The url
             * @returns {{urlParts: string[], urlWithoutParameters: null, parameters: {}, url: *}}
             */
            this.getRoutingDetails = (url) => {
                return {
                    url: url,
                    urlParts: url.split('/').filter((item, index) => index != 0 || item != ''),
                    urlWithoutParameters: null, //@TODO
                    parameters: {}, //@TODO
                };
            }

            /**
             * Changes the browser url
             * @param {string}  url                 The url
             * @param {boolean} withoutHistoryPush  The url
             */
            this.changeUrl = (url, withoutHistoryPush = false) => {
                const routingDetails = this.getRoutingDetails(url);

                if (url === window.ccmRouting.currentUrl) {
                    console.warn('Propagated navigate, but the current url is the same');
                }

                window.ccmRouting.currentUrl = url;
                if (!withoutHistoryPush) {
                    window.history.pushState(routingDetails, '', url);
                }

                _callRoutingCallbacks(routingDetails);
            }

            /**
             * Calls all registered routing callbacks
             * @param detail
             */
            const _callRoutingCallbacks = (detail) => {
                for (let callbackKey in window.ccmRouting.routingCallbacks) {
                    window.ccmRouting.routingCallbacks[callbackKey](detail);
                }
            }
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
})();