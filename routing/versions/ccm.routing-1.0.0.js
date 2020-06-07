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

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            shadow: 'open',
            entryPoint: "/",
            routes : {}
        },

        Instance: function() {
            const self = this;
            let $;
            let routingCallbacks = [];

            this.ready = async () => {
                // Listen to routing sensors
                window.addEventListener('routingSensorWasTriggered', (e) => {
                    let href = e.detail.href;
                    this.navigateTo(href);
                });

                //Listen to browser back event
                window.addEventListener('popstate', (e) => {
                    this.changeUrl(e.state.url, false, true);
                    console.log(e);
                });
            };

            this.start = async () => {};

            let urlStack = [];
            let uniqueStateIndex = 0;
            let currentUrl = '/';
            let started = false;

            /**
             * Registriert einen callback
             * @param {void} callbackFunction
             * @returns {Promise<void>}
             */
            this.registerRoutingCallback = async (callbackFunction) => {
                routingCallbacks.push(callbackFunction);
                if (!started) {
                    started = true;
                    this.changeUrl(window.location.pathname, false, true);
                }
            };

            /**
             * Navigates by an url to root
             * @param {string} url
             */
            this.navigateRoot = (url) => {
                if (url != currentUrl) {
                    urlStack = [url];
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
                if (url != currentUrl) {
                    urlStack.push(url);
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
                if (url != currentUrl) {
                    urlStack.pop();
                    let goToUrl = '';
                    if (urlStack.length > 0) {
                        goToUrl = urlStack[urlStack.length - 1];
                    }
                    if (url !== null) {
                        goToUrl = url;
                    }
                    this.changeUrl(goToUrl);
                } else {
                    console.warn('Did not perform navigate, because the current url is the same');
                }
            }

            /**
             * Changes the browser url
             * @param {string} url The url
             * @param {number} index The url stack index
             */
            this.changeUrl = (url, index = false, withoutHistoryPush = false) => {
                let routingDetails = {
                    url: url,
                    urlWithoutParameters: null, //@TODO
                    parameters: {}, //@TODO
                    urlStack: urlStack
                }

                let uniqIndex = uniqueStateIndex++;
                routingDetails['urlIndex'] = (index !== false)?index:uniqIndex;

                if (url === currentUrl) {
                    console.warn('Propagated navigate, but the current url is the same');
                }

                currentUrl = url;
                if (!withoutHistoryPush) {
                    window.history.pushState(routingDetails, '', url);
                }

                callRoutingCallbacks(routingDetails);
            }

            let callRoutingCallbacks = (detail) => {
                for (let callback of routingCallbacks) {
                    callback(detail);
                }
            }
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
})();