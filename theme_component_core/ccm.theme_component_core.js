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
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/theme_component_core/resources/html/template.html"],
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

            let _themeDefinitions = {};

            /**
             *
             * @param html              The input html
             * @param htmlOptions       The input html Options for ccm
             * @param htmlPlaceholders  The input html placeholder elements
             * @returns {Promise<void>}
             */
            this.initContent = async (html = this.parent.html.main, htmlOptions = {}, htmlPlaceholders = {}) => {
                const element = this.parent.element;
                const zoneItem = this.parent.zoneItem;
                const contentZones = this.parent.contentZones || {};
                const edit = this.parent.edit;

                // Set content
                $.setContent(element, $.html(html, htmlOptions));

                // Add edit style
                if (edit) {
                    $.append(element, $.html(this.html.editStyle, {}));
                }

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
                                appendElement = await this.getThemeDefinitionElement(contentZoneItem, contentZoneName, i);
                            } else if (contentZoneItem.type == 'ccmComponent') {
                                appendElement = await this.getCcmComponentElement(contentZoneItem, contentZoneName, i);
                            } else if (this.checkIfZoneComponentAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
                                appendElement = _contentZoneElements[contentZoneName][i];
                            } else if (contentZoneItem.type == 'header') {
                                appendElement = this.getHeaderElement(contentZoneItem);
                            } else if (contentZoneItem.type == 'paragraph') {
                                appendElement = this.getParagraphElement(contentZoneItem);
                            } else if (contentZoneItem.type == 'list') {
                                appendElement = this.getListElement(contentZoneItem);
                            } else if (contentZoneItem.type == 'image') {
                                appendElement = this.getImageElement(contentZoneItem);
                            }

                            // Remember element
                            _contentZoneElements[contentZoneName][i] = appendElement;

                            if (appendElement != null) {
                                appendElement.setAttribute('data-type', contentZoneItem.type);
                                appendElements.push(appendElement);

                            }
                            i++;
                        }

                        // Append elements
                        contentZoneElement.innerHTML = '';
                        for (let appendElement of appendElements) {
                            $.append(contentZoneElement, appendElement);

                            if (edit) {
                                appendElement.parentNode.insertBefore(this.getAddContentBlockTypeElement(appendElement), appendElement.nextSibling);
                            }
                        }

                        // Add edit add block
                        if (edit && zoneItem.type == 'themeDefinition' && zoneItem.data.themeDefinitionType == 'layout') {
                            const addPlaceholder = $.html(this.html.addBlock, {});
                            $.append(contentZoneElement, addPlaceholder);
                            if (edit) {
                                addPlaceholder.addEventListener('click', () => this.addItem(contentZoneName));
                            }
                        }
                    }
                }

                _contentZonesBefore = contentZones;

                // handle element click
                if (edit && zoneItem.type == 'themeDefinition' && zoneItem.data.themeDefinitionType == 'block')
                    element.addEventListener('click', () => {
                        element.classList.add('edit-focus');
                    });
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
                        let zoneComponentCopy = $.clone(zoneComponent);
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

            this.addItem = (contentZoneName) => {
                //dispatch add block event
                const event = new CustomEvent("pageRendererAddBlock", {
                    detail: {
                        contentZoneName: contentZoneName
                    }
                });
                window.dispatchEvent(event);
            }

            // Copied from https://stackoverflow.com/a/4238971
            this.placeCaretAtEnd = (el) => {
                el.focus();
                if (typeof window.getSelection != "undefined"
                    && typeof document.createRange != "undefined") {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else if (typeof document.body.createTextRange != "undefined") {
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(el);
                    textRange.collapse(false);
                    textRange.select();
                }
            };

            this.getThemeDefinitionElement = async (contentZoneItem, contentZoneName, i) => {
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;
                const edit = this.parent.edit;

                // init theme definition
                if (_themeDefinitions[contentZoneItem.data.themeDefinitionKey] === undefined) {
                    _themeDefinitions[contentZoneItem.data.themeDefinitionKey] = await this.data_controller.getThemeDefinition(websiteKey, page.themeKey, contentZoneItem.data.themeDefinitionKey);
                }
                const themeDefinition = _themeDefinitions[contentZoneItem.data.themeDefinitionKey];
                if (themeDefinition) {
                    let config = {};
                    Object.assign(config, themeDefinition.ccmComponent.config, contentZoneItem.data.config, {
                        parent: this.parent,
                        zoneItem: contentZoneItem,
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
                    return _contentZoneComponents[contentZoneName][i].root;
                }

                return null;
            }

            this.getCcmComponentElement = async (contentZoneItem, contentZoneName, i) => {
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;
                const edit = this.parent.edit;

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
                    const component = await this.ccm.start(contentZoneItem.data.ccmComponent.url, contentZoneItem.data.ccmComponent.config);
                    _contentZoneComponents[contentZoneName][i] = component;
                } else {
                    // Update existing component
                    Object.assign(_contentZoneComponents[contentZoneName][i], config);
                    _contentZoneComponents[contentZoneName][i].update();
                }
                return _contentZoneComponents[contentZoneName][i].root;
            }

            this.getHeaderElement = (contentZoneItem= {
                'type': 'header',
                'data': {
                    'text': '',
                    'level': 2
                },
                contentZones: {}
            }) => {
                const edit = this.parent.edit;

                // init header
                let element = document.createElement('h' + contentZoneItem.data.level);
                element.innerHTML = contentZoneItem.data.text;
                element.setAttribute('data-header-level', contentZoneItem.data.level);

                if (edit) {
                    element.contentEditable = "true";
                }

                return element;
            }

            this.getParagraphElement = (contentZoneItem = {
                'type': 'paragraph',
                'data': {
                    'text': ''
                },
                contentZones: {}
            }) => {
                const edit = this.parent.edit;

                // init paragraph
                let element = document.createElement('p');
                element.contentZoneItem = contentZoneItem;
                element.innerHTML = contentZoneItem.data.text;

                if (edit) {
                    element.contentEditable = "true";
                    this.addParagraphContentEditing(element);
                }

                return element;
            }

            this.addParagraphContentEditing = (element) => {
                if (element.innerHTML == '') {
                    element.classList.remove('has-content');
                } else {
                    element.classList.add('has-content');
                }
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        $.remove(element.querySelector('div:last-child:not(.define-content-block-type)'));
                        let newElement = this.getParagraphElement();
                        element.parentNode.insertBefore(newElement, element.nextSibling);
                        element.parentNode.insertBefore(this.getAddContentBlockTypeElement(newElement), element.nextSibling.nextSibling);
                        newElement.focus();
                    }
                });
                element.addEventListener('keyup', (e) => {
                    if (element.innerHTML == '') {
                        element.classList.remove('has-content');
                    } else {
                        element.classList.add('has-content');
                    }
                });
                element.addEventListener('keydown', (e) => {
                    if (e.key === "Backspace" && element.innerHTML == '') {
                        if (element.previousSibling && element.previousSibling.previousSibling && element.previousSibling.previousSibling.getAttribute('data-type') != 'themeDefinition' && element.previousSibling.previousSibling.getAttribute('data-type') != 'ccmComponent') {
                            e.preventDefault();
                            self.placeCaretAtEnd(element.previousSibling.previousSibling);
                        } else {
                            let newElement = this.getParagraphElement();
                            element.parentNode.insertBefore(newElement, element.nextSibling.nextSibling);
                            element.parentNode.insertBefore(this.getAddContentBlockTypeElement(newElement), element.nextSibling.nextSibling.nextSibling);
                            newElement.focus();
                        }

                        $.remove(element.previousSibling);
                        $.remove(element);
                    }
                });
            }

            this.getAddContentBlockTypeElement = (element) => {
                const definer = $.html(this.html.defineBlockType, {});

                // paragraph button
                const paragraphButton = definer.querySelector('img[data-type="paragraph"]');
                paragraphButton.addEventListener('click', () => {
                    element.focus();
                });

                // list button
                const listButton = definer.querySelector('img[data-type="list"]');
                listButton.addEventListener('click', () => {
                    element.focus();
                });
            }

            this.getListElement = (contentZoneItem = {
                'type': 'list',
                'data': {
                    'style': 'unordered',
                    'items': ['']
                },
                contentZones: {}
            }) => {
                const edit = this.parent.edit;

                // init list
                let element = document.createElement(block.data.style == 'ordered'?'ol':'ul');
                element.setAttribute('data-list-style', block.data.style);
                for (let item of contentZoneItem.data.items) {
                    let createElement = (item) => {
                        let itemElement = document.createElement('li');
                        itemElement.innerHTML = item;

                        if (edit) {
                            itemElement.contentEditable = "true";
                            itemElement.addEventListener('keypress', (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    $.remove(itemElement.querySelector('div:last-child'));
                                    let newElement = createElement('');
                                    itemElement.parentNode.insertBefore(newElement, itemElement.nextSibling);
                                    newElement.focus();
                                    newElement.addEventListener('keydown', (e) => {
                                        if (e.key === "Backspace" && newElement.innerHTML == '') {
                                            e.preventDefault();
                                            $.remove(newElement);
                                        }
                                    });
                                }
                            });
                        }
                        return itemElement;
                    }
                    element.appendChild(createElement(item));
                }

                return element;
            }

            this.getImageElement = (contentZoneItem = {
                'type': 'list',
                'data': {
                    'file': {
                        'url': 'Placeholder' //TODO
                    },
                    'caption': null
                },
                contentZones: {}
            }) => {
                const edit = this.parent.edit;

                // init image
                let element = document.createElement('div');
                element.classList.add('image-wrapper');

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

                element.appendChild(img);
                if (caption) {
                    element.appendChild(caption);
                }

                return element;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();