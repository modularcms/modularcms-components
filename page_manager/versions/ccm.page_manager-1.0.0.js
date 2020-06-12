/**
 * @overview modularcms component that manages the pages
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'page_manager',

        version: [1,0,0],

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

            /**
             * Starts the component
             * @returns {Promise<void>}
             */
            this.start = async () => {
                $.setContent(this.element, $.html(this.html.main, {}));

                // Add click event for create button
                this.element.querySelector('#create-button').addEventListener('click', () => {this.openCreateNewPageModal();});

                //this.loadAllPages();
            };

            /**
             * Loads all Pages
             * @returns {Promise<void>}
             */
            this.loadAllPages = async () => {
                const data = self.store.get();
                const list = this.element.querySelector('#list');

                /*
                 * Iterate through all data
                 */
                data.forEach(function (element) {
                    $.append(list, $.html(this.html.listItem, {title: element.title, route: item.route}))
                });
            }

            /**
             * Searches for a page
             * @returns {Promise<void>}
             */
            this.search = async () => {
                //@TODO
            }

            /**
             * Creates the modal to create a new page
             * @returns {Promise<void>}
             */
            this.openCreateNewPageModal = async () => {
                // Append modal html
                $.append(this.element, $.html(this.html.newPageModal, {}));

                // Add events for close
                this.element.querySelectorAll('.modal-close, .modal-bg').forEach(elem => elem.addEventListener('click', () =>{this.closeCreateNewPageModal();}));

                // Add events for back
                this.element.querySelectorAll('.modal-back').forEach(elem => elem.addEventListener('click', () =>{window.history.back()}));

                // Add auto creation of url
                const titleInput = this.element.querySelector('#create-modal-page-title')
                titleInput.addEventListener('keyup', () => {
                    let baseUrl = '/demopage/'
                    let value = titleInput.value;
                    let pageUrlEntry = value.toLowerCase()
                        .replace(/[#?&/=+.*'{}()%$§"!;,:´`]+/g, '')
                        .replace(/ /g, '-')
                        .replace(/ä/g, 'ae')
                        .replace(/ü/g, 'ue')
                        .replace(/ö/g, 'oe')
                        .replace(/ß/g, 'ss');

                    this.element.querySelector('#create-modal-page-url').value = baseUrl + pageUrlEntry;
                });

                // Prevent the removal of the base url
                const urlInput = this.element.querySelector('#create-modal-page-url')
                urlInput.addEventListener('keyup', () => {
                    let baseUrl = '/demopage/'
                    let inputSplit = urlInput.value.split('/');

                    let value = inputSplit[inputSplit.length - 1];
                    let pageUrlEntry = value.toLowerCase()
                        .replace(/[#?&/=+.*'{}()%$§"!;,:´`]+/g, '')
                        .replace(/ /g, '-')
                        .replace(/ä/g, 'ae')
                        .replace(/ü/g, 'ue')
                        .replace(/ö/g, 'oe')
                        .replace(/ß/g, 'ss');
                    if (pageUrlEntry == '') {
                        pageUrlEntry = '-';
                    }

                    this.element.querySelector('#create-modal-page-url').value = '/demopage/' + pageUrlEntry;
                });

                // Add events for finish
                this.element.querySelector('#modal-select-button').addEventListener('click', () => {
                    this.element.querySelector('#create-modal-step-1').style.display = 'none';
                    this.element.querySelector('#create-modal-step-2').style.display = 'flex';
                });

                // Add events for finish
                this.element.querySelector('#modal-create-button').addEventListener('click', () => {
                    this.createNewPage
                })
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeCreateNewPageModal = async () => {
                $.remove(this.element.querySelector('#create-new-page-modal'));
            }

            /**
             * Creates a new page
             * @returns {Promise<void>}
             */
            this.createNewPage = async () => {
                console.log(await this.pages.set({
                    value: 'test'
                }));

                this.closeCreateNewPageModal();
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();