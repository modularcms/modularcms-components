/**
 * @overview modularcms component that manages the websites
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'website_manager',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/website_manager/resources/html/website_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/website_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ]
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
                await this.routing.registerRoutingCallback(async (detail) => {
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
                    } else {
                        // Close modal
                        await this.closePanels();
                    }
                    if (detail.url == '/websites/manage') {
                        await this.openManageWebsiteModal();
                    } else {
                        await this.closeManageWebsiteModal();
                    }
                    if (detail.url.indexOf('/websites/edit/') == 0) {
                        await this.openEditWebsiteModal(detail.urlParts[2]);
                    } else {
                        await this.closeEditWebsiteModal();
                    }
                }, this.index);

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
                    const selectedWebsite = await this.data_controller.getWebsite(selectedWebsiteKey);
                    const username = await this.data_controller.getCurrentWorkingUsername();

                    let websites = await this.data_controller.getUserWebsites(username);
                    websites.sort((a, b) => {
                        if (a.domain < b.domain) {
                            return -1;
                        }
                        if (a.domain > b.domain) {
                            return 1;
                        }
                        return 0;
                    });

                    // Render select box
                    $.setContent(wrapper, $.html(this.html.selectBox, {
                        domain: selectedWebsite.domain
                    }));

                    // Add items to select list
                    const selectList = this.element.querySelector('#website-select-list');
                    for (let website of websites) {
                        const item = $.html(this.html.listItem, {
                            websiteKey: website.websiteKey,
                            domain: website.domain
                        });
                        $.append(selectList, item);

                        // Add selected class
                        if (website.websiteKey == selectedWebsite.websiteKey) {
                            item.classList.add('selected');
                        }

                        // Add event listener for item click
                        item.addEventListener('click', async () => {
                            const websiteKey = item.getAttribute('data-website-key');
                            await this.data_controller.setSelectedWebsiteKey(websiteKey);
                            await this.renderWebsiteSelect();
                            const event = new CustomEvent('selectedWebsiteChanged', {
                                detail: {
                                    websiteKey: websiteKey
                                }
                            });
                            window.dispatchEvent(event);
                        })
                    }
                } else {
                    // Render no website select box
                    $.setContent(wrapper, $.html(this.html.selectBox, {
                        domain: '-- No website existing --'
                    }));
                }
                const selectBox = this.element.querySelector('#website-select-box');
                selectBox.addEventListener('click', () => {
                    if (selectBox.classList.contains('list-open')) {
                        selectBox.classList.remove('list-open');
                    } else {
                        selectBox.classList.add('list-open');
                    }
                });
            }

            /**
             * Creates the panel to create a new website
             * @returns {Promise<void>}
             */
            this.openCreateWebsitePanel = async () => {
                // Append modal html
                const panel = $.html(this.html.createWebsitePanel, {});
                $.append(this.element, panel);

                // Add event for finish
                this.element.querySelector('#website-create-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    // Get values
                    const domain = this.element.querySelector('#website-create-domain').value;
                    const baseUrl = this.element.querySelector('#website-create-base-url').value;

                    // Show loader
                    this.element.querySelector('.panel-box').classList.add('loading');
                    $.setContent(this.element.querySelector('.panel-loader-wrapper'), $.html(this.html.loader, {}));

                    // Create the website
                    await this.data_controller.createWebsite(domain, baseUrl).then(async (websiteKey) => {
                        // Set the created website as the current working target website
                        await this.data_controller.setSelectedWebsiteKey(websiteKey);
                        await this.renderWebsiteSelect();
                        const event = new CustomEvent('selectedWebsiteChanged', {
                            detail: {
                                websiteKey: websiteKey
                            }
                        });
                        window.dispatchEvent(event);

                        // Navigate to install panel
                        this.routing.navigateTo('/websites/install/' + websiteKey);
                    }).catch(() => { // Error handling
                        // Hide loader
                        this.element.querySelector('.panel-box').classList.remove('loading');
                        this.element.querySelector('.panel-loader-wrapper').innerHTML = '';

                        // Show alert
                        $.setContent(panel.querySelector('.panel-alert-wrapper'), $.html(this.html.createError, {
                            text: 'This domain is already registered for modularcms.'
                        }));
                    });
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
                    await this.openCreateWebsitePanel();
                    this.createPanelCreated = true;
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

            let manageModal = false;
            /**
             * Opens the modal to manage websites
             * @returns {Promise<void>}
             */
            this.openManageWebsiteModal = async () => {
                if (!manageModal) {
                    manageModal = $.html(this.html.manageWebsitesModal, {});
                    $.append(this.element, manageModal);
                    manageModal.querySelectorAll('.modal-close, .modal-bg').forEach((elem) => elem.addEventListener('click', () => {
                        this.routing.navigateBack();
                    }));
                    manageModal.querySelector('#modal-create-button').addEventListener('click', () => {
                        this.routing.navigateTo('/websites/create');
                    })

                    // Load websites list
                    const list = this.element.querySelector('#list-modal');
                    list.classList.add('loading');
                    $.setContent(list, $.html(this.html.loader, {}));

                    let elementRoot = document.createElement('div');
                    const userWebsites = await this.data_controller.getUserAdminWebsites(await this.data_controller.getCurrentWorkingUsername());
                    userWebsites.sort((a, b) => {
                        if (a.domain < b.domain) {
                            return -1;
                        }
                        if (a.domain > b.domain) {
                            return 1;
                        }
                        return 0;
                    });
                    let uniqueItemIndex = 0;
                    for (let userWebsite of userWebsites) {
                        const element = $.html(this.html.manageListItem, {
                            websiteKey: userWebsite.websiteKey,
                            domain: userWebsite.domain,
                            baseUrl: userWebsite.baseUrl
                        });
                        element.querySelector('.list-item').classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                        $.append(elementRoot, element);

                        // Add edit click button event
                        element.querySelector('.list-item .list-item-more-button:nth-child(3)').addEventListener('click', () => {
                            const websiteKey = element.querySelector('.list-item').getAttribute('data-website-key');
                            this.routing.navigateTo('/websites/edit/' + websiteKey);
                        });

                        // Add install click button event
                        element.querySelector('.list-item .list-item-more-button:nth-child(4)').addEventListener('click', () => {
                            const websiteKey = element.querySelector('.list-item').getAttribute('data-website-key');
                            this.routing.navigateTo('/websites/install/' + websiteKey);
                        });

                        // Add remove click button event
                        element.querySelector('.list-item .list-item-more-button:nth-child(5)').addEventListener('click', async () => {
                            if(confirm('You\'re about to delete the website ' + userWebsite.domain + userWebsite.baseUrl + ' and all of its contents. This can not be undone. Are your sure you want to delete the website?')) {
                                const websiteKey = element.querySelector('.list-item').getAttribute('data-website-key');

                                manageModal.querySelector('#modal-create-button').classList.add('button-disabled');
                                manageModal.querySelector('#modal-create-button .button-text').innerText = 'Removing website...';
                                list.classList.add('loading');
                                $.setContent(list, $.html(this.html.loader, {}));

                                const selectedWebsiteKey = await this.data_controller.getSelectedWebsiteKey();
                                await this.data_controller.removeWebsite(websiteKey);
                                if (selectedWebsiteKey == websiteKey) {
                                    await this.data_controller.removeSelectedWebsiteKey();
                                }
                                this.routing.navigateTo('/pages');
                                await this.renderWebsiteSelect();
                                const event = new CustomEvent('selectedWebsiteChanged', {
                                    detail: {
                                        websiteKey: await this.data_controller.getSelectedWebsiteKey()
                                    }
                                });
                                window.dispatchEvent(event);
                            }
                        });
                    }
                    if (userWebsites.length == 0) {
                        // Show no websites info
                        elementRoot.innerText = 'There are no websites with admin priviliges yet to manage. You can create a first own website by clicking the button at the bottom.'
                    }

                    $.setContent(list, elementRoot);
                    list.classList.remove('loading');
                }
            };

            /**
             * closes the website manage modal
             */
            this.closeManageWebsiteModal = () => {
                if (manageModal) {
                    $.remove(manageModal);
                    manageModal = false;
                }
            };

            let editModal = false;
            /**
             * Opens the modal to manage websites
             * @param   {string}    websiteKey  The website key
             * @returns {Promise<void>}
             */
            this.openEditWebsiteModal = async (websiteKey) => {
                if (!editModal) {
                    editModal = $.html(this.html.editWebsitesModal, {});
                    $.append(this.element, editModal);
                    editModal.querySelectorAll('.modal-close, .modal-bg').forEach((elem) => elem.addEventListener('click', () => {
                        this.routing.navigateBack();
                        this.routing.navigateBack();
                    }));

                    editModal.querySelector('.modal-back').addEventListener('click', () => {
                        this.routing.navigateBack();
                    });

                    // Load website
                    editModal.querySelector('#edit-modal').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(editModal.querySelector('#edit-modal'), loader);

                    let website = await this.data_controller.getWebsite(websiteKey);
                    if (website != null) {
                        const domainInput = editModal.querySelector('#edit-modal-website-domain');
                        const baseUrlInput = editModal.querySelector('#edit-modal-website-base-url');
                        const saveButton = editModal.querySelector('#edit-modal-save-button');
                        const form = editModal.querySelector('#edit-modal-website-form');

                        domainInput.value = website.domain;
                        baseUrlInput.value = website.baseUrl;

                        form.addEventListener('submit', (e) => {
                            e.preventDefault();

                            saveButton.classList.add('button-disabled');
                            saveButton.value = 'Editing website...';

                            website.domain = domainInput.value;
                            website.baseUrl = baseUrlInput.value;
                            this.data_controller.setWebsiteObject(website.websiteKey, website).then(() => {
                                this.routing.navigateBack();
                            }).catch(() => {
                                alert('The given domain name is already registered.');
                                saveButton.classList.remove('button-disabled');
                                saveButton.value = 'Save';
                            });
                        });
                    } else {
                        alert('Website not found.');
                    }

                    $.remove(loader);
                    editModal.querySelector('#edit-modal').classList.remove('loading');
                }
            };

            /**
             * Closes the website edit modal
             */
            this.closeEditWebsiteModal = () => {
                if (editModal) {
                    $.remove(editModal);
                    editModal = false;
                }
            };
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();