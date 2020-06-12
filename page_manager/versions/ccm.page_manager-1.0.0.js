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
                this.createNewPage();
            };

            /**
             * Creates a new page
             * @returns {Promise<void>}
             */
            this.createNewPage = async () => {
                console.log(await this.pages.set({
                    value: 'test'
                }));
            }

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
                $.append(this.element, $.html(this.html.newPageModal, {}));
            }

            /**
             * Closes the modal
             * @returns {Promise<void>}
             */
            this.closeCreateNewPageModal = async () => {
                $.append(this.element, $.html(this.html.newPageModal, {}));
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();