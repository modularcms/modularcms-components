/**
 * @overview ccm component for sensoring clicks on a tags
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'routing_sensor',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        Instance: function () {

            this.ready = async () => {
                // detect and prevent clicks to a tags
                this.parent.element.addEventListener('click', (e) => {
                    let target = e.target;
                    do {
                        if (target.nodeType === 1 && target.tagName.toLowerCase() == 'a') {
                            let href = target.getAttribute('href');
                            if (href != null && href.indexOf('/') == 0) {
                                e.preventDefault();

                                //dispatch routing event
                                const event = new CustomEvent("routingSensorWasTriggered", {
                                    detail: {
                                        href: href
                                    }
                                });
                                window.dispatchEvent(event);
                                break;
                            }
                        }
                        target = target.parentElement;
                    } while (target != null)
                });
            };

            this.start = async () => {

            };

        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();