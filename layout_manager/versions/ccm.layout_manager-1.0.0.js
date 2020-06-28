/**
 * @overview modularcms component that manages the layouts
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'layout_manager',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/layout_manager/resources/html/layout_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/theme_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "userAvatarPlaceholder": "https://modularcms.github.io/modularcms-components/cms/resources/img/no-user-image.svg",
            "json_builder": [ "ccm.start", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/theme_manager/resources/resources.js", "json_builder" ] ]
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
                    if (detail.url.indexOf('/layouts/create/') == 0) {
                        if (!this.modalCreated) {
                            this.modalCreated = true;
                            await this.openCreateLayoutModal();
                        }
                        if (detail.urlParts[2] == '2') {
                            this.element.querySelector('#create-modal-step-1').style.display = 'none';
                            this.element.querySelector('#create-modal-step-2').style.display = 'flex';
                        } else {
                            this.element.querySelector('#create-modal-step-1').style.display = 'flex';
                            this.element.querySelector('#create-modal-step-2').style.display = 'none';
                        }
                    } else if (detail.url.indexOf('/layouts/edit/') == 0) {
                        // Close modal
                        await this.closeCreateLayoutModal();

                        await this.renderEdit(detail.urlParts[2]);

                    } else if (detail.url.indexOf('/layouts') == 0) {
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
                    this.routing.navigateTo('/layouts/create/1');
                });

                // Close modal
                await this.closeCreateLayoutModal();

                // load page selection
                await this.loadAllLayouts('#list');

                // add click events for list
                this.element.querySelectorAll('#list .list-item').forEach(elem => {
                    elem.addEventListener('click', () => {
                        if (elem.getAttribute('data-type') == 'theme') {
                            let themeKey = elem.getAttribute('data-theme-key');
                            this.routing.navigateTo('/themes/edit/' + themeKey);
                        } else if (elem.getAttribute('data-type') == 'layout') {
                            let layoutKey = elem.getAttribute('data-layout-key');
                            this.routing.navigateTo('/layouts/edit/' + layoutKey);
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
                        let layoutKey = elem.parentElement.getAttribute('data-layout-key');
                        let layoutName = elem.parentElement.getAttribute('data-layout-name');

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
                            if (confirm('Do you really want to remove the layout "' + layoutName + '" and all of its associated layouts?')) {
                                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                                elem.style.pointerEvents = 'none';
                                elem.style.opacity = '0.5';
                                await this.data_controller.removeLayout(websiteKey, themeKey, layoutKey);
                                $.remove(elem.parentElement.parentElement);
                            }
                        }
                    });
                });
            };

            /**
             * Renders the edit page for a user
             * @param   {string}    username    The username
             * @returns {Promise<void>}
             */
            this.renderEdit = async (username) => {
                const loader = $.html(this.html.loader, {});
                $.append(this.element, loader);
                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                const websiteUser = await this.data_controller.getWebsiteUser(websiteKey, username);
                const user = this.data_controller.getUserFromUsername(username);
                let content = $.html(this.html.editUser, {
                    username: username,
                    role: websiteUser.role,
                    imageUrl: user.image != null ? user.image.thumbnailUrl : this.userAvatarPlaceholder
                });
                $.setContent(this.element, content);

                const userRoleInput = content.querySelector('#user-role');
                const saveButton = content.querySelector('#save-button');
                userRoleInput.value = websiteUser.role;
                saveButton.addEventListener('click', async () => {
                    saveButton.classList.add('button-disabled');
                    saveButton.querySelector('.button-text').innerHTML = 'Saving... (may take a while)';

                    const role = userRoleInput.value;

                    let end = () => {
                        $.remove(loader);
                        saveButton.classList.remove('button-disabled');
                        saveButton.querySelector('.button-text').innerHTML = 'Save';
                    };
                    if (username != await this.data_controller.getCurrentWorkingUsername()) {
                        this.data_controller.addUserToWebsite(websiteKey, username, role).then(() => {
                            end();
                        }).catch(() => {
                            // Error handling
                            end();
                            alert('Failed to add a user with the given username. Please check your entered username.');
                        });
                    } else {
                        end();
                        alert('You can\'t edit your own role.');
                    }
                });
            };

            /**
             * Loads all themes
             * @param {string}  target          Target element
             * @param {boolean} showLayouts     Should the layouts be loaded? defaults to true
             * @returns {Promise<void>}
             */
            this.loadAllLayouts = async (target, showLayouts = true) => {
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
                            themeName: theme.name
                        });
                        const item = itemWrapperTheme.querySelector('.list-item');
                        item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                        $.append(elementRoot, itemWrapperTheme);

                        //Load all layouts
                        if (showLayouts) {
                            let themeLayouts = await this.data_controller.getAllLayoutsOfTheme(websiteKey, theme.themeKey);
                            themeLayouts.sort((a, b) => {
                                if (a.name < b.name) {
                                    return -1;
                                }
                                if (a.name > b.name) {
                                    return 1;
                                }
                                return 0;
                            });
                            for (let layout of themeLayouts) {
                                let itemWrapperLayout = $.html(this.html.layoutListItem, {
                                    layoutKey: layout.layoutKey,
                                    layoutName: layout.name,
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
                        let themeName = elem.getAttribute('data-theme-name');

                        let allMatching = false;
                        for (let searchTerm of searchTerms) {
                            if (searchTerm == '' || themeName.indexOf(searchTerm) >= 0) {
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
             * Creates the modal to add a user
             * @returns {Promise<void>}
             */
            this.openCreateLayoutModal = async () => {
                // Append modal html
                $.append(this.element, $.html(this.html.createLayoutModal, {}));
                await this.json_builder.start();
                $.setContent(this.element.querySelector('#create-modal-layout-ccm-component-config'), this.json_builder.root, {});

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack('/layouts');
                }));

                // Add event for back button
                this.element.querySelectorAll('.modal-back').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                let selectedParentThemeKey = null;

                //Load page selection
                this.loadAllLayouts('#list-modal', false).then(() => {
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
                    this.routing.navigateTo('/layouts/create/2');
                });

                // Add events for finish
                this.element.querySelector('#modal-layout-create-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    this.element.querySelector('#create-modal-step-2').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#create-modal-step-2'), loader);
                    const addButton = this.element.querySelector('#modal-create-button');
                    addButton.classList.add('button-disabled');
                    addButton.value = 'Creating layout...';

                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const layoutName = this.element.querySelector('#create-modal-layout-name').value;
                    const ccmUrl = this.element.querySelector('#create-modal-layout-ccm-component-url').value;
                    const ccmConfig = this.json_builder.getValue();

                    let error = () => {
                        $.remove(loader);
                        this.element.querySelector('#create-modal-step-2').classList.remove('loading');
                        addButton.classList.remove('button-disabled');
                        addButton.value = 'Create layout';
                    };
                    if (this.json_builder.isValid()) {
                        const layoutKey = await this.data_controller.createLayout(websiteKey, selectedParentThemeKey, {
                            name: layoutName,
                            ccmComponent: {
                                url: ccmUrl,
                                config: ccmConfig
                            },
                            custom: null
                        });
                        this.routing.navigateTo('/layouts/edit/' + layoutKey);
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
            this.closeCreateLayoutModal = async () => {
                $.remove(this.element.querySelector('#create-layout-modal'));
                this.modalCreated = false;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();