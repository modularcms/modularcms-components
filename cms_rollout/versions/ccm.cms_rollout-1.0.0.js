/**
 * @overview ccm component for rollout of modularcms pages
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

( () => {

    const component = {

        name: 'cms_rollout',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cms_rollout/resources/html/templates.html" ],
            "css": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cms_rollout/resources/css/style.css" ],
            "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs"],
            "routing": ["ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js"],
            "routing_sensor": ["ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js"],
            "data_controller": ["ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js"],
            "pageRendererUrl": "https://modularcms.github.io/modularcms-components/page_renderer/versions/ccm.page_renderer-1.0.0.js"
        },

        Instance: function () {

            let $;

            this.ready = async () => {
                $ = Object.assign({}, this.ccm.helper, this.helper);                 // set shortcut to help functions
            };

            let currentContent = '';

            /**
             * Component start closure
             * @returns {Promise<void>}
             */
            this.start = async () => {
                const website = await this.data_controller.getWebsiteFromDomain(window.location.hostname);

                // Add base head tag
                let base = document.createElement('base');
                base.setAttribute('href', website.baseUrl);
                document.head.appendChild(base);

                if (website != null) {
                    this.routing.registerRoutingCallback(async (detail) => {
                        // routing entrypoint
                        if (detail.url.indexOf(website.baseUrl) == 0) {
                            const url = detail.url.substring(website.baseUrl.length - 1);
                            console.log(url);

                            // get page
                            const page = await this.data_controller.getPageByUrl(website.websiteKey, url, true);
                            if (page != null) {
                                if (currentContent != url) {
                                    currentContent = url;

                                    // Set page title
                                    let title = document.head.querySelector('title');
                                    if (title == null) {
                                        title = document.createElement('title');
                                        document.head.appendChild(title);
                                    }
                                    title.innerHTML = page.title;

                                    // Add meta head tags
                                    let addMeta = (name, content) => {
                                        let meta = document.head.querySelector('meta[name="' + name + '"]');
                                        if (meta == null) {
                                            meta = document.createElement('meta');
                                            document.head.appendChild(meta);
                                        }
                                        meta.setAttribute('name', name);
                                        meta.setAttribute('content', content);
                                    };
                                    addMeta('description', page.meta.description);
                                    addMeta('keywords', page.meta.keywords);
                                    addMeta('robots', page.meta.robots ? 'index, follow' : 'noindex, nofollow');

                                    // render page
                                    const pageRenderer = await this.ccm.start(this.pageRendererUrl, {
                                        parent: this,
                                        websiteKey: website.websiteKey,
                                        page: page
                                    });
                                    $.setContent(this.element, pageRenderer.root);
                                }
                            } else {
                                // render 404
                                this.render404();
                            }
                        } else {
                            // render 404
                            this.render404();
                        }
                    }, 'cms_rollout');
                } else {
                    alert('This site was not registered for modularcms.');
                }
            };

            this.render404 = () => {
                let metaStatus = document.head.querySelector('meta[http-equiv="Status"]');
                let setMetaStatusAttributes = () => {
                    metaStatus.setAttribute('http-equiv', 'Status');
                    metaStatus.setAttribute('content', '404');
                };
                if (metaStatus == null) {
                    metaStatus = document.createElement('meta');
                    setMetaStatusAttributes();
                    document.head.appendChild(metaStatus);
                } else {
                    setMetaStatusAttributes();
                }
                $.setContent(this.element, $.html(this.html.error404, {}));
            }

            this.cleanup404 = () => {
                const metaStatus = document.head.querySelector('meta[http-equiv="Status"]');
                $.remove(metaStatus);
            }
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
