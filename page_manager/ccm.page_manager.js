/**
 * @overview modularcms component that manages the pages
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'page_manager',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/page_manager/resources/html/page_manager.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/page_manager/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "pages": [ "ccm.store", { "name": "fbroeh2s_pages", "url": "https://ccm2.inf.h-brs.de" } ],
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
                $.setContent(this.element, $.html(this.html.main, {}));

                // Add search
                this.initSearch('#list-search', '#list');

                // Add click event for create button
                this.element.querySelector('#create-button').addEventListener('click', () => {
                    this.routing.navigateTo('/pages/create/1');
                });

                // Add routing
                this.routing.registerRoutingCallback(async (detail) => {
                    if (detail.url.indexOf('/pages/create') == 0) {
                        if (!this.modalCreated) {
                            this.modalCreated = true;
                            this.openCreateNewPageModal();
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
                        // @TODO
                    } else if (detail.url.indexOf('/pages') == 0) {
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
                        })
                    }
                });
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

                const data = await this.pages.get();

                list.innerHTML = '';

                // Iterate through all data
                data.forEach((element) => {
                    let page = element.value;
                    //this.pages.del(element.key);
                    $.append(list, $.html(this.html.listItem, {title: page.title, urlName: page.urlName, pageKey: element.key}));
                });

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
                        let title = elem.getAttribute('data-page-title');
                        let layoutType = elem.getAttribute('data-page-layout-type');
                        let pagePath = elem.getAttribute('data-page-path');

                        let allMatching = false;
                        for (let searchTerm of searchTerms) {
                            if (searchTerm == '' || title.indexOf(searchTerm) >= 0 || layoutType.indexOf(searchTerm) >= 0 || pagePath.indexOf(searchTerm) >= 0) {
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
                        selectedParentPagePath = elem.getAttribute('data-page-path') + '/';

                        // Enable button
                        enableSelectButton();
                    }));
                })

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
                this.element.querySelector('#modal-create-button').addEventListener('click', () => {
                    this.createNewPage(
                        0,
                        selectedParentPageKey,
                        this.element.querySelector('#create-modal-page-title').value,
                        this.element.querySelector('#create-modal-page-url').value,
                        0
                    );
                })

                // Add search
                this.initSearch('#create-modal-list-search', '#list-modal');
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeCreateNewPageModal = async () => {
                $.remove(this.element.querySelector('#create-new-page-modal'));
                this.modalCreated = false;
            }

            /**
             * Creates a new page
             * @returns {Promise<void>}
             */
            this.createNewPage = async (websiteId, parentId, title, urlName, layoutId) => {
                let pageKey = await this.pages.set({
                    value: {
                        title: title,
                        urlName: urlName,
                        parentId: parentId,
                        layoutId: layoutId
                    },
                    "_": {
                        creator: 'test',
                        realm: 'modularcms',
                        group: {
                            admins: [ 'broehl', 'test' ]
                        },
                        access: {
                            get: 'all',
                            set: 'admins',
                            del: 'test'
                        }
                    }
                });
                this.routing.navigateTo('/pages/edit/' + pageKey);
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();