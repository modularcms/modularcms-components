/**
 * @overview modularcms component that manages the pages
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'website_manager',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/page_manager/resources/html/page_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/website_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.createPanelCreated = false;
            this.installPanelCreated = false;

            /**
             * Starts the component
             * @returns {Promise<void>}
             */
            this.start = async () => {
                // Add routing
                this.routing.registerRoutingCallback(async (detail) => {
                    if (detail.url == '/websites/create') {
                        if (!this.createPanelCreated) {
                            this.createPanelCreated = true;
                            await this.openCreateWebsitePanel();
                        } else {
                            this.element.querySelector('#website-create-panel').classList.remove('hidden');
                        }
                        if (this.installPanelCreated) {
                            this.element.querySelector('#website-install-panel').classList.add('hidden');
                        }
                    } else if (detail.url.indexOf('/websites/install/') == 0) {
                        if (!this.installPanelCreated) {
                            this.installPanelCreated = true;
                            await this.openInstallWebsitePanel(detail.urlParts[2]);
                        } else {
                            this.element.querySelector('#website-install-panel').classList.remove('hidden');
                        }
                        if (this.createPanelCreated) {
                            this.element.querySelector('#website-create-panel').classList.add('hidden');
                        }
                    } else if (detail.url.indexOf('/websites/edit/') == 0) {
                        // @TODO
                    } else {
                        // Close modal
                        await this.closePanels();
                    }
                });

                // Start add select render
                let selectWrapper = document.createElement('div');
                selectWrapper.id = 'website-select-wrapper';
                $.setContent(this.element, selectWrapper);
                await this.renderWebsiteSelect();
            };

            /**
             * Renders the website select box
             * @param {string}  target          Target element
             * @returns {Promise<void>}
             */
            this.renderWebsiteSelect = async () => {
                const wrapper = this.element.querySelector('#website-select-wrapper');

                const selectedWebsiteKey = await this.data_controller.getSelectedWebsiteKey();
                if (selectedWebsiteKey != null) {
                    const website = await this.data_controller.getWebsite(selectedWebsiteKey);
                    const websites = await this.data_controller.getUserWebsites();

                    // Render select box
                    $.setContent(wrapper, $.html(this.html.selectBox, {
                        domain: website.domain
                    }));

                    // Add items to select list
                    const selectList = this.element.querySelector('#website-select-list');
                    for (let website of websites) {
                        $.append(selectList, $.html(this.html.listItem, {
                            websiteKey: website.websiteKey,
                            domain: website.domain
                        }));
                    }

                    // TODO Add list click events
                } else {
                    // Render no website select box
                    $.setContent(wrapper, $.html(this.html.selectBox, {
                        domain: '-- No website existing --'
                    }));
                }
            }

            /**
             * Creates the panel to create a new website
             * @returns {Promise<void>}
             */
            this.openCreateWebsitePanel = async () => {
                // Append modal html
                $.append(this.element, $.html(this.html.createWebsitePanel, {}));

                // Add event for finish
                this.element.querySelector('#website-create-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    // Get values
                    const domain = this.element.querySelector('#website-create-domain').value;
                    const baseUrl = this.element.querySelector('#website-create-base-url').value;

                    // Add the website
                    try {
                        // Show loader
                        this.element.querySelector('.panel-box').classList.add('loading');
                        $.setContent(this.element.querySelector('.panel-loader-wrapper'), $.html(this.html.loader, {}));

                        // Create the website
                        const websiteKey = await this.data_controller.createWebsite(domain, baseUrl);

                        // Set the created website as the current working target website
                        await this.data_controller.setSelectedWebsiteKey(websiteKey);

                        // Navigate to install panel
                        this.routing.navigateTo('/websites/install/' + websiteKey);
                    } catch (e) {
                        // TODO Errorhandling
                    }
                });
            }

            /**
             * Creates the panel to create a new website
             * @param   {string}    websiteKey  The websiteKey
             * @returns {Promise<void>}
             */
            this.openInstallWebsitePanel = async (websiteKey) => {
                // Assert that the create panel is in the dom
                if (!this.createPanelCreated) {
                    this.routing.navigateTo('/websites/create');
                    return;
                }

                // Fetch the website object
                const website = await this.data_controller.getWebsite(websiteKey);

                // Append modal html
                $.append(this.element, $.html(this.html.installWebsitePanel, {
                    domain: website.domain,
                    baseUrl: website.baseUrl
                }));

                // Add event for download
                const downloadButton = this.element.querySelector('#website-install-download');
                const nextButton = this.element.querySelector('#website-install-next');
                downloadButton.addEventListener('click', () => {
                    nextButton.classList.remove('button-disabled');
                });
            }

            /**
             * Closes all create/install panels
             * @returns {Promise<void>}
             */
            this.closePanels = async () => {
                try {
                    $.remove(this.element.querySelector('#website-create-panel'));
                } catch (e) {}
                try {
                    $.remove(this.element.querySelector('#website-install-panel'));
                } catch (e) {}
                this.createPanelCreated = false;
                this.installPanelCreated = false;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();