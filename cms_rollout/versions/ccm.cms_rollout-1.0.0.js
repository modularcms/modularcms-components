/**
 * @overview ccm component for rollout of modularcms pages
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

( () => {

    const component = {

        name: 'cms_rollout',

        version: [1, 0, 0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs"],
            "routing": ["ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", ["ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing"]],
            "data_controller": ["ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js"],
            "pageRendererUrl": "https://modularcms.github.io/modularcms-components/page_renderer/versions/ccm.page_renderer-1.0.0.js"
        },

        Instance: function () {

            let $;

            this.ready = async () => {
                $ = Object.assign({}, this.ccm.helper, this.helper);                 // set shortcut to help functions
                this.logger && this.logger.log('ready', $.privatize(this, true));  // logging of 'ready' event
            };

            let content;
            let currentContent = '';

            /**
             * Component start closure
             * @returns {Promise<void>}
             */
            this.start = async () => {
                const website = await this.data_controller.getWebsiteFromDomain(window.location.hostname);
                if (website != null) {
                    this.routing.registerRoutingCallback(async (detail) => { // TODO routing entry point
                        // routing entrypoint
                        if (detail.url.indexOf(website.entryPoint) == 0) {
                            // get page
                            const page = await this.data_controller.getPageByUrl(detail.url);
                            if (page != null) {
                                // Add base head tag
                                let base = document.createElement('base');
                                base.setAttribute('href', website.entryPoint);
                                document.head.appendChild(base);

                                // Set page title
                                let title = document.createElement('title');
                                title.innerHTML = page.title;

                                // Add meta head tags
                                let addMeta = (name, content) => {
                                    let meta = document.createElement('meta');
                                    meta.setAttribute('name', name);
                                    meta.setAttribute('content', content);
                                    document.head.appendChild(meta);
                                };
                                addMeta('description', this.page.description);
                                addMeta('keywords', this.page.keywords);
                                addMeta('robots', this.page.robots ? 'index, follow' : 'noindex, nofollow');

                                // render page
                                const pageRenderer = await this.ccm.start(this.pageRendererUrl, {
                                    parent: this,
                                    websiteKey: website.websiteKey,
                                    page: page
                                });
                                $.setContent(this.element, pageRenderer.root);
                            } else {
                                // render 404
                                // TODO 404
                            }
                        } else {
                            // render 404
                            // TODO 404
                        }
                    }, 'cms_deploy');
                } else {
                    alert('This site was not registered for modularcms.');
                }
            };
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
