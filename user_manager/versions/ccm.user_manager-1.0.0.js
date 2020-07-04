/**
 * @overview modularcms component that manages the users
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'user_manager',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/user_manager/resources/html/user_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/user_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "userAvatarPlaceholder": "https://modularcms.github.io/modularcms-components/cms/resources/img/no-user-image.svg"
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
                    // Make sure that user has the permissions
                    if (await this.data_controller.getUserWebsiteRole(await this.data_controller.getCurrentWorkingUsername(), await this.getSelectedWebsiteKey()) != 'admin') {
                        this.routing.navigateTo('/pages');
                        return;
                    }

                    if (detail.url == '/users/add') {
                        if (!this.modalCreated) {
                            this.modalCreated = true;
                            await this.openAddUserModal();
                        }
                    } else if (detail.url.indexOf('/users/edit/') == 0) {
                        // Close modal
                        await this.closeAddUserModal();

                        await this.renderEdit(detail.urlParts[2]);

                    } else if (detail.url.indexOf('/users') == 0) {
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

                // Add click event for add button
                this.element.querySelector('#add-button').addEventListener('click', () => {
                    this.routing.navigateTo('/users/add');
                });

                // Close modal
                await this.closeAddUserModal();

                // load page selection
                await this.loadAllUsers('#list');

                // add click events for list
                this.element.querySelectorAll('#list .list-item').forEach(elem => {
                    elem.addEventListener('click', () => {
                        let username = elem.getAttribute('data-username');
                        this.routing.navigateTo('/users/edit/' + username);
                    });
                });

                // add more buttons
                this.element.querySelectorAll('#list .list-item-more-button').forEach(elem => {
                    let showingDelete = false;
                    elem.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        let username = elem.parentElement.getAttribute('data-username');

                        if (!showingDelete) {
                            showingDelete = true;
                            elem.src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/trash-icon.svg';
                            elem.style.filter = 'invert(19%) sepia(100%) saturate(2779%) hue-rotate(354deg) brightness(94%) contrast(95%)';
                            setTimeout(() => {
                                showingDelete = false;
                                elem.src = 'https://modularcms.github.io/modularcms-components/cms/resources/img/more-icon.svg';
                                elem.style.filter = 'none';
                            }, 3000);
                        } else if (username === await this.data_controller.getCurrentWorkingUsername()) {
                            alert('You can\'t remove yourself from a website!');
                        } else {
                            //delete page
                            if (confirm('Do you really want to remove all website permissions for the user "' + username + '" ?')) {
                                const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                                elem.style.pointerEvents = 'none';
                                elem.style.opacity = '0.5';
                                await this.data_controller.removeUserFromWebsite(websiteKey, username)
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
                const user = await this.data_controller.getUserFromUsername(username);

                if (user != null) {
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
                } else {
                    this.routing.navigateTo('/users');
                }
            };

            /**
             * Loads all users
             * @param {string}  target          Target element
             * @returns {Promise<void>}
             */
            this.loadAllUsers = async (target) => {
                const list = this.element.querySelector(target);
                list.classList.add('loading');
                $.append(list, $.html(this.html.loader, {}));

                const websiteKey = await this.data_controller.getSelectedWebsiteKey();

                if (websiteKey != null) {
                    // Get users
                    const elementRoot = document.createElement('div');
                    const websiteUsers = await this.data_controller.getWebsiteUsers(websiteKey);
                    websiteUsers.sort((a, b) => {
                        if (a.username < b.username) {
                            return -1;
                        }
                        if (a.username > b.username) {
                            return 1;
                        }
                        return 0;
                    });

                    const fullUserRoleNames = {
                        'member': 'Member',
                        'author': 'Author',
                        'editor': 'Editor',
                        'admin': 'Administrator'
                    }

                    let uniqueItemIndex = 0;
                    for (let websiteUser of websiteUsers) {
                        const user = await this.data_controller.getUserFromUsername(websiteUser.username);
                        let itemWrapper = $.html(this.html.listItem, {
                            username: user.username,
                            role: fullUserRoleNames[websiteUser.role],
                            imageUrl: user.image != null ? user.image.thumbnailUrl : this.userAvatarPlaceholder
                        });
                        const item = itemWrapper.querySelector('.list-item');
                        item.classList.add((uniqueItemIndex++ % 2 == 0)?'even':'odd');
                        $.append(elementRoot, itemWrapper);
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
                        let username = elem.getAttribute('data-username');
                        let role = elem.getAttribute('data-user-role');

                        let allMatching = false;
                        for (let searchTerm of searchTerms) {
                            if (searchTerm == '' || username.indexOf(searchTerm) >= 0 || role.indexOf(searchTerm) >= 0) {
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
            this.openAddUserModal = async () => {
                // Append modal html
                $.append(this.element, $.html(this.html.addUserModal, {}));

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{
                    this.routing.navigateBack();
                }));

                // Add events for finish
                this.element.querySelector('#modal-user-add-form').addEventListener('submit', async (e) => {
                    e.preventDefault();

                    this.element.querySelector('#add-modal-step-1').classList.add('loading');
                    let loader = $.html(this.html.loader, {});
                    $.append(this.element.querySelector('#add-modal-step-1'), loader);
                    const addButton = this.element.querySelector('#modal-add-button');
                    addButton.classList.add('button-disabled');
                    addButton.value = 'Adding the user... (This may take a while)';

                    const websiteKey = await this.data_controller.getSelectedWebsiteKey();
                    const username = this.element.querySelector('#add-modal-username').value;
                    const role = this.element.querySelector('#add-modal-role').value;

                    let error = () => {
                        $.remove(loader);
                        this.element.querySelector('#add-modal-step-1').classList.remove('loading');
                        addButton.classList.remove('button-disabled');
                        addButton.value = 'Add user to website';
                    };
                    if (username != await this.data_controller.getCurrentWorkingUsername()) {
                        this.data_controller.addUserToWebsite(websiteKey, username, role).then(() => {
                            this.routing.navigateTo('/users/edit/' + username);
                        }).catch(() => {
                            // Error handling
                            error();
                            alert('Failed to add a user with the given username. Please check your entered username.');
                        });
                    } else {
                        error();
                        alert('You can\'t add yourself again!');
                    }
                })
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeAddUserModal = async () => {
                $.remove(this.element.querySelector('#add-user-modal'));
                this.modalCreated = false;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();