/**
 * @overview ccm component that manages the pages for the backend
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'page_manager',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        config: {
            "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/page_manager/resources/html/page_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/page_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.min.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "pageRendererUrl": "https://modularcms.github.io/modularcms-components/page_renderer/versions/ccm.page_renderer-1.0.0.js",
            "layout_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
            "theme_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
            "component_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
            "js": [ "ccm.load", {"context": "head", "url": "https://widget.cloudinary.com/v2.0/global/all.js"} ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.modalCreated = false;

            /**
             * Starts the component
             * @returns {Promise<void>}
             */
            this.start = async () => {
                // Add routing
                await this.routing.registerRoutingCallback(async (detail) => {
                    if (detail.url.indexOf('/pages/create') == 0) {
                        if (!this.modalCreated) {
                            this.modalCreated = true;
                            await this.openCreateNewPageModal();
                        }
                        if (detail.url == '/pages/create/1') {
                            this.element.querySelector('#create-modal-step-2').style.display = 'none';
                            this.element.querySelector('#create-modal-step-1').style.display = 'flex';
                        }
                        if (detail.url == '/pages/create/2') {
                            this.element.querySelector('#create-modal-step-1').style.display = 'none';
                            this.element.querySelector('#create-modal-step-2').style.display = 'flex';
                        }
                    } else if (detail.url.indexOf('/pages/edit/') == 0) {
                        // Close modal
                        await this.closeCreateNewPageModal();

                        await this.renderEdit(detail.urlParts[2]);

                    } else if (detail.url.indexOf('/pages') == 0) {
                        await this.renderMain();
                    }
                }, this.index);
            };

            /**
             * Renders the main page list content
             * @returns {Promise<void>}
             */
            this.renderMain = async () => {
                $.setContent(this.element, $.html(this.html.main, {}));

                // Add search
                this.initSearch('#list-search', '#list');

                // Add click event for create button
                this.element.querySelector('#create-button').addEventListener('click', () => {
                    this.routing.navigateTo('/pages/create/1');
                });

                // Close modal
                await this.closeCreateNewPageModal();

                // load page selection
                await this.loadAllPages('#list');

                // add click events for list
                this.element.querySelectorAll('#list .list-item').forEach(elem => {
                    elem.addEventListener('click', () => {
                        let pageKey = elem.getAttribute('data-page-key');
                        this.routing.navigateTo('/pages/edit/' + pageKey);
                    });
                });

                // add more buttons
                this.element.querySelectorAll('#list .list-item-more-button').forEach(elem => {
                    let showingDelete = false;
                    elem.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        let pageKey = elem.parentElement.getAttribute('data-page-key');
                        let title = elem.parentElement.getAttribute('data-title');
                        let url = elem.parentElement.getAttribute('data-page-path');

                        if (!showingDelete) {
                            showingDelete = true;
                            elem.src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/trash-icon.svg';
                            elem.style.filter = 'invert(19%) sepia(100%) saturate(2779%) hue-rotate(354deg) brightness(94%) contrast(95%)';
                            setTimeout(() => {
                                showingDelete = false;
                                elem.src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/more-icon.svg';
                                elem.style.filter = 'none';
                            }, 3000);
                        } else if (url == '/') {
                            alert('The entry page can not be deleted!');
                        } else {
                            //delete page
                            if (confirm('Do you really want to delete the page with the title "' + title + '" (' + url + ') and all of its subordinated pages and contents ? This can\'t be undone.')) {
                                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                                elem.style.pointerEvents = 'none';
                                elem.style.opacity = '0.5';
                                await this.data_controller.removePage(websiteKey, pageKey);
                                $.remove(elem.parentElement.parentElement);
                            }
                        }
                    });
                });
            };

            /**
             * Renders the edit page for a page
             * @param   {string}    pageKey The page key
             * @returns {Promise<void>}
             */
            this.renderEdit = async (pageKey) => {
                const loader = $.html(this.html.loader, {});
                $.append(this.element.querySelector('.edit-container'), loader);

                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                const page = await this.data_controller.getPage(websiteKey, pageKey);

                if (page != null) {
                    /*let parentPageUrl = '';
                    if (page.parentKey) {
                        parentPageUrl = await this.data_controller.getFullPageUrl(websiteKey, page.parentKey);
                    }*/

                    const content = $.html(this.html.editPage, {
                        title: page.title,
                        urlPart: page.urlPart,
                        //parentUrl: parentPageUrl == '/' ? '' : parentPageUrl,
                        metaDescription: page.meta.description,
                        metaKeywords: page.meta.keywords,
                        metaRobots: page.meta.robots,
                        // menuShowIn: page.menu.showIn,
                        // menuTitle: page.menu.title,
                        // teaserTitle: page.teaser.title,
                        // teaserDescription: page.teaser.description
                    });
                    $.setContent(this.element, content);

                    // page preview
                    $.append(content.querySelector('#page-renderer-wrapper'), loader);
                    const pageRenderer = await this.ccm.start(this.pageRendererUrl, {
                        root: content.querySelector('#page-renderer-wrapper'),
                        websiteKey: websiteKey,
                        page: page,
                        parent: this,
                        edit: true
                    });

                    //define inputs and buttons
                    const form = this.element.querySelector('#page-edit-form');
                    const titleInput = this.element.querySelector('#edit-page-title');
                    const urlPartInput = this.element.querySelector('#edit-page-url-part');
                    const metaDescriptionInput = this.element.querySelector('#edit-page-meta-description');
                    const metaKeywordsInput = this.element.querySelector('#edit-page-meta-keywords');
                    const metaRobotsInput = this.element.querySelector('#edit-page-meta-robots');
                    const layoutSelect = this.element.querySelector('#edit-page-layout-select');
                    const saveButton = this.element.querySelector('#save-button');
                    const publishButton = this.element.querySelector('#publish-button');
                    const onDataChange = () => {
                        saveButton.classList.remove('button-disabled');
                        publishButton.classList.add('button-disabled');
                    };

                    // handle add block event
                    if (window.pageManagerAddBlockEventHandler) {
                        window.removeEventListener('pageRendererAddBlock', window.pageManagerAddBlockEventHandler)
                    }
                    window.pageManagerAddBlockEventHandler = async (e) => {
                        await this.openAddComponentModal(page, e.detail.addThemeDefinitionFunction, e.detail.addDmsContentComponentFunction, onDataChange, 'block');
                    };
                    window.addEventListener('pageRendererAddBlock', window.pageManagerAddBlockEventHandler);

                    // handle edit block config event
                    if (window.pageManagerEditBlockConfigEventHandler) {
                        window.removeEventListener('pageRendererEditBlockConfig', window.pageManagerEditBlockConfigEventHandler)
                    }
                    window.pageManagerEditBlockConfigEventHandler = async (e) => {
                        let component_submit_builder_instance = null;
                        let zoneItem = e.detail.zoneItem;
                        let updateConfig = e.detail.updateConfig;
                        const builder = $.html(this.html.editComponentBuilder, {typeName: 'block'});

                        $.setContent(this.element.querySelector('#builder'), builder);
                        builder.querySelectorAll('.modal-close, .modal-bg').forEach(item => item.addEventListener('click', () => $.remove(modal)));


                        let openJsonBuilder = async (zoneItem, updateConfig) => {
                            this.component_json_builder.data.json = zoneItem.data.ignore.config;
                            this.component_json_builder.onchange = (event) => {
                                // handle json change
                                let value = event.instance.getValue();
                                if (value.valid) {
                                    updateConfig(value.json);
                                    onDataChange();
                                }
                            }
                            this.element.querySelector('#builder').classList.add('has-builder-content');
                            await this.component_json_builder.start();
                            $.setContent(this.element.querySelector('#edit-component-builder'), this.component_json_builder.root);
                        }

                        let openSubmitBuilder = async (zoneItem, updateConfig) => {
                            this.element.querySelector('#builder').classList.add('has-builder-content');
                            let component_submit_builder = await this.ccm.component(themeDefinition.ccmBuilder.url, themeDefinition.ccmBuilder.config);
                            let div = document.createElement('div');
                            component_submit_builder_instance = await component_submit_builder.start({
                                data: zoneItem.data.ignore.config !== undefined ? $.clone(zoneItem.data.ignore.config) : {},
                                onchange: e => {
                                    let config = e.instance !== undefined ? e.instance.getValue() : (e.getValue !== undefined ? e.getValue() : console.error('Could not update'));
                                    if (config.imageSrc !== undefined && typeof config.imageSrc != 'string') {
                                        delete config.imageSrc;
                                    }
                                    updateConfig(config);
                                    onDataChange();
                                }
                            });
                            $.setContent(this.element.querySelector('#edit-component-builder'), component_submit_builder_instance.root);
                        }

                        let builderMenu = this.element.querySelector('#builder .edit-menu');
                        let builderMenuJsonItem = this.element.querySelector('#builder .edit-menu .menu-item[data-builder="json_builder"]');
                        let builderMenuItem = $.html(this.html.editComponentBuilderItem, {title: builder.title});
                        builderMenuItem.addEventListener('click', () => {
                            this.element.querySelectorAll('#builder .edit-menu .menu-item').forEach(i => i.classList.remove('active'));
                            builderMenuItem.classList.add('active');
                            openBuilder(builder, $.clone(appConfig), updateConfig);
                        })
                        builderMenu.insertBefore(builderMenuItem, builderMenuJsonItem);

                        let themeDefinition = await this.data_controller.getThemeDefinition(websiteKey, page.themeKey, zoneItem.data.themeDefinitionKey);
                        if (themeDefinition.ccmBuilder !== undefined && themeDefinition.ccmBuilder.url != null) {
                            let builderMenuItem = $.html(this.html.editComponentBuilderItem, {title: builder.title});
                            builderMenuItem.addEventListener('click', () => {
                                this.element.querySelectorAll('#builder .edit-menu .menu-item').forEach(i => i.classList.remove('active'));
                                builderMenuItem.classList.add('active');
                                openJsonBuilder(zoneItem, updateConfig);
                            })
                            builderMenu.insertBefore(builderMenuItem, builderMenuJsonItem);
                            builderMenuItem.classList.add('active');
                            await openSubmitBuilder(zoneItem, updateConfig);
                        } else {
                            builderMenuJsonItem.classList.add('active');
                            await openJsonBuilder(zoneItem, updateConfig);
                        }

                        // Handle close
                        let hideHandler = () => {
                            if (component_submit_builder_instance != null) {
                                component_submit_builder_instance.onchange = () => {};
                                $.remove(component_submit_builder_instance)
                            }
                            $.remove(builder);
                            this.element.querySelector('#builder').classList.remove('has-builder-content');
                            pageRenderer.root.removeEventListener('click', hideHandler);
                        }
                        pageRenderer.root.addEventListener('click', hideHandler);
                    };
                    window.addEventListener('pageRendererEditBlockConfig', window.pageManagerEditBlockConfigEventHandler);

                    // Handle page render edit ccm component
                    if (window.pageManagerEditCcmComponentConfigEventHandler) {
                        window.removeEventListener('pageRendererEditCcmComponentConfig', window.pageManagerEditCcmComponentConfigEventHandler)
                    }
                    window.pageManagerEditCcmComponentConfigEventHandler = async (e) => {
                        let zoneItem = e.detail.zoneItem;
                        let updateConfig = e.detail.updateCcmComponent;
                        const builder = $.html(this.html.editComponentBuilder, {typeName: 'block'});

                        // get app
                        const appPath = zoneItem.data.url;
                        const appStore = await this.ccm.store(zoneItem.data.ignore.config[1])
                        const appConfig = await appStore.get(zoneItem.data.ignore.config[2]);

                        // get builders
                        const appMeta = await $.action($.clone(appConfig.meta));
                        const appBuilders = appMeta.ignore.builders;

                        $.setContent(this.element.querySelector('#builder'), builder);
                        builder.querySelectorAll('.modal-close, .modal-bg').forEach(item => item.addEventListener('click', () => $.remove(modal)));

                        let component_builder_instance = null;

                        let openJsonBuilder = async (appConfig, updateConfig) => {
                            this.component_json_builder.data.json = appConfig;
                            this.component_json_builder.onchange = async (event) => {
                                // handle json change
                                let value = event.instance.getValue();
                                if (value.valid) {
                                    let config = value.json;
                                    let appConfigSet = await this.data_controller.createWebsiteApp(websiteKey, appPath, config, appConfig.meta);
                                    updateConfig(appConfigSet);
                                    onDataChange();
                                }
                            }
                            this.element.querySelector('#builder').classList.add('has-builder-content');
                            await this.component_json_builder.start();
                            $.setContent(this.element.querySelector('#edit-component-builder'), this.component_json_builder.root);
                        }

                        let openBuilder = async (builder, appConfig, updateConfig) => {
                            this.element.querySelector('#builder').classList.add('has-builder-content');
                            let component_builder = await $.action(builder.app);
                            let component_builder_instance = await component_builder.start({
                                root: this.element.querySelector('#edit-component-builder'),
                                data: {
                                    store: [ 'ccm.store', { app: await $.dataset(appConfig) } ],
                                    key: 'app'
                                },
                                onchange: async e => {
                                    console.log(appConfig);
                                    let config = Object.assign({}, appConfig, e.instance.getValue !== undefined ? e.instance.getValue() : console.error('Could not update'));
                                    // previewConfig(configSet);
                                    let appConfigSet = await this.data_controller.createWebsiteApp(websiteKey, appPath, config, appConfig.meta);
                                    updateConfig(appConfigSet);
                                    onDataChange();
                                }
                            });
                        }

                        let builderMenu = this.element.querySelector('#builder .edit-menu');
                        let builderMenuJsonItem = this.element.querySelector('#builder .edit-menu .menu-item[data-builder="json_builder"]');
                        for (let builder of appBuilders) {
                            let builderMenuItem = $.html(this.html.editComponentBuilderItem, {title: builder.title});
                            builderMenuItem.addEventListener('click', () => {
                                this.element.querySelectorAll('#builder .edit-menu .menu-item').forEach(i => i.classList.remove('active'));
                                builderMenuItem.classList.add('active');
                                openBuilder(builder, $.clone(appConfig), updateConfig);
                            })
                            builderMenu.insertBefore(builderMenuItem, builderMenuJsonItem);
                        }
                        builderMenuJsonItem.addEventListener('click', () => {
                            this.element.querySelectorAll('#builder .edit-menu .menu-item').forEach(i => i.classList.remove('active'));
                            builderMenuJsonItem.classList.add('active');
                            openJsonBuilder($.clone(appConfig), updateConfig);
                        })

                        if (appBuilders.length > 0) {
                            builderMenu.children[0].classList.add('active');
                            await openBuilder(appBuilders[0], $.clone(appConfig), updateConfig);
                        } else {
                            builderMenuJsonItem.classList.add('active');
                            await openJsonBuilder($.clone(appConfig), updateConfig);
                        }

                        // Handle close
                        let hideHandler = () => {
                            if (component_builder_instance != null) {
                                component_builder_instance.onchange = () => {};
                                $.remove(component_builder_instance)
                            }
                            $.remove(builder);
                            this.element.querySelector('#builder').classList.remove('has-builder-content');
                            pageRenderer.root.removeEventListener('click', hideHandler);
                        }
                        pageRenderer.root.addEventListener('click', hideHandler);
                    };
                    window.addEventListener('pageRendererEditCcmComponentConfig', window.pageManagerEditCcmComponentConfigEventHandler);

                    // handle remove block config event
                    if (window.pageManagerRemoveBlockEventHandler) {
                        window.removeEventListener('pageRendererRemoveBlock', window.pageManagerRemoveBlockEventHandler)
                    }
                    window.pageManagerRemoveBlockEventHandler = async (e) => {
                        onDataChange();
                    };
                    window.addEventListener('pageRendererRemoveBlock', window.pageManagerRemoveBlockEventHandler);

                    // handle add component event
                    if (window.pageManagerAddComponentEventHandler) {
                        window.removeEventListener('pageRendererAddComponent', window.pageManagerAddComponentEventHandler)
                    }
                    window.pageManagerAddComponentEventHandler = async (e) => {
                        await this.openAddComponentModal(page, e.detail.addThemeDefinitionFunction, e.detail.addDmsContentComponentFunction, onDataChange, 'contentComponent');
                    };
                    window.addEventListener('pageRendererAddComponent', window.pageManagerAddComponentEventHandler);

                    //handle content switcher
                    let editMenuItems = this.element.querySelectorAll('.edit-menu .menu-item');
                    editMenuItems.forEach(item => item.addEventListener('click', () => {
                        editMenuItems.forEach(item => item.classList.remove('active'));
                        item.classList.add('active');
                        this.element.querySelectorAll('.edit-content').forEach(item => item.classList.remove('active'));
                        this.element.querySelector('.edit-content[data-content-name="' + item.getAttribute('data-content-name') + '"]').classList.add('active');
                    }));

                    // make sure url part begins with a slash
                    /*urlPartInput.addEventListener('keyup', () => {
                        if (urlPartInput.value.indexOf('/') != 0) {
                            urlPartInput.value = '/' + urlPartInput.value;
                        }
                    });*/

                    // make sure meta description is a one liner
                    metaDescriptionInput.addEventListener('keyup', () => {
                        metaDescriptionInput.value = metaDescriptionInput.value.replace(/(?:\r\n|\r|\n)/g, '');
                    });

                    // handle title change
                    titleInput.addEventListener('change', async () => {
                        page.title = titleInput.value;
                        Object.assign(pageRenderer.page, page);
                        await pageRenderer.start();
                    });

                    // handle layout change
                    layoutSelect.addEventListener('change', async () => {
                        this.element.querySelector('#builder').innerHTML = '';
                        this.element.querySelector('#builder').classList.remove('has-builder-content')
                        page.themeKey = layoutSelect.querySelector('option[value="' + layoutSelect.value + '"]').getAttribute('data-theme-key');
                        page.contentZones = pageRenderer.getContentZones();
                        page.contentZones.layout[0].data.themeDefinitionKey = layoutSelect.value;
                        Object.assign(pageRenderer.page, page);
                        await pageRenderer.updateChildren();
                    });

                    // handle buttons
                    const publishedVersionEqual = await this.data_controller.isPagePublishedVersionEqual(websiteKey, pageKey);
                    if (!publishedVersionEqual) {
                        publishButton.classList.remove('button-disabled');
                    }
                    form.addEventListener('keyup', onDataChange);
                    form.addEventListener('change', onDataChange);
                    form.addEventListener('paste', onDataChange);
                    saveButton.addEventListener('click', async () => {
                        if (form.checkValidity() && this.theme_json_builder.isValid() && this.layout_json_builder.isValid()) {
                            saveButton.classList.add('button-disabled');
                            saveButton.querySelector('.button-text').innerHTML = 'Saving...';
                            page.contentZones = pageRenderer.getContentZones();
                            let pageSet = {};
                            Object.assign(pageSet, page, {
                                title: titleInput.value,
                                // urlPart: urlPartInput.value, TODO in data_controller
                                meta: {
                                    description: metaDescriptionInput.value,
                                    keywords: metaKeywordsInput.value,
                                    robots: metaRobotsInput.checked
                                },
                                themeConfig: this.theme_json_builder.getValue().json,
                                // contentZones
                                // themeKey
                            });
                            pageSet.contentZones.layout[0].data.ignore.config = this.layout_json_builder.getValue().json;
                            let end = () => {
                                saveButton.querySelector('.button-text').innerHTML = 'Saved';
                                saveButton.querySelector('.icon').src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/checkmark-icon.svg';
                                setTimeout(() => {
                                    saveButton.querySelector('.button-text').innerHTML = 'Save';
                                    saveButton.querySelector('.icon').src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/save-icon.svg';
                                }, 1500);
                            };
                            this.data_controller.setPageObject(websiteKey, pageKey, pageSet, 'Save page').then(() => {
                                end();
                                publishButton.classList.remove('button-disabled');
                            }).catch((errorMessage) => {
                                alert(errorMessage);
                                end();
                                saveButton.classList.remove('button-disabled');
                            });
                        } else {
                            alert('There is an error with your entered data. Please check the tabs for errors.');
                            form.reportValidity();
                        }
                    });
                    publishButton.addEventListener('click', async () => {
                        publishButton.classList.add('button-disabled');
                        publishButton.querySelector('.button-text').innerHTML = 'Publishing...';
                        let end = () => {
                            publishButton.querySelector('.button-text').innerHTML = 'Published';
                            publishButton.querySelector('.icon').src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/checkmark-icon.svg';
                            setTimeout(() => {
                                publishButton.querySelector('.button-text').innerHTML = 'Publish';
                                publishButton.querySelector('.icon').src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/megaphone-icon.svg';
                            }, 1500);
                        };
                        await this.data_controller.publishPage(websiteKey, pageKey, 'Publish page').then(() => {
                            end();
                        }).catch((errorMessage) => {
                            alert(errorMessage);
                            end();
                            publishButton.classList.remove('button-disabled');
                        });
                    });

                    // init layout select
                    await this.loadLayoutSelectOptions(websiteKey, layoutSelect, page.contentZones.layout[0].data.themeDefinitionKey);

                    // init layout config json_build
                    this.layout_json_builder.data = {json: page.contentZones.layout[0].data.ignore.config};
                    this.layout_json_builder.onchange = () => {onDataChange()};
                    await this.layout_json_builder.start();
                    $.setContent(this.element.querySelector('#edit-page-layout-config'), this.layout_json_builder.root);

                    // init layout config json_build
                    this.theme_json_builder.data = {json: page.themeConfig};
                    this.theme_json_builder.onchange = () => {onDataChange()};
                    await this.theme_json_builder.start();
                    $.setContent(this.element.querySelector('#edit-page-theme-config'), this.theme_json_builder.root);
                } else {
                    this.routing.navigateTo('/pages');
                }
            };

            this.openAddComponentModal = async (page, addThemeDefinitionFunction, addDmsContentComponentFunction, onDataChange, type) => {
                const modal = $.html(this.html.addComponentModal, {typeName: type == 'contentComponent' ? 'content component' : ''});
                $.append(this.element, modal);

                if (type == 'contentComponent') {
                    this.element.querySelectorAll('#add-component-grid-modal label').forEach(item => item.style.display = 'block');
                }

                await this.loadAllThemeBlockDefinitions('#add-system-component-grid-modal', page.themeKey, type);
                modal.querySelectorAll('.modal-close, .modal-bg').forEach(item => item.addEventListener('click', () => $.remove(modal)));

                await this.initSearch('#add-component-modal-list-search', '#add-system-component-grid-modal');

                let dmsComponents = [];

                if (type == 'contentComponent') {
                    // Add digital maker space components
                    let grid = this.element.querySelector('#add-dms-component-grid-modal');

                    let dmsComponentsDataStore = await this.ccm.store({name: 'dms-components', url: 'https://ccm2.inf.h-brs.de', parent: this});

                    let dmsComponentsGet = await dmsComponentsDataStore.get();

                    // filter by newest version
                    let newestDmsComponents = {};
                    for (let dmsComponent of dmsComponentsGet) {
                        let identifier = dmsComponent.identifier;
                        if (newestDmsComponents[identifier] === undefined || this.versionCompare(dmsComponent.version, newestDmsComponents[identifier].version) > 0) {
                            newestDmsComponents[identifier] = dmsComponent;
                        }
                    }

                    // remove blacklisted components
                    let blacklisted = ['app_collection'];
                    for (let identifier of blacklisted) {
                        if (newestDmsComponents[identifier] !== undefined) {
                            delete newestDmsComponents[identifier];
                        }
                    }

                    // create array
                    for (let identifier in newestDmsComponents) {
                        dmsComponents.push(newestDmsComponents[identifier]);
                    }

                    // sort by name
                    dmsComponents.sort((a, b) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    })

                    // filter all components with builder
                    dmsComponents = dmsComponents.filter(component => component.ignore.builders.length > 0);

                    // render items
                    let i = 0;
                    let div = document.createElement('div');
                    for (let dmsComponent of dmsComponents) {
                        let item = $.html(this.html.dmsComponentListItem, Object.assign({}, dmsComponent, {i:i++}));
                        $.append(div, item);
                    }
                    $.setContent(grid, div);

                    // Add search
                    await this.initSearch('#add-component-modal-list-search', '#add-dms-component-grid-modal');
                }

                //Add events for page theme definition list select
                let selectedThemeDefinitionKey = null;
                let selectedDmsComponent = null
                this.element.querySelectorAll('#add-component-grid-modal .list-item').forEach(elem => elem.addEventListener('click', () => {
                    let previousSelectedElement = this.element.querySelector('#add-component-grid-modal .list-item.selected');
                    previousSelectedElement && previousSelectedElement.classList.remove('selected');
                    elem.classList.add('selected');
                    if (elem.getAttribute('data-is-dms-component')) {
                        selectedThemeDefinitionKey = null;
                        selectedDmsComponent = dmsComponents.filter(item => item.identifier == elem.getAttribute('data-dms-component-identifier'))[0];
                    } else {
                        selectedThemeDefinitionKey = elem.getAttribute('data-theme-definition-key');
                        selectedDmsComponent = null;
                    }

                    // Enable button
                    enableSelectButton();
                }));

                const selectButton = this.element.querySelector('#add-component-modal-select-button');
                selectButton.addEventListener('click', () => {
                    try {
                        if (selectedThemeDefinitionKey != null) {
                            addThemeDefinitionFunction(selectedThemeDefinitionKey);
                            $.remove(modal);
                        } else if (selectedDmsComponent != null) {
                            this.openAddDmsComponentModal(addDmsContentComponentFunction, selectedDmsComponent, onDataChange);
                        }
                        onDataChange();
                    } catch (e) {
                        alert('There\'s something wrong with your selected ccm component! An error occured on embedding the component. Please check the following error message:\n' + e.message)
                    }
                });

                let enableSelectButton = () => {
                    selectButton.classList.remove('button-disabled')
                }
            };

            this.openAddDmsComponentModal = async (addDmsContentComponentFunction, selectedDmsComponent, onDataChange) => {
                let detailWrapper = this.element.querySelector('#add-component-detail-modal');
                let details = $.html(this.html.dmsComponentDetails, Object.assign({description: selectedDmsComponent.subject}, selectedDmsComponent));
                let demoSelect = details.querySelector('#add-component-demo-select');
                let demoPreviewWrapper = details.querySelector('#add-component-demo-wrapper');
                let createButton = this.element.querySelector('#modal-create-from-market');
                let demoPreviewDiv = details.querySelector('#add-component-demo-preview');

                this.element.querySelector('#add-component-modal-step-1').style.display = 'none';
                this.element.querySelector('#add-component-modal-step-2').style.display = 'flex';

                this.element.querySelector('#add-component-modal-step-2 .modal-back').addEventListener('click', () => {
                    this.element.querySelector('#add-component-modal-step-1').style.display = 'flex';
                    this.element.querySelector('#add-component-modal-step-2').style.display = 'none';
                })

                let demoPreview = null;
                let demoApp = null;

                // preview demo
                let previewDemo = async (i) => {
                    let div = document.createElement('div');
                    $.append(div, $.loading());
                    $.setContent(demoPreviewWrapper, div);
                    if (i >= 0 ) {
                        demoPreviewDiv.style.display = 'block';
                        demoApp = selectedDmsComponent.ignore.demos[i].app;
                        if (demoApp[0] == 'ccm.instance') {
                            demoPreview = await this.ccm.start(demoApp[1], await $.action($.clone(demoApp[2])));
                        }
                    } else {
                        demoApp = null;
                        demoPreview = await this.ccm.start(selectedDmsComponent.path);
                    }
                    $.setContent(div, demoPreview.root);
                }

                demoSelect.addEventListener('change', () => {
                    previewDemo(parseInt(demoSelect.value));
                })
                if (selectedDmsComponent.ignore.demos.length > 0) {
                    previewDemo(0);
                } else {
                    previewDemo(-1);
                }

                // Add demo select options
                let i = 0;
                for (let demo of selectedDmsComponent.ignore.demos) {
                    $.append(demoSelect, $.html(this.html.dmsComponentDemoSelectItem, Object.assign({}, demo, {i: i++})));
                }
                $.append(demoSelect, $.html(this.html.dmsComponentDemoNoneSelectItem, {}));

                $.setContent(detailWrapper, details);

                // handle create
                createButton.addEventListener('click', async () => {
                    createButton.classList.add('button-disabled');
                    createButton.querySelector('.button-text').innerText = 'Creating app instance...';
                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    let meta = ['ccm.get', {name: 'dms-components', url: 'https://ccm2.inf.h-brs.de'}, selectedDmsComponent.key]
                    let app = demoApp != null
                        ? await this.data_controller.createWebsiteAppFromDemo(websiteKey, selectedDmsComponent.path, demoApp, meta)
                        : await this.data_controller.createWebsiteAppEmpty(websiteKey, selectedDmsComponent.path, meta);
                    await addDmsContentComponentFunction(selectedDmsComponent.path, app);

                    onDataChange();

                    $.remove(this.element.querySelector('#add-component-modal'));
                });
            }

            /**
             * Compare tow version number
             * @param v1
             * @param v2
             * @param options
             * @returns {number}
             * @author Jon
             * @see copied from https://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
             */
            this.versionCompare = (v1, v2, options) => {
                var lexicographical = options && options.lexicographical,
                    zeroExtend = options && options.zeroExtend,
                    v1parts = v1.split('.'),
                    v2parts = v2.split('.');

                function isValidPart(x) {
                    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
                }

                if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                    return NaN;
                }

                if (zeroExtend) {
                    while (v1parts.length < v2parts.length) v1parts.push("0");
                    while (v2parts.length < v1parts.length) v2parts.push("0");
                }

                if (!lexicographical) {
                    v1parts = v1parts.map(Number);
                    v2parts = v2parts.map(Number);
                }

                for (var i = 0; i < v1parts.length; ++i) {
                    if (v2parts.length == i) {
                        return 1;
                    }

                    if (v1parts[i] == v2parts[i]) {
                        continue;
                    }
                    else if (v1parts[i] > v2parts[i]) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }

                if (v1parts.length != v2parts.length) {
                    return -1;
                }

                return 0;
            }

            /**
             * Loads all themes
             * @param {string}  target                  Target element
             * @param {boolean} showThemeDefinitions    Should the layouts be loaded? defaults to true
             * @param {boolean} showColors              Defines if background color are shown
             * @returns {Promise<void>}
             */
            this.loadAllThemeBlockDefinitions = async (target, themeKey, type = 'block', showColors = false) => {
                const list = this.element.querySelector(target);
                list.classList.add('loading');
                $.append(list, $.html(this.html.loader, {}));

                const websiteKey = await this.data_controller.getSelectedWebsiteKey();

                if (websiteKey != null) {
                    // Get users
                    const elementRoot = document.createElement('div');

                    //Load all theme definitions
                    let uniqueItemIndex = 0;

                    let themeDefinitions = await this.data_controller.getAllThemeDefinitionsOfTheme(websiteKey, themeKey);
                    themeDefinitions = themeDefinitions.filter(item => item.type == type);
                    themeDefinitions.sort((a, b) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    });
                    for (let themeDefinition of themeDefinitions) {
                        let itemWrapperLayout = $.html(this.html.themeDefinitionListItem, {
                            themeDefinitionType: themeDefinition.type,
                            themeDefinitionKey: themeDefinition.themeDefinitionKey,
                            themeDefinitionName: themeDefinition.name,
                            themeKey: themeKey
                        });
                        const item = itemWrapperLayout.querySelector('.list-item');
                        if (showColors) item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                        $.append(elementRoot, itemWrapperLayout);
                    }

                    $.setContent(list, elementRoot);
                } else {
                    list.innerHTML = '';
                }

                list.classList.remove('loading');
            }

            /**
             * Renders the theme Layout select input
             * @param websiteKey
             * @param layoutSelect
             * @param pageLayoutKey
             * @returns {Promise<void>}
             */
            this.loadLayoutSelectOptions = async (websiteKey, layoutSelect, pageLayoutKey) => {
                const websiteThemes = await this.data_controller.getAllThemesOfWebsite(websiteKey);
                websiteThemes.sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    }
                    if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                });

                // render theme layout select
                for (let theme of websiteThemes) {
                    let optGroup = document.createElement('optgroup');
                    optGroup.label = theme.name;

                    //Load all theme definitions
                    let themeDefinitions = await this.data_controller.getAllThemeDefinitionsOfTheme(websiteKey, theme.themeKey);
                    themeDefinitions = themeDefinitions.filter(item => item.type == 'layout');
                    themeDefinitions.sort((a, b) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    });
                    for (let themeDefinition of themeDefinitions) {
                        let option = document.createElement('option');
                        option.innerText = themeDefinition.name;
                        option.value = themeDefinition.themeDefinitionKey;
                        option.setAttribute('data-theme-key', theme.themeKey);
                        if (themeDefinition.themeDefinitionKey == pageLayoutKey) {
                            option.selected = true;
                        }
                        optGroup.appendChild(option);
                    }

                    // Append optGroup
                    layoutSelect.appendChild(optGroup);
                }
            };

            /**
             * Loads all Pages
             * @param {string}  target          Target element
             * @returns {Promise<void>}
             */
            this.loadAllPages = async (target) => {
                const list = this.element.querySelector(target);
                list.classList.add('loading');
                $.append(list, $.html(this.html.loader, {}));

                const websiteKey = await this.data_controller.getSelectedWebsiteKey();

                if (websiteKey != null) {
                    // get layout definitions
                    let themeLayoutNames = {};
                    const websiteThemes = await this.data_controller.getAllThemesOfWebsite(websiteKey);
                    for (let theme of websiteThemes) {
                        themeLayoutNames[theme.themeKey] = {};

                        // Load all theme definitions
                        let themeDefinitions = await this.data_controller.getAllThemeDefinitionsOfTheme(websiteKey, theme.themeKey);
                        themeDefinitions = themeDefinitions.filter(item => item.type == 'layout');
                        for (let themeDefinition of themeDefinitions) {
                            themeLayoutNames[theme.themeKey][themeDefinition.themeDefinitionKey] = themeDefinition.name;
                        }
                    }

                    let uniqueItemIndex = 0;
                    // Closure for adding a page item
                    const getPageListItemElement = async (page, depth = 0, parentUrl = '/') => {
                        let pageUrl = parentUrl == '/' ? page.urlPart : (parentUrl + page.urlPart);
                        const draft = !await this.data_controller.isPagePublishedVersionEqual(websiteKey, page.pageKey);
                        const layoutName = (themeLayoutNames[page.themeKey] != undefined && themeLayoutNames[page.themeKey][page.contentZones.layout[0].data.themeDefinitionKey] != undefined) ? themeLayoutNames[page.themeKey][page.contentZones.layout[0].data.themeDefinitionKey]: '!UNKNOWN LAYOUT!';
                        let itemWrapper = $.html(this.html.listItem, {
                            title: page.title,
                            urlName: pageUrl,
                            pageKey: page.pageKey,
                            layoutTypeName: layoutName,
                            draft: draft?'<span class="draft"> – Draft</span>':''
                        });
                        const item = itemWrapper.querySelector('.list-item');
                        item.style.paddingLeft = ((depth * 20) + 15) + 'px';
                        item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                        return itemWrapper;
                    };

                    // Closure for adding a page item
                    const addPageListItem = async (page, element, depth = 0, parentUrl = '/') => {
                        let item = await getPageListItemElement(page, depth, parentUrl);
                        $.append(element, item);
                        return item;
                    };

                    // Closure to load page children
                    const loadPageChildren = async (pageKey, element, depth = 0, parentUrl = '') => {
                        // Get children of page
                        let childPages = pages.filter(page => page.parentKey == pageKey);
                        childPages.sort((a, b) => {
                            if (a.title < b.title) {
                                return -1;
                            }
                            if (a.title > b.title) {
                                return 1;
                            }
                            return 0;
                        });

                        // Iterate through all children pages
                        const childrenWrapper = element.querySelector('.list-item-children');
                        for (let page of childPages) {
                            const item = await addPageListItem(page, childrenWrapper, depth + 1, parentUrl);
                            await loadPageChildren(page.pageKey, item, depth + 1, parentUrl + page.urlPart);
                        }
                    }

                    // Get page with url mapping '/'
                    const pages = await this.data_controller.getAllPagesOfWebsite(websiteKey);
                    const entryPage = pages.filter(page => page.parentKey == null)[0];

                    const entryElement = await getPageListItemElement(entryPage);
                    await loadPageChildren(entryPage.pageKey, entryElement);

                    $.setContent(list, entryElement);
                } else {
                    $.setContent(list, $.html(this.html.noWebsitePlaceholder, {}));
                }

                list.classList.remove('loading');
            }

            /**
             * Initiates the search handling
             * @param   {string}    targetSearchInput   the target search input descriptor
             * @param   {string}    targetList   the target list descriptor
             * @returns {Promise<void>}
             */
            this.initSearch = async (targetSearchInput, targetList) => {
                const listSearchInput = this.element.querySelector(targetSearchInput);
                listSearchInput.addEventListener('keyup', () => {
                    let searchTerms = listSearchInput.value.split(' ');
                    this.element.querySelectorAll(targetList + ' .list-item').forEach(elem => {
                        let title = elem.getAttribute('data-title');
                        let layoutType = elem.getAttribute('data-page-layout-type');
                        let pagePath = elem.getAttribute('data-page-path');

                        let allMatching = false;
                        for (let searchTerm of searchTerms) {
                            if (searchTerm == '' || (title && title.indexOf(searchTerm) >= 0) || (layoutType && layoutType.indexOf(searchTerm) >= 0) || (pagePath && pagePath.indexOf(searchTerm) >= 0)) {
                                allMatching = true;
                            } else {
                                allMatching = false;
                                break;
                            }
                        }

                        if (allMatching) {
                            elem.classList.remove('hidden');
                        } else {
                            elem.classList.add('hidden');
                        }
                    });
                });
            }

            /**
             * Creates the modal to create a new page
             * @returns {Promise<void>}
             */
            this.openCreateNewPageModal = async () => {
                let selectedParentPageKey = null;
                let selectedParentPagePath = null;

                const websiteKey = await this.data_controller.getSelectedWebsiteKey();

                // Append modal html
                $.append(this.element, $.html(this.html.newPageModal, {}));

                //Load page selection
                this.loadAllPages('#list-modal').then(() => {
                    //Add events for page parent list select
                    this.element.querySelectorAll('#list-modal .list-item').forEach(elem => elem.addEventListener('click', () => {
                        let previousSelectedElement = this.element.querySelector('#list-modal .list-item.selected');
                        previousSelectedElement && previousSelectedElement.classList.remove('selected');
                        elem.classList.add('selected');
                        selectedParentPageKey = elem.getAttribute('data-page-key');
                        selectedParentPagePath = (elem.getAttribute('data-page-path') == '/'?'':elem.getAttribute('data-page-path')) + '/';

                        // Enable button
                        enableSelectButton();
                    }));
                })

                // Add layout options
                const layoutSelect = this.element.querySelector('#modal-layout-select');
                await this.loadLayoutSelectOptions(websiteKey, layoutSelect, '');

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack('/pages');
                }));

                // Add events for back
                this.element.querySelectorAll('.modal-back').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                // Closure for enabling and disabling the select button
                const enableSelectButton = () => {
                    let target = '#modal-select-button';
                    if (selectedParentPageKey != null) {
                        this.element.querySelector(target).classList.remove('button-disabled');
                    } else {
                        this.element.querySelector(target).classList.add('button-disabled');
                    }
                }

                // Closure for enabling and disabling the create button
                const enableCreateButton = () => {
                    let target = '#modal-create-button';
                    let urlSplit = urlInput.value.split('/');
                    if (titleInput.value != '' && urlSplit[urlSplit.length - 1] != '-') {
                        this.element.querySelector(target).classList.remove('button-disabled');
                    } else {
                        this.element.querySelector(target).classList.add('button-disabled');
                    }
                }

                //Closure for urlEntryReplacements
                const generateUrl = (baseUrl, value) => {
                    let re = value.toLowerCase()
                        .replace(/[#?&/=+.*'{}()%$§"!;,:´`]+/g, '')
                        .replace(/ /g, '-')
                        .replace(/ä/g, 'ae')
                        .replace(/ü/g, 'ue')
                        .replace(/ö/g, 'oe')
                        .replace(/ß/g, 'ss');
                    if (re == '') {
                        re = '-';
                    }
                    return baseUrl + re;
                }

                // Add auto creation of url
                const titleInput = this.element.querySelector('#create-modal-page-title')
                titleInput.addEventListener('keyup', () => {
                    let value = titleInput.value;
                    let pageUrl = generateUrl(selectedParentPagePath, value);

                    this.element.querySelector('#create-modal-page-url').value = pageUrl;

                    // Enable button
                    enableCreateButton();
                });

                // Prevent the removal of the base url
                const urlInput = this.element.querySelector('#create-modal-page-url')
                urlInput.addEventListener('keyup', () => {
                    let inputSplit = urlInput.value.split('/');

                    let value = inputSplit[inputSplit.length - 1];
                    let pageUrl = generateUrl(selectedParentPagePath, value);

                    this.element.querySelector('#create-modal-page-url').value = pageUrl;

                    // Enable button
                    enableCreateButton();
                });

                // Add events for finish
                this.element.querySelector('#modal-select-button').addEventListener('click', () => {
                    this.element.querySelector('#create-modal-page-url').value = generateUrl(selectedParentPagePath, titleInput.value);
                    this.routing.navigateTo('/pages/create/2');
                });

                // Add events for finish
                this.element.querySelector('#modal-create-button').addEventListener('click', async () => {
                    this.element.querySelector('#create-modal-step-2').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#create-modal-step-2'), loader);
                    this.element.querySelector('#modal-create-button').classList.add('button-disabled');
                    this.element.querySelector('#modal-create-button .button-text').innerText = 'Creating page...';

                    const username = await this.data_controller.getCurrentWorkingUsername();
                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const pathSplit = this.element.querySelector('#create-modal-page-url').value.split('/');
                    const urlPart = '/' + pathSplit[pathSplit.length - 1];
                    const layoutDefinitionKey = layoutSelect.value;
                    const themeKey = this.element.querySelector('#modal-layout-select option[value="' + layoutDefinitionKey + '"]').getAttribute('data-theme-key');
                    this.data_controller.createPage(websiteKey, {
                        parentKey: selectedParentPageKey,
                        title: titleInput.value,
                        urlPart: urlPart,
                        meta: {
                            description: '',
                            keywords: '',
                            robots: true
                        },
                        themeKey: themeKey,
                        themeConfig: {},
                        contentZones: {
                            'layout': [
                                {
                                    'type': 'themeDefinition',
                                    'data': {
                                        'themeDefinitionType': 'layout',
                                        'themeDefinitionKey': layoutDefinitionKey,
                                        'config': {}
                                    },
                                    contentZones: {
                                        'main': []
                                    }
                                }
                            ]
                        },
                        changeLog: []
                    }).then((pageKey) => {
                        this.routing.navigateTo('/pages/edit/' + pageKey);
                    }).catch(() => {
                        // Error handling

                        $.remove(loader);
                        this.element.querySelector('#create-modal-step-2').classList.remove('loading');
                        this.element.querySelector('#modal-create-button').classList.remove('button-disabled');
                        this.element.querySelector('#modal-create-button .button-text').innerText = 'Create new page';

                        alert('This page url is already existing.');
                    })
                });

                // Add search
                await this.initSearch('#create-modal-list-search', '#list-modal');
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeCreateNewPageModal = async () => {
                $.remove(this.element.querySelector('#create-new-page-modal'));
                this.modalCreated = false;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();