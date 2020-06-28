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
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ]
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
                $.setContent(this.element, $.html(this.html.editPage, {}));
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
                    let uniqueItemIndex = 0;
                    // Closure for adding a page item
                    const getPageListItemElement = async (page, depth = 0) => {
                        let pageUrl = await this.data_controller.getFullPageUrl(websiteKey, page.pageKey);
                        let itemWrapper = $.html(this.html.listItem, {
                            title: page.title,
                            urlName: pageUrl,
                            pageKey: page.pageKey
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
                        selectedParentPagePath = (elem.getAttribute('data-page-path') == '/'?'':elem.getAttribute('data-page-path')) + '/';

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
                    this.data_controller.createPage(websiteKey, {
                        parentKey: selectedParentPageKey,
                        title: titleInput.value,
                        urlPart: urlPart,
                        meta: {
                            description: '',
                            keywords: '',
                            robots: true
                        },
                        themeKey: null, // TODO
                        layoutKey: null,// TODO
                        block: [
                            {
                                "type": "header",
                                "data": {
                                    "text": "New page",
                                    "level": 1
                                }
                            },
                            {
                                "type": "paragraph",
                                "data": {
                                    "text": "This is a new page made with <b>modularcms</b>."
                                }
                            }
                        ],
                        changeLog: [{
                            timestamp: (new Date()).getTime(),
                            username: username,
                            commitMessage: 'Created page',
                            publish: false
                        }]
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