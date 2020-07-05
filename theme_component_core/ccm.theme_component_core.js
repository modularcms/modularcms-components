/**
 * @overview ccm component for theme helper functions
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'theme_component_core',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.start = async () => {

            };

            let _contentZonesBefore = {};

            let _contentZoneComponents = {};
            let _contentZoneElements = {};

            /**
             *
             * @param html              The input html
             * @param htmlOptions       The input html Options for ccm
             * @param htmlPlaceholders  The input html placeholder elements
             * @returns {Promise<void>}
             */
            this.initContent = async (html = this.parent.html.main, htmlOptions = {}, htmlPlaceholders = {}) => {
                const element = this.parent.element;
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;
                const contentZones = this.parent.contentZones || {};
                const edit = this.parent.edit;

                // Set content
                $.setContent(element, $.html(html, htmlOptions));

                // init placeholders
                for (let elementId in htmlPlaceholders) {
                    $.setContent(element.querySelector('#' + elementId), htmlPlaceholders[elementId]);
                }

                // Init content of content zones
                for (let contentZoneName in contentZones) {
                    const contentZoneItems = contentZones[contentZoneName];
                    const contentZoneElement = element.querySelector('.content-zone[data-content-zone-name="' + contentZoneName + '"]');
                    if (_contentZoneElements[contentZoneName] === undefined) {
                        _contentZoneComponents[contentZoneName] = [];
                        _contentZoneElements[contentZoneName] = [];
                    }
                    if (contentZoneElement) {
                        let i = 0;
                        let appendElements = [];
                        for (let contentZoneItem of contentZoneItems) {
                            let appendElement = null;
                            if (contentZoneItem.type == 'themeDefinition') {
                                // init theme definition
                                const themeDefinition = await this.data_controller.getThemeDefinition(websiteKey, page.themeKey, contentZoneItem.data.themeDefinitionKey);
                                if (themeDefinition) {
                                    let config = {};
                                    Object.assign(config, themeDefinition.ccmComponent.config, {
                                        parent: this.parent,
                                        contentZones: contentZoneItem.contentZones,
                                        websiteKey: websiteKey,
                                        page: page,
                                        edit: edit
                                    });
                                    if (!this.checkIfZoneComponentAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
                                        // Start component
                                        const component = await this.ccm.start(themeDefinition.ccmComponent.url, config);
                                        _contentZoneComponents[contentZoneName][i] = component;
                                    } else {
                                        // Update existing component
                                        Object.assign(_contentZoneComponents[contentZoneName][i], config);
                                        _contentZoneComponents[contentZoneName][i].update();
                                    }
                                    appendElement = _contentZoneComponents[contentZoneName][i].root;
                                }
                            } else if (contentZoneItem.type == 'ccmComponent') {
                                // init ccm component
                                let config = {};
                                Object.assign(config, contentZoneItem.data.config, {
                                    parent: this.parent,
                                    contentZones: contentZoneItem.contentZones,
                                    websiteKey: websiteKey,
                                    page: page,
                                    edit: edit
                                });
                                if (!this.checkIfZoneComponentAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
                                    // Start component
                                    const component = await this.ccm.start(themeDefinition.ccmComponent.url, contentZoneItem.data.config);
                                    _contentZoneComponents[contentZoneName][i] = component;
                                } else {
                                    // Update existing component
                                    Object.assign(_contentZoneComponents[contentZoneName][i], config);
                                    _contentZoneComponents[contentZoneName][i].update();
                                }
                                appendElement = _contentZoneComponents[contentZoneName][i].root;
                            } else if (this.checkIfZoneComponentAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
                                appendElement = _contentZoneElements[contentZoneName][i];
                            } else if (contentZoneItem.type == 'header') {
                                // init header
                                appendElement = document.createElement('h' + contentZoneItem.data.level);
                                appendElement.innerHTML = contentZoneItem.data.text;
                            } else if (contentZoneItem.type == 'paragraph') {
                                // init paragraph
                                appendElement = document.createElement('p');
                                appendElement.innerHTML = contentZoneItem.data.text;
                            } else if (contentZoneItem.type == 'list') {
                                // init list
                                appendElement = document.createElement(block.data.style == 'ordered'?'ol':'ul');
                                for (let item of contentZoneItem.data.items) {
                                    let itemElement = document.createElement('li');
                                    itemElement.innerHTML = item;
                                    appendElement.appendChild(itemElement);
                                }
                            } else if (contentZoneItem.type == 'image') {
                                // init image
                                appendElement = document.createElement('div');
                                appendElement.classList.add('image-wrapper');

                                let img = document.createElement('img');
                                let caption = null;

                                img.src = contentZoneItem.data.file.url;
                                img.loading = 'lazy';
                                if (contentZoneItem.data.caption) {
                                    img.loading = 'lazy';
                                    caption = document.createElement('div');
                                    caption.classList.add('image-caption');
                                    caption.innerHTML = contentZoneItem.data.caption;
                                }

                                appendElement.appendChild(img);
                                if (caption) {
                                    appendElement.appendChild(caption);
                                }
                            }

                            // Remember element
                            _contentZoneElements[contentZoneName][i] = appendElement;

                            if (appendElement != null) {
                                appendElements.push(appendElement);
                            }
                            i++;
                        }

                        // Append elements
                        contentZoneElement.innerHTML = '';
                        for (let appendElement of appendElements) {
                            $.append(contentZoneElement, appendElement);
                        }
                    }
                }

                _contentZonesBefore = contentZones;
            };

            /**
             * Checks if an zone component has changed
             * @param zone
             * @param zoneComponent
             * @param index
             * @returns {boolean}
             */
            this.checkIfZoneComponentAtIndexIsEqual = (zone, zoneComponent, index) => {
                if (_contentZonesBefore[zone] !== undefined && _contentZonesBefore[zone][index] !== undefined) {
                    let getZoneComponentComparableData = (zoneComponent) => {
                        let zoneComponentCopy = Object.assign({}, zoneComponent);
                        zoneComponentCopy.data = Object.assign({}, zoneComponent.data);
                        delete zoneComponentCopy['contentZones'];
                        delete zoneComponentCopy.data['config'];
                        return zoneComponentCopy;
                    }
                    let getZoneComponentHash = (zoneComponent) => {
                        const json = JSON.stringify(zoneComponent);
                        const hash = this.hash.md5(json);
                        return hash;
                    }
                    const zoneComponentBefore = getZoneComponentComparableData(_contentZonesBefore[zone][index]);
                    const zoneComponent = getZoneComponentComparableData(zoneComponent);
                    return getZoneComponentHash(zoneComponentBefore) == getZoneComponentHash(zoneComponent);
                }
                return false;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();