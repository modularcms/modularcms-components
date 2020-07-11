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
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "pageRendererUrl": "https://modularcms.github.io/modularcms-components/page_renderer/versions/ccm.page_renderer-1.0.0.js",
            "layout_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
            "theme_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
            "component_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
            "component_manager": ["ccm.component", "https://modularcms.github.io/modularcms-components/component_manager/versions/ccm.component_manager-4.0.0.js", ["ccm.get","https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js","component_manager"]],
            "component_submit_builder": ["ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.3.js", ["ccm.get","https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js","submit_builder"]]
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
                        let title = elem.parentElement.getAttribute('data-page-title');
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
                            if (confirm('Do you really want to delete the page with the title "' + title + '" (' + url + ')? This can\'t be undone.')) {
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
                        await this.openAddComponentModal(page, e.detail.addFunction, onDataChange, 'block');
                    };
                    window.addEventListener('pageRendererAddBlock', window.pageManagerAddBlockEventHandler);

                    // handle edit block config event
                    if (window.pageManagerEditBlockConfigEventHandler) {
                        window.removeEventListener('pageRendererEditBlockConfig', window.pageManagerEditBlockConfigEventHandler)
                    }
                    window.pageManagerEditBlockConfigEventHandler = async (e) => {
                        const zoneItem = e.detail.zoneItem;
                        let updateConfig = e.detail.updateConfig;
                        const builder = $.html(this.html.editComponentBuilder, {typeName: 'block'});

                        $.setContent(this.element.querySelector('#builder'), builder);
                        builder.querySelectorAll('.modal-close, .modal-bg').forEach(item => item.addEventListener('click', () => $.remove(modal)));

                        //Handle config change
                        let currentConfigHash = this.hash.md5(JSON.stringify(zoneItem.data.config));
                        let updateTheConfig = (value) => {
                            let configHash = this.hash.md5(JSON.stringify(value));
                            if (configHash != currentConfigHash) {
                                currentConfigHash = configHash;
                                updateConfig(value);
                                onDataChange();
                            }
                        }

                        let data = zoneItem.data.config;

                        let openJsonBuilder = async () => {
                            this.component_json_builder.data.json = data;
                            this.component_json_builder.onchange = (event) => {
                                // handle json change
                                let value = event.instance.getValue();
                                if (value.valid) {
                                    data = value.json;
                                    updateTheConfig(data);
                                }
                            }
                            this.element.querySelector('#builder').classList.add('has-builder-content');
                            await this.component_json_builder.start();
                            $.setContent(this.element.querySelector('#edit-component-builder'), this.component_json_builder.root);
                        }

                        let openSubmitBuilder = async () => {
                            this.element.querySelector('#builder').classList.add('has-builder-content');
                            await this.component_submit_builder.start({
                                root: this.element.querySelector('#edit-component-builder'),
                                entries: [
                                    {
                                        "label": "Columns count",
                                        "name": "columns",
                                        "type": "number",
                                        "info": "The count of columns",
                                        "min": 1,
                                        "max": 4
                                    },
                                    {
                                        "label": "Split of the two columns",
                                        "name": "range",
                                        "type": "range",
                                        "min": 1,
                                        "max": 3,
                                        "info": "The split"
                                    }
                                ],
                                data: data,
                                onchange: e => {
                                    data = e.instance.getValue();
                                    updateTheConfig(data);
                                }
                            });
                        }

                        this.element.querySelectorAll('#builder .edit-menu .menu-item').forEach((item) => {
                            item.addEventListener('click', () => {
                                this.element.querySelectorAll('#builder .edit-menu .menu-item').forEach(i => i.classList.remove('active'));
                                item.classList.add('active');
                                let action = item.getAttribute('data-builder');
                                if (action == 'submit_builder') {
                                    openSubmitBuilder();
                                } else {
                                    openJsonBuilder();
                                }
                            });
                        });

                        openSubmitBuilder();

                        // Handle close
                        let hideHandler = () => {
                            $.remove(builder);
                            this.element.querySelector('#builder').classList.remove('has-builder-content');
                            pageRenderer.root.removeEventListener('mouseup', hideHandler);
                        }
                        pageRenderer.root.addEventListener('mouseup', hideHandler);
                    };
                    window.addEventListener('pageRendererEditBlockConfig', window.pageManagerEditBlockConfigEventHandler);

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
                        await this.openAddComponentModal(page, e.detail.addThemeDefinition, onDataChange, 'contentComponent');
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
                        await pageRenderer.update();
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
                            pageSet.contentZones.layout[0].data.config = this.layout_json_builder.getValue().json;
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
                    this.layout_json_builder.data = {json: page.contentZones.layout[0].data.config};
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

            this.openDMSModal = async () => {
                $.append(this.element, $.html(this.html.dmsComponentModal, {}));
                await this.component_manager.start();
                console.log(this.component_manager);
                $.setContent(this.element.querySelector('#component-manager-wrapper'), this.component_manager.root);
            }

            this.openAddComponentModal = async (page, addFunction, onDataChange, type) => {
                const modal = $.html(this.html.addComponentModal, {typeName: type});
                $.append(this.element, modal);
                await this.loadAllThemeBlockDefinitions('#add-component-grid-modal', page.themeKey, type);
                modal.querySelectorAll('.modal-close, .modal-bg').forEach(item => item.addEventListener('click', () => $.remove(modal)));

                //Add events for page theme definition list select
                let selectedThemeDefinitionKey = null;
                this.element.querySelectorAll('#add-component-grid-modal .list-item').forEach(elem => elem.addEventListener('click', () => {
                    let previousSelectedElement = this.element.querySelector('#add-component-grid-modal .list-item.selected');
                    previousSelectedElement && previousSelectedElement.classList.remove('selected');
                    elem.classList.add('selected');
                    selectedThemeDefinitionKey = elem.getAttribute('data-theme-definition-key');

                    // Enable button
                    enableSelectButton();
                }));

                const selectButton = this.element.querySelector('#add-component-modal-select-button');
                selectButton.addEventListener('click', () => {
                    try {
                        addFunction(selectedThemeDefinitionKey);
                        $.remove(modal);
                        onDataChange();
                    } catch (e) {
                        alert('There\'s something wrong with your selected ccm component! An error occured on embedding the component. Please check the following error message:\n' + e.message)
                    }
                });

                let enableSelectButton = () => {
                    selectButton.classList.remove('button-disabled')
                }

                // Add search
                await this.initSearch('#add-component-modal-list-search', '#add-component-grid-modal')
            };

            /**
             * Loads all themes
             * @param {string}  target                  Target element
             * @param {boolean} showThemeDefinitions    Should the layouts be loaded? defaults to true
             * @returns {Promise<void>}
             */
            this.loadAllThemeBlockDefinitions = async (target, themeKey, type = 'block') => {
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
                        item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
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
                    const getPageListItemElement = async (page, depth = 0) => {
                        let pageUrl = await this.data_controller.getFullPageUrl(websiteKey, page.pageKey);
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
                    const addPageListItem = async (page, element, depth = 0) => {
                        let item = await getPageListItemElement(page, depth);
                        $.append(element, item);
                        return item;
                    };

                    // Closure to load page children
                    const loadPageChildren = async (pageKey, element, depth = 0) => {
                        // Get children of page
                        let pages = await this.data_controller.getPageChildren(websiteKey, pageKey);
                        pages.sort((a, b) => {
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
                        for (let page of pages) {
                            const item = await addPageListItem(page, childrenWrapper, depth + 1);
                            await loadPageChildren(page.pageKey, item, depth + 1);
                        }
                    }

                    // Get page with url mapping '/'
                    const entryPage = await this.data_controller.getPageByUrl(websiteKey, '/');

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