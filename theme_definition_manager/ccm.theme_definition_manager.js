/**
 * @overview ccm component that manages the theme definitions (themes, layouts, block, components) for the backend
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'theme_definition_manager',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/theme_definition_manager/resources/html/theme_definition_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/theme_definition_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.min.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "userAvatarPlaceholder": "https://modularcms.github.io/modularcms-components/cms/resources/img/no-user-image.svg",
            "json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/theme_definition_manager/resources/resources.js", "json_builder" ] ],
            "json_builder_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/theme_definition_manager/resources/resources.js", "json_builder" ] ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.createModalCreated = false;
            this.importModalCreated = false;

            const themeDefinitionsTypeNames = {
                'theme': 'Theme',
                'layout': 'Layout',
                'block': 'Block',
                'contentComponent': 'Content component'
            }

            const themeDefinitionsTypeUrlTypes = {
                'theme': 'theme',
                'layout': 'layout',
                'block': 'block',
                'content-component': 'contentComponent'
            }

            /**
             * Starts the component
             * @returns {Promise<void>}
             */
            this.start = async () => {
                let editOpened = false;

                // Add routing
                await this.routing.registerRoutingCallback(async (detail) => {
                    // Make sure that user has the permissions
                    if (await this.data_controller.getUserWebsiteRole(await this.data_controller.getCurrentWorkingUsername(), await this.data_controller.getSelectedWebsiteKey()) != 'admin') {
                        this.routing.navigateTo('/pages');
                        return;
                    }

                    if (detail.url.indexOf('/theme-definitions/') == 0 && ['create', 'import'].indexOf(detail.urlParts[1]) >= 0 && detail.urlParts[2] !== undefined) {
                        let type = detail.urlParts[2];
                        let action = detail.urlParts[1];

                        if (detail.urlParts[1] == 'create') {
                            // Close modal
                            await this.closeImportThemeDefinitionModal();

                            if (this.createModalCreated != type) {
                                if (type == 'theme') {
                                    await this.closeCreateThemeModal();
                                    await this.openCreateThemeModal();
                                } else if (themeDefinitionsTypeUrlTypes[type] !== undefined) {
                                    await this.closeCreateThemeDefinitionModal();
                                    await this.openCreateThemeDefinitionModal(type, type.replace('-',' '));
                                }
                            }
                        } else {
                            // Close create modal
                            await this.closeCreateThemeDefinitionModal();

                            if (this.importModalCreated != type) {
                                if (type == 'theme') {
                                    await this.closeImportThemeModal();
                                    await this.openImportThemeModal();
                                } else if (themeDefinitionsTypeUrlTypes[type] !== undefined) {
                                    await this.closeImportThemeDefinitionModal();
                                    await this.openImportThemeDefinitionModal(type, type.replace('-',' '));
                                }
                            }
                        }

                        if (type != 'theme') {
                            if (detail.urlParts[3] == '2') {
                                this.element.querySelector('#' + action + '-modal-step-1').style.display = 'none';
                                this.element.querySelector('#' + action + '-modal-step-2').style.display = 'flex';
                            } else {
                                this.element.querySelector('#' + action + '-modal-step-1').style.display = 'flex';
                                this.element.querySelector('#' + action + '-modal-step-2').style.display = 'none';
                            }
                        }

                        editOpened = false;
                    } else if (detail.url.indexOf('/theme-definitions/edit/') == 0 && detail.urlParts[2] !== undefined && detail.urlParts[3] !== undefined) {
                        // Close create modal
                        await this.closeCreateThemeDefinitionModal();

                        // Close import modal
                        await this.closeImportThemeDefinitionModal();

                        if (!editOpened) {
                            editOpened = true;
                            const type = detail.urlParts[2];
                            const themeKey = detail.urlParts[3];
                            const themeDefinitionKey = detail.urlParts[4] !== undefined ? detail.urlParts[4] : null;
                            await this.renderEdit(themeKey, type, themeDefinitionKey);
                        }

                    } else if (detail.url.indexOf('/theme-definitions') == 0) {
                        // Close create modal
                        await this.closeCreateThemeDefinitionModal();

                        // Close import modal
                        await this.closeImportThemeDefinitionModal();

                        await this.renderMain();

                        editOpened = false;
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
                const createButton = this.element.querySelector('#create-button')
                createButton.addEventListener('click', () => {
                    createButton.classList.add('show-dropdown');
                });
                createButton.querySelectorAll('.button-dropdown-background, .button-dropdown-item').forEach((item) => item.addEventListener('click', (e) => {
                    if (item.classList.contains('button-dropdown-background')) {
                        e.stopPropagation();
                    }
                    createButton.classList.remove('show-dropdown');
                }));

                // Add click event for import button
                const importButton = this.element.querySelector('#import-button')
                importButton.addEventListener('click', () => {
                    importButton.classList.add('show-dropdown');
                });
                importButton.querySelectorAll('.button-dropdown-background, .button-dropdown-item').forEach((item) => item.addEventListener('click', (e) => {
                    if (item.classList.contains('button-dropdown-background')) {
                        e.stopPropagation();
                    }
                    importButton.classList.remove('show-dropdown');
                }));

                // Close modal
                await this.closeCreateThemeDefinitionModal();

                // load page selection
                await this.loadAllThemeDefinitions('#list');

                // add click events for list
                this.element.querySelectorAll('#list .list-item').forEach(elem => {
                    elem.addEventListener('click', () => {
                        let type = elem.getAttribute('data-type');
                        let themeKey = elem.getAttribute('data-theme-key');
                        if (type == 'theme') {
                            this.routing.navigateTo('/theme-definitions/edit/theme/' + themeKey);
                        } else {
                            let themeDefinitionKey = elem.getAttribute('data-theme-definition-key');
                            this.routing.navigateTo('/theme-definitions/edit/' + type + '/' + themeKey + '/' + themeDefinitionKey);
                        }
                    });
                });

                // add more buttons
                this.element.querySelectorAll('#list .list-item-more-button').forEach(elem => {
                    let showingDelete = false;
                    elem.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        let themeKey = elem.parentElement.getAttribute('data-theme-key');
                        let themeDefinitionKey = elem.parentElement.getAttribute('data-theme-definition-key');
                        let name = elem.parentElement.getAttribute('data-theme-name') || elem.parentElement.getAttribute('data-theme-definition-name');
                        let type = elem.parentElement.getAttribute('data-type');

                        if (!showingDelete) {
                            showingDelete = true;
                            elem.src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/trash-icon.svg';
                            elem.style.filter = 'invert(19%) sepia(100%) saturate(2779%) hue-rotate(354deg) brightness(94%) contrast(95%)';
                            setTimeout(() => {
                                showingDelete = false;
                                elem.src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/more-icon.svg';
                                elem.style.filter = 'none';
                            }, 3000);
                        } else {
                            //delete page
                            let conf = false;
                            if (type == 'theme') {
                                conf = confirm('Do you really want to remove the ' + themeDefinitionsTypeNames[type].toLowerCase() + ' "' + name + '" and all of its associated theme definitions?')
                            } else {
                                conf = confirm('Do you really want to remove the ' + themeDefinitionsTypeNames[type].toLowerCase() + ' "' + name + '"?')
                            }
                            if (conf) {
                                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                                elem.style.pointerEvents = 'none';
                                elem.style.opacity = '0.5';
                                if (type == 'theme') {
                                    await this.data_controller.removeTheme(websiteKey, themeKey);
                                } else {
                                    await this.data_controller.removeThemeDefinition(websiteKey, themeKey, themeDefinitionKey);
                                }
                                $.remove(elem.parentElement.parentElement);
                            }
                        }
                    });
                });
            };

            /**
             * Renders the edit page for a layout
             * @param   {string}        themeKey                The theme key
             * @param   {string}        type                    The definition type
             * @param   {string|null}   themeDefinitionKeyKey   The theme definition key
             * @returns {Promise<void>}
             */
            this.renderEdit = async (themeKey, type = 'theme', themeDefinitionKey = null) => {
                const loader = $.html(this.html.loader, {});
                $.append(this.element.querySelector('.edit-container'), loader);
                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                let theme = null;
                let themeDefinition = null;
                if (type == 'theme') {
                    theme = await this.data_controller.getTheme(websiteKey, themeKey, themeKey);
                } else {
                    themeDefinition = await this.data_controller.getThemeDefinition(websiteKey, themeKey, themeDefinitionKey);
                }

                if (theme != null || themeDefinition != null) {
                    let content = $.html(this.html.editThemeDefinition, {});

                    const nameInput = content.querySelector('#theme-definition-edit-name');
                    const ccmUrlInput = content.querySelector('#theme-definition-edit-ccm-component-url');
                    const ccmConfigWrapper = content.querySelector('#theme-definition-edit-ccm-component-config');
                    const ccmBuilderUrlInput = content.querySelector('#theme-definition-edit-ccm-builder-component-url');
                    const ccmBuilderConfigWrapper = content.querySelector('#theme-definition-edit-ccm-builder-component-config');

                    if (type == 'theme') {
                        nameInput.value = theme.name;
                        ccmUrlInput.value = theme.ccmComponent.url;
                        this.json_builder.data = {json: theme.ccmComponent.config};
                    } else {
                        nameInput.value = themeDefinition.name;
                        ccmUrlInput.value = themeDefinition.ccmComponent.url;
                        this.json_builder.data = {json: themeDefinition.ccmComponent.config};
                        ccmBuilderUrlInput.value = themeDefinition.ccmBuilder !== undefined ? (themeDefinition.ccmBuilder.url == null ? '' : themeDefinition.ccmBuilder.url) : '';
                        this.json_builder_builder.data = {json: themeDefinition.ccmBuilder !== undefined ? themeDefinition.ccmBuilder.config : {}};
                        await this.json_builder_builder.start();
                        $.setContent(ccmBuilderConfigWrapper, this.json_builder_builder.root, {});
                    }
                    await this.json_builder.start();
                    $.setContent(ccmConfigWrapper, this.json_builder.root, {});


                    $.setContent(this.element, content);

                    // event for export button
                    const exportButton = content.querySelector('#export-button');
                    exportButton.addEventListener('click', async () => {
                        exportButton.classList.add('button-disabled');
                        exportButton.querySelector('.button-text').innerHTML = 'Exporting...';

                        let exportObject = {};
                        if (type == 'theme') {
                            // Handle theme export
                            let themeExport = await this.data_controller.getTheme(websiteKey, themeKey);
                            delete themeExport['themeKey'];

                            // get theme definitions
                            let themeDefinitionExport = await this.data_controller.getAllThemeDefinitionsOfTheme(websiteKey, themeKey);
                            for (let themeDefinition of themeDefinitionExport) {
                                delete themeDefinition['themeDefinitionKey'];
                            }

                            // Assign to export object
                            Object.assign(exportObject, themeExport, {
                                type: 'theme',
                                themeDefinitions: themeDefinitionExport
                            });
                        } else {
                            // Handle theme definition export
                            let themeDefinitionExport = await this.data_controller.getThemeDefinition(websiteKey, themeKey, themeDefinitionKey);
                            delete themeDefinitionExport['themeDefinitionKey'];

                            // Assign to export object
                            Object.assign(exportObject, themeDefinitionExport);
                        }

                        await this.download(JSON.stringify(exportObject), 'application/json', type + '_' + (type == 'theme'?themeKey:themeDefinitionKey) + '.json');
                        exportButton.classList.remove('button-disabled');
                        exportButton.querySelector('.button-text').innerHTML = 'Export';
                    });

                    // event for save button
                    const form = this.element.querySelector('#theme-definition-edit-form');
                    const saveButton = content.querySelector('#save-button');
                    saveButton.addEventListener('click', async () => {
                        saveButton.classList.add('button-disabled');
                        saveButton.querySelector('.button-text').innerHTML = 'Saving...';

                        const name = nameInput.value;
                        const ccmUrl = ccmUrlInput.value;
                        const ccmConfig = this.json_builder.getValue().json;
                        const ccmBuilderUrl = ccmBuilderUrlInput.value == '' ? null : ccmBuilderUrlInput.value;
                        const ccmBuilderConfig = this.json_builder_builder.getValue().json;

                        let themeSet = {};
                        let themeDefinitionSet = {};
                        let overwriteObject = {
                            name: name,
                            ccmComponent: {
                                url: ccmUrl,
                                config: ccmConfig
                            },
                            ccmBuilder: {
                                url: ccmBuilderUrl,
                                config: ccmBuilderConfig
                            }
                        };
                        if (type == 'theme') {
                            // Assign theme values
                            Object.assign(themeSet, theme, overwriteObject);
                        } else {
                            // Assign theme definition values
                            Object.assign(themeDefinitionSet, themeDefinition, overwriteObject);
                        }

                        let end = () => {
                            $.remove(loader);
                            saveButton.classList.remove('button-disabled');
                            saveButton.querySelector('.button-text').innerHTML = 'Saved';
                            saveButton.querySelector('.icon').src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/checkmark-icon.svg';
                            setTimeout(() => {
                                saveButton.querySelector('.button-text').innerHTML = 'Save';
                                saveButton.querySelector('.icon').src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/save-icon.svg';
                            }, 1500);
                        };
                        if (form.checkValidity()) {
                            if (this.json_builder.isValid() && this.json_builder_builder.isValid()) {
                                if (type == 'theme') {
                                    // Assign theme values
                                    await this.data_controller.setThemeObject(websiteKey, themeKey, themeSet);
                                } else {
                                    // Assign theme definition values
                                    await this.data_controller.setThemeDefinitionObject(websiteKey, themeKey, themeDefinitionKey, themeDefinitionSet);
                                }
                                end();
                            } else {
                                end();
                                alert('Please check your entered ccm config json data!');
                            }
                        } else {
                            end();
                            form.reportValidity();
                        }
                    });
                } else {
                    this.routing.navigateTo('/theme-definitions');
                }
            };

            /**
             * Loads all themes
             * @param {string}  target                  Target element
             * @param {boolean} showThemeDefinitions    Should the layouts be loaded? defaults to true
             * @returns {Promise<void>}
             */
            this.loadAllThemeDefinitions = async (target, showThemeDefinitions = true) => {
                const list = this.element.querySelector(target);
                list.classList.add('loading');
                $.append(list, $.html(this.html.loader, {}));

                const websiteKey = await this.data_controller.getSelectedWebsiteKey();

                if (websiteKey != null) {
                    // Get users
                    const elementRoot = document.createElement('div');
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

                    let uniqueItemIndex = 0;
                    for (let theme of websiteThemes) {
                        let itemWrapperTheme = $.html(this.html.themeListItem, {
                            themeKey: theme.themeKey,
                            themeName: theme.name,
                            themeType: 'theme',
                            themeTypeName: themeDefinitionsTypeNames['theme']
                        });
                        const item = itemWrapperTheme.querySelector('.list-item');
                        item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                        $.append(elementRoot, itemWrapperTheme);

                        //Load all theme definitions
                        if (showThemeDefinitions) {
                            let themeDefinitions = await this.data_controller.getAllThemeDefinitionsOfTheme(websiteKey, theme.themeKey);
                            themeDefinitions.sort((a, b) => {
                                if (themeDefinitionsTypeNames[a.type] < themeDefinitionsTypeNames[b.type] && a.name < b.name) {
                                    return -1;
                                }
                                if (themeDefinitionsTypeNames[a.type] > themeDefinitionsTypeNames[b.type] && a.name > b.name) {
                                    return 1;
                                }
                                return 0;
                            });
                            for (let themeDefinition of themeDefinitions) {
                                let itemWrapperLayout = $.html(this.html.themeDefinitionListItem, {
                                    themeDefinitionType: themeDefinition.type,
                                    themeDefinitionTypeName: themeDefinitionsTypeNames[themeDefinition.type],
                                    themeDefinitionKey: themeDefinition.themeDefinitionKey,
                                    themeDefinitionName: themeDefinition.name,
                                    themeKey: theme.themeKey
                                });
                                const item = itemWrapperLayout.querySelector('.list-item');
                                item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                                item.style.paddingLeft = '35px';
                                $.append(itemWrapperTheme.querySelector('.list-item-children'), itemWrapperLayout);
                            }
                        }
                    }

                    $.setContent(list, elementRoot);
                } else {
                    list.innerHTML = '';
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
                        let themeDefinitionName = elem.getAttribute('data-theme-name') || elem.getAttribute('data-theme-definition-name');
                        let themeDefinitionType = elem.getAttribute('data-type');

                        let allMatching = false;
                        for (let searchTerm of searchTerms) {
                            if (searchTerm == '' || themeDefinitionName.indexOf(searchTerm) >= 0 || themeDefinitionsTypeNames[themeDefinitionType].indexOf(searchTerm) >= 0) {
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
             * Creates the modal to add a theme definition
             * @returns {Promise<void>}
             */
            this.openCreateThemeDefinitionModal = async (type, typeNameInsert) => {
                this.createModalCreated = type;
                // Append modal html
                $.append(this.element, $.html(this.html.createThemeDefinitionModal, {
                    type: type,
                    typeNameInsert: typeNameInsert
                }));
                this.json_builder.data = {json: {}};
                await this.json_builder.start();
                $.setContent(this.element.querySelector('#create-modal-theme-definition-ccm-component-config'), this.json_builder.root);

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack('/theme-definitions');
                }));

                // Add event for back button
                this.element.querySelectorAll('.modal-back').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                let selectedParentThemeKey = null;

                //Load page selection
                this.loadAllThemeDefinitions('#list-modal', false).then(() => {
                    //Add events for page parent list select
                    this.element.querySelectorAll('#list-modal .list-item').forEach(elem => elem.addEventListener('click', () => {
                        let previousSelectedElement = this.element.querySelector('#list-modal .list-item.selected');
                        previousSelectedElement && previousSelectedElement.classList.remove('selected');
                        elem.classList.add('selected');
                        selectedParentThemeKey = elem.getAttribute('data-theme-key');

                        // Enable button
                        enableSelectButton();
                    }));
                })

                // Closure for enabling and disabling the select button
                const enableSelectButton = () => {
                    let target = '#modal-select-button';
                    if (selectedParentThemeKey != null) {
                        this.element.querySelector(target).classList.remove('button-disabled');
                    } else {
                        this.element.querySelector(target).classList.add('button-disabled');
                    }
                }

                // Add events for finish
                this.element.querySelector('#modal-select-button').addEventListener('click', () => {
                    this.routing.navigateTo('/theme-definitions/create/' + type + '/2');
                });

                // Add events for finish
                this.element.querySelector('#modal-theme-definition-create-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    this.element.querySelector('#create-modal-step-2').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#create-modal-step-2'), loader);
                    const addButton = this.element.querySelector('#modal-create-button');
                    addButton.classList.add('button-disabled');
                    addButton.value = 'Creating layout...';

                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const layoutName = this.element.querySelector('#create-modal-theme-definition-name').value;
                    const ccmUrl = this.element.querySelector('#create-modal-theme-definition-ccm-component-url').value;
                    const ccmConfig = this.json_builder.getValue().json;

                    let error = () => {
                        $.remove(loader);
                        this.element.querySelector('#create-modal-step-2').classList.remove('loading');
                        addButton.classList.remove('button-disabled');
                        addButton.value = 'Create layout';
                    };
                    if (this.json_builder.isValid()) {
                        const layoutKey = await this.data_controller.createThemeDefinition(websiteKey, selectedParentThemeKey, {
                            type: themeDefinitionsTypeUrlTypes[type],
                            name: layoutName,
                            ccmComponent: {
                                url: ccmUrl,
                                config: ccmConfig
                            },
                            ccmBuilder: {
                                url: ccmUrl,
                                config: ccmConfig
                            }
                        });
                        this.routing.navigateTo('/theme-definitions/edit/' + type + '/' + selectedParentThemeKey + '/' + layoutKey);
                    } else {
                        error();
                        alert('Please enter a valid json config!');
                    }
                });

                // Add search
                await this.initSearch('#create-modal-list-search', '#list-modal');
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeCreateThemeDefinitionModal = async () => {
                $.remove(this.element.querySelector('#create-layout-modal'));
                this.createModalCreated = false;
            }

            /**
             * Function to download a string as a file
             * @param {string}  text        The file string
             * @param {string}  fileType    The file type
             * @param {string}  fileName    The file name
             * @returns {Promise<void>}
             */
            // This function was copied from: https://gist.github.com/danallison/3ec9d5314788b337b682
            this.download = async (text, fileType, fileName) => {
                let blob = new Blob([text], { type: fileType });

                let a = document.createElement('a');
                a.download = fileName;
                a.href = URL.createObjectURL(blob);
                a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
            }

            /**
             * Parses an input file object and checks the structure and construct a compressed version of the object
             * @param object
             * @param type
             * @returns {Promise<unknown>}
             */
            this.getImportFileObject = (object, type = null) => new Promise((resolve, reject) => {
                if (
                    ((type == null && object.type) || object.type === type)
                    && object.name !== undefined && typeof object.name == 'string'
                    && object.ccmComponent !== undefined && typeof object.ccmComponent == 'object'
                    && object.ccmComponent.url !== undefined && typeof object.ccmComponent.url == 'string'
                    && object.ccmComponent.config !== undefined && typeof object.ccmComponent.config == 'object'
                    && object.ccmBuilder !== undefined && typeof object.ccmBuilder == 'object'
                    && object.ccmBuilder.url !== undefined && typeof object.ccmBuilder.url == 'string'
                    && object.ccmBuilder.config !== undefined && typeof object.ccmBuilder.config == 'object'
                ) {
                    const re = {
                        name: object.name,
                        ccmComponent: object.ccmComponent,
                        ccmBuilder: object.ccmBuilder
                    };
                    if (type != 'theme') {
                        re.type = object.type;
                    }
                    resolve(re);
                } else {
                    reject();
                }
            });

            /**
             * Creates the modal to import a theme definition
             * @returns {Promise<void>}
             */
            this.openImportThemeDefinitionModal = async (type, typeNameInsert) => {
                this.importModalCreated = type;
                // Append modal html
                $.append(this.element, $.html(this.html.importThemeDefinitionModal, {
                    type: type,
                    typeNameInsert: typeNameInsert
                }));

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack('/theme-definitions');
                }));

                // Add event for back button
                this.element.querySelectorAll('.modal-back').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                let selectedParentThemeKey = null;

                //Load page selection
                this.loadAllThemeDefinitions('#import-list-modal', false).then(() => {
                    //Add events for page parent list select
                    this.element.querySelectorAll('#import-list-modal .list-item').forEach(elem => elem.addEventListener('click', () => {
                        let previousSelectedElement = this.element.querySelector('#import-list-modal .list-item.selected');
                        previousSelectedElement && previousSelectedElement.classList.remove('selected');
                        elem.classList.add('selected');
                        selectedParentThemeKey = elem.getAttribute('data-theme-key');

                        // Enable button
                        enableSelectButton();
                    }));
                })

                // Closure for enabling and disabling the select button
                const enableSelectButton = () => {
                    let target = '#modal-import-select-button';
                    if (selectedParentThemeKey != null) {
                        this.element.querySelector(target).classList.remove('button-disabled');
                    } else {
                        this.element.querySelector(target).classList.add('button-disabled');
                    }
                }

                // Add events for finish
                this.element.querySelector('#modal-import-select-button').addEventListener('click', () => {
                    this.routing.navigateTo('/theme-definitions/import/' + type + '/2');
                });

                // Add events for finish
                this.element.querySelector('#modal-theme-definition-import-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    this.element.querySelector('#import-modal-step-2').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#import-modal-step-2'), loader);
                    const addButton = this.element.querySelector('#modal-import-button');
                    addButton.classList.add('button-disabled');
                    addButton.value = 'Importing layout...';

                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const file = this.element.querySelector('#import-modal-theme-definition-file').files[0];

                    let error = () => {
                        $.remove(loader);
                        this.element.querySelector('#import-modal-step-2').classList.remove('loading');
                        addButton.classList.remove('button-disabled');
                        addButton.value = 'Import layout';
                    };

                    // read file
                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = async (e) => {
                        const fileContent = e.target.result;
                        const fileObject = JSON.parse(fileContent);

                        try {
                            const themeDefinition = await this.getImportFileObject(fileObject);

                            // create theme definition
                            const themeDefinitionKey = await this.data_controller.createThemeDefinition(websiteKey, selectedParentThemeKey, themeDefinition);

                            // open theme definition editor
                            this.routing.navigateTo('/theme-definitions/edit/' + type + '/' + selectedParentThemeKey + '/' + themeDefinitionKey);
                        } catch(e) {
                            error();
                            alert('Invalid file structure. Check the uploaded file.');
                        }
                    }
                    reader.onerror = (evt) => {
                        error();
                        alert('Error on reading file');
                    }
                });

                // Add search
                await this.initSearch('#import-modal-list-search', '#import-list-modal');
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeImportThemeDefinitionModal = async () => {
                $.remove(this.element.querySelector('#import-layout-modal'));
                this.importModalCreated = false;
            }

            /**
             * Creates the modal to create a theme
             * @returns {Promise<void>}
             */
            this.openCreateThemeModal = async () => {
                this.createModalCreated = 'theme';
                // Append modal html
                $.append(this.element, $.html(this.html.createThemeModal, {}));
                this.json_builder.data = {json: {}};
                await this.json_builder.start();
                $.setContent(this.element.querySelector('#create-modal-theme-ccm-component-config'), this.json_builder.root, {});

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                // Add events for finish
                this.element.querySelector('#modal-theme-create-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    this.element.querySelector('#create-modal-step-1').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#create-modal-step-1'), loader);
                    const addButton = this.element.querySelector('#modal-create-button');
                    addButton.classList.add('button-disabled');
                    addButton.value = 'Creating theme...';

                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const themeName = this.element.querySelector('#create-modal-theme-name').value;
                    const ccmUrl = this.element.querySelector('#create-modal-theme-ccm-component-url').value;
                    const ccmConfig = this.json_builder.getValue().json;

                    let error = () => {
                        $.remove(loader);
                        this.element.querySelector('#create-modal-step-1').classList.remove('loading');
                        addButton.classList.remove('button-disabled');
                        addButton.value = 'Create theme';
                    };
                    if (this.json_builder.isValid()) {
                        const themeKey = await this.data_controller.createTheme(websiteKey, {
                            name: themeName,
                            ccmComponent: {
                                url: ccmUrl,
                                config: ccmConfig
                            },
                            ccmBuilder: {
                                url: null,
                                config: {}
                            },
                            custom: null
                        });
                        this.routing.navigateTo('/theme-definitions/edit/theme/' + themeKey);
                    } else {
                        error();
                        alert('Please enter a valid json config!');
                    }
                })
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeCreateThemeModal = async () => {
                $.remove(this.element.querySelector('#create-theme-modal'));
                this.createModalCreated = false;
            }

            /**
             * Creates the modal to import a theme
             * @returns {Promise<void>}
             */
            this.openImportThemeModal = async () => {
                this.importModalCreated = 'theme';
                // Append modal html
                $.append(this.element, $.html(this.html.importThemeModal, {}));

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                // Add events for finish
                this.element.querySelector('#modal-theme-import-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    this.element.querySelector('#import-modal-step-1').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#import-modal-step-1'), loader);
                    const addButton = this.element.querySelector('#modal-import-button');
                    addButton.classList.add('button-disabled');
                    addButton.value = 'Importing theme...';

                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const file = this.element.querySelector('#import-modal-theme-file').files[0];

                    let error = () => {
                        $.remove(loader);
                        this.element.querySelector('#import-modal-step-1').classList.remove('loading');
                        addButton.classList.remove('button-disabled');
                        addButton.value = 'Import theme';
                    };

                    // read file
                    const reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = async (e) => {
                        const fileContent = e.target.result;
                        const fileObject = JSON.parse(fileContent);

                        try {
                            const theme = await this.getImportFileObject(fileObject, 'theme');
                            const themeDefinitions = [];
                            for (let themeDefinition of fileObject.themeDefinitions) {
                                themeDefinitions.push(await this.getImportFileObject(themeDefinition));
                            }

                            // create theme
                            const themeKey = await this.data_controller.createTheme(websiteKey, theme);

                            // create underlying theme definitions
                            for (let themeDefinition of themeDefinitions) {
                                await this.data_controller.createThemeDefinition(websiteKey, themeKey, themeDefinition);
                            }

                            // open theme editor
                            this.routing.navigateTo('/theme-definitions/edit/theme/' + themeKey);
                        } catch(e) {
                            error();
                            alert('Invalid file structure. Check the uploaded file.');
                        }
                    }
                    reader.onerror = (evt) => {
                        error();
                        alert('Error on reading file');
                    }
                })
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeImportThemeModal = async () => {
                $.remove(this.element.querySelector('#import-theme-modal'));
                this.importModalCreated = false;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();