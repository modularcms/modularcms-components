/**
 * @overview ccm component for theme helper functions
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'theme_component_core',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/theme_component_core/resources/html/template.html"],
            "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.min.js" ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.start = async () => {

            };

            let _contentZonesBefore = {};

            let _contentZoneInstances = {};
            let _contentZoneElements = {};

            /**
             * Initializes the content of a parent at first start
             * @param html              The input html
             * @param htmlOptions       The input html Options for ccm
             * @param htmlPlaceholders  The input html placeholder elements
             * @returns {Promise<void>}
             */
            this.initContent = async (html = this.parent.html.main, htmlOptions = {}, htmlPlaceholders = {}) => {
                const element = this.parent.element;
                const zoneItem = this.parent.zoneItem;
                const edit = this.parent.edit;
                const parentZoneName = this.parent.parentZoneName;

                // Set content
                $.setContent(element, $.html(html, htmlOptions));

                // Add edit style
                $.append(element, $.html(this.html.style, {}));
                if (edit) {
                    $.append(element, $.html(this.html.editStyle, {}));
                }

                // init placeholders
                for (let elementId in htmlPlaceholders) {
                    $.setContent(element.querySelector('#' + elementId), htmlPlaceholders[elementId]);
                }

                await this.updateContent();

                // handle block config
                if (edit && zoneItem.type == 'themeDefinition' && ['block', 'contentComponent'].indexOf(zoneItem.data.themeDefinitionType) >= 0) {
                    this.addEditFocusHandling(element, parentZoneName);
                }

            };

            /**
             * Updates the content after the content was initialized
             * @returns {Promise<void>}
             */
            this.updateContent = async () => {
                const element = this.parent.element;
                const zoneItem = this.parent.zoneItem;
                const contentZones = this.parent.contentZones || {};
                const edit = this.parent.edit;

                // Init content of content zones
                for (let contentZoneName in contentZones) {
                    const contentZoneItems = contentZones[contentZoneName];
                    const contentZoneElement = element.querySelector('.content-zone[data-content-zone-name="' + contentZoneName + '"]');

                    if (_contentZoneElements[contentZoneName] === undefined) {
                        _contentZoneInstances[contentZoneName] = [];
                        _contentZoneElements[contentZoneName] = [];
                    }
                    if (contentZoneElement) {
                        let i = 0;

                        // disable drag and drop for contentEditable
                        if (edit) {
                            contentZoneElement.addEventListener('drop', e => e.preventDefault());
                        }

                        // init items
                        let appendElements = [];
                        for (let contentZoneItem of contentZoneItems) {
                            let appendElement = null;
                            if (contentZoneItem.type == 'themeDefinition') {
                                appendElement = await this.getThemeDefinitionElement(contentZoneName, contentZoneItem, i);
                            } else if (contentZoneItem.type == 'ccmComponent') {
                                appendElement = await this.getCcmComponentElement(contentZoneName, contentZoneItem, i);
                            } else if (this.checkIfZoneItemAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
                                appendElement = _contentZoneElements[contentZoneName][i];
                            } else if (contentZoneItem.type == 'header') {
                                appendElement = this.getHeaderElement(contentZoneName, contentZoneItem);
                            } else if (contentZoneItem.type == 'paragraph') {
                                appendElement = this.getParagraphElement(contentZoneName, contentZoneItem);
                            } else if (contentZoneItem.type == 'list') {
                                appendElement = this.getListElement(contentZoneName, contentZoneItem);
                            } else if (contentZoneItem.type == 'image') {
                                appendElement = this.getImageElement(contentZoneName, contentZoneItem);
                            }

                            // Remember element
                            _contentZoneElements[contentZoneName][i] = appendElement;

                            if (appendElement.ccmInstance !== undefined) {
                                _contentZoneInstances[contentZoneName][i] = appendElement.ccmInstance;
                            }

                            if (appendElement != null) {
                                appendElements.push(appendElement);
                            }
                            i++;
                        }

                        // Append elements
                        contentZoneElement.innerHTML = '';
                        for (let appendElement of appendElements) {
                            $.append(contentZoneElement, appendElement);

                            if (edit) {
                                appendElement.parentNode.insertBefore(this.getAddContentBlockTypeElement(appendElement, contentZoneName), appendElement.nextSibling, contentZoneName);
                            }
                        }

                        // Add edit add block
                        if (edit && zoneItem.type == 'themeDefinition' && zoneItem.data.themeDefinitionType == 'layout') {
                            const addPlaceholder = $.html(this.html.addBlock, {});
                            $.append(contentZoneElement, addPlaceholder);
                            if (edit) {
                                addPlaceholder.addEventListener('click', () => {this.addItem(contentZoneName)});
                            }
                        }
                    }
                }

                _contentZonesBefore = contentZones;
            }

            /**
             * Adds the focus handling of theme definition blocks
             * @param {HTMLElement} element         The element that should be given the focus handling
             * @param {string}      parentZoneName  The content zone name of the element parent
             */
            this.addEditFocusHandling = (element, parentZoneName) => {
                // handle focusing
                this.parent.parent.element.addEventListener('click', (e) => {
                    if (e.target != this.parent.root && element) {
                        element.classList.remove('edit-focus');
                        let contentComponentEditFocus = element.querySelector('.content-component-edit-focus');
                        if (contentComponentEditFocus != null) {
                            contentComponentEditFocus.classList.remove('content-component-edit-focus')
                        }
                    }
                });
                this.parent.root.addEventListener('click', () => {
                    element.classList.add('edit-focus');
                });
                let editThemeDefinition = $.html(this.html.editThemeDefinition, {});
                $.append(element, editThemeDefinition);
                let addThemeDefinitionAfter = $.html(this.html.addThemeDefinitionAfter, {});
                $.append(element, addThemeDefinitionAfter);

                // handle add after
                const addButton = addThemeDefinitionAfter;
                addButton.addEventListener('click', () => {
                    this.parent.parent.core.addItem(parentZoneName, this.parent.root.parentNode);
                    this.parent.element.classList.remove('edit-focus');
                });

                // handle remove button
                const removeButton = editThemeDefinition.querySelector('img[data-action="remove"');
                removeButton.addEventListener('click', () => {
                    if (confirm('Do you really want to remove this block?')) {
                        const event = new CustomEvent("pageRendererRemoveBlock", {
                            detail: {}
                        });
                        window.dispatchEvent(event);
                        this.parent.parent.core.removeZoneItem(this.parent.root.parentNode, parentZoneName);
                    }
                });

                // handle edit button
                const configButton = editThemeDefinition.querySelector('img[data-action="config"');
                let configParent = this.parent;
                configButton.addEventListener('click', () => {
                    let updateConfig = async (config) => {
                        let configSet = {};
                        Object.assign(configSet, configParent.zoneItem.data.config === undefined ? {} : $.clone(configParent.zoneItem.data.config), config);
                        let newElement = await configParent.parent.core.updateThemeDefinitionElementConfig(
                            configParent.parent.element.querySelector('.content-zone[data-content-zone-name="' + parentZoneName + '"]'),
                            configParent.root.parentNode,
                            configParent.zoneItem,
                            parentZoneName,
                            configParent,
                            configSet
                        );
                        return newElement.ccmInstance;
                    };
                    const event = new CustomEvent("pageRendererEditBlockConfig", {
                        detail: {
                            zoneItem: this.parent.zoneItem,
                            updateConfig: async (config) => {
                                configParent = await updateConfig(config);
                            }
                        }
                    });
                    window.dispatchEvent(event);
                });
            }

            /**
             * Checks if an zone component has changed at an index
             * @param {string}  contentZoneName
             * @param {{}}      contentZoneItem
             * @param {number}  index
             * @returns {boolean}
             */
            this.checkIfZoneItemAtIndexIsEqual = (contentZoneName, contentZoneItem, index) => {
                if (_contentZonesBefore[contentZoneName] !== undefined && _contentZonesBefore[contentZoneName][index] !== undefined) {
                    // let instance = window.modularcms.themeComponents
                    let getZoneComponentComparableData = (item) => {
                        let zoneComponentCopy = $.clone(item);
                        delete zoneComponentCopy['contentZones'];
                        return zoneComponentCopy;
                    }
                    let getZoneComponentHash = (item) => {
                        const json = JSON.stringify(item);
                        const hash = this.hash.md5(json);
                        return hash;
                    }
                    const zoneItemBefore = getZoneComponentComparableData(_contentZonesBefore[contentZoneName][index]);
                    const zoneItem = getZoneComponentComparableData(contentZoneItem);
                    return getZoneComponentHash(zoneItemBefore) == getZoneComponentHash(zoneItem);
                }
                return false;
            }

            /**
             * Calls an window event to add a new block
             * @param {string}      contentZoneName The element content zone name
             * @param {HTMLElement} element         The element to create an new block item after
             */
            this.addItem = (contentZoneName, element = null) => {
                //dispatch add block event
                const event = new CustomEvent("pageRendererAddBlock", {
                    detail: {
                        addThemeDefinitionFunction: async (themeDefinitionKey) => {
                            this.createBlock(this.parent.element.querySelector('.content-zone[data-content-zone-name="' + contentZoneName + '"]'), element, contentZoneName, themeDefinitionKey);
                        }
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

            /**
             * Adds the handling for pasting into a contentEditable element
             * @param {HTMLElement} element         The element which the handling should be given
             * @param {string}      contentZoneName The content zone name of the element
             * @param {boolean}     ownsText        Defines if the element owns an inner text
             * @see inspiried by https://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
             */
            this.addContentPasteHandling = (element, contentZoneName, ownsText = true) => {
                element.addEventListener("paste", (e) => {
                    e.preventDefault();
                    let text = (e.originalEvent || e).clipboardData.getData('text/plain');
                    let textSplit = text.split('\n');
                    if (ownsText) {
                        document.execCommand("insertText", false, textSplit[0]);
                    }
                    let translateDiv = null;

                    if (ownsText && textSplit.length > 1) {
                        const selection = this.parent.element.parentNode.getSelection();
                        const ranges = this.splitNode(selection, element);
                        const fragment = ranges.next.extractContents();
                        translateDiv = document.createElement('div');
                        translateDiv.appendChild(fragment);
                    }

                    let paragraph = element;

                    for (let i = ownsText?1:0; i < textSplit.length - 1; i++) {

                        paragraph = this.addParagraphAfter(element.parentNode, paragraph, contentZoneName, textSplit[i].replace(/  /g, '&nbsp; '));
                    }

                    if (translateDiv) {
                        paragraph.innerHTML += translateDiv.innerHTML;
                    }
                });
            }

            /**
             * Return an theme definition and caches the theme definition and all of its theme siblings
             * @param {string}  themeDefinitionKey  The key for the theme definition
             * @returns {Promise<*>}
             */
            this.getThemeDefinition = async (themeDefinitionKey) => {
                const page = this.parent.page;
                const websiteKey = this.parent.websiteKey;

                if (window.modularcms === undefined) {
                    window.modularcms = {};
                }
                if (window.modularcms._themeDefinitions === undefined) {
                    window.modularcms._themeDefinitions = {};
                }
                if (window.modularcms._themeDefinitions[page.themeKey] === undefined) {
                    window.modularcms._themeDefinitions[page.themeKey] = {};
                }
                if (Object.keys(window.modularcms._themeDefinitions[page.themeKey]).length == 0) {
                    let themeDefinitions = await this.data_controller.getAllThemeDefinitionsOfTheme(websiteKey, page.themeKey);
                    for (let themeDefinition of themeDefinitions) {
                        window.modularcms._themeDefinitions[page.themeKey][themeDefinition.themeDefinitionKey] = themeDefinition;
                    }
                }
                if (window.modularcms._themeDefinitions[page.themeKey][themeDefinitionKey] === undefined) {
                    window.modularcms._themeDefinitions[page.themeKey][themeDefinitionKey] = await this.data_controller.getThemeDefinition(websiteKey, page.themeKey, themeDefinitionKey);
                }
                return window.modularcms._themeDefinitions[page.themeKey][themeDefinitionKey];
            }

            /**
             * Return an theme definition component and caches the theme definition components in the background
             * @param {string}  themeDefinitionKey  The key for the theme definition
             * @returns {Promise<*>}
             */
            this.getThemeDefinitionComponent = async (themeDefinitionKey) => {
                const page = this.parent.page;

                if (window.modularcms._themeDefinitionComponents === undefined) {
                    window.modularcms._themeDefinitionComponents = {};
                }
                if (window.modularcms._themeDefinitionComponents[page.themeKey] === undefined) {
                    window.modularcms._themeDefinitionComponents[page.themeKey] = {};
                }
                if (window.modularcms._themeDefinitionComponents[page.themeKey][themeDefinitionKey] === undefined) {
                    const themeDefinition = await this.getThemeDefinition(themeDefinitionKey);
                    window.modularcms._themeDefinitionComponents[page.themeKey][themeDefinitionKey] = await this.ccm.component(themeDefinition.ccmComponent.url, themeDefinition.ccmComponent.config);
                }
                return window.modularcms._themeDefinitionComponents[page.themeKey][themeDefinitionKey];
            }

            /**
             * Creates an new theme definition element
             * @param {string}  contentZoneName     The name of the elements content zone
             * @param {string}  themeDefinitionKey  The key for the theme definition
             * @param {number}  i                   The index where the element should be located
             * @returns {Promise<HTMLDivElement>}
             */
            this.getNewThemeDefinitionElement = async (contentZoneName, themeDefinitionKey, i) => {
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;

                const themeDefinition = await this.getThemeDefinition(themeDefinitionKey);

                return await this.getThemeDefinitionElement(contentZoneName, {
                    type: 'themeDefinition',
                    data: {
                        themeDefinitionKey: themeDefinitionKey,
                        themeDefinitionType: themeDefinition.type,
                        ignore: {
                            config: {}
                        }
                    }
                }, i, true)
            };

            /**
             * Returns an theme definition element
             * @param {string}  contentZoneName The name of the elements content zone
             * @param {{}}      contentZoneItem The content zone item, which is containing the abstract elements specs
             * @param {number}  i               The index where the element should be located
             * @param {boolean} forceAdd        Defines if the the element should be forced to add and therefore if the instance caching should be avoided
             * @returns {Promise<null|HTMLDivElement>}
             */
            this.getThemeDefinitionElement = async (contentZoneName, contentZoneItem, i, forceAdd = false) => {
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;
                const edit = this.parent.edit;

                const themeDefinition = await this.getThemeDefinition(contentZoneItem.data.themeDefinitionKey);
                if (themeDefinition) {
                    // Merge configs
                    let config = {};
                    Object.assign(config, $.clone(contentZoneItem.data.ignore.config), {
                        parent: this.parent,
                        zoneItem: contentZoneItem,
                        contentZones: contentZoneItem.contentZones,
                        websiteKey: websiteKey,
                        page: page,
                        edit: edit,
                        parentZoneName: contentZoneName
                    });

                    // Start new or retrieve existing cached theme component instance
                    const component = await this.getThemeDefinitionComponent(contentZoneItem.data.themeDefinitionKey);
                    let instance = null;
                    let element = document.createElement('div');
                    if (forceAdd || !this.checkIfZoneItemAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
                        // Start component
                        instance = await component.start(Object.assign(config, {root: element}));
                    } else {
                        // Update existing component
                        instance = _contentZoneInstances[contentZoneName][i];
                        Object.assign(instance, config);
                        $.append(element, instance.root);
                        instance.updateChildren();
                    }

                    // Set element environment attributes
                    element.contentZoneItem = contentZoneItem;
                    element.ccmInstance = instance;
                    element.themeDefinitionType = themeDefinition.type;

                    // Handle editing for a contentComponent
                    if (edit && contentZoneItem.data.themeDefinitionType == 'contentComponent') {
                        element.contentEditable = "true";
                        instance.root.contentEditable = "false";
                        instance.element.style.pointerEvents = "none !important";
                        instance.root.classList.add('content-component');

                        element.addEventListener('click', () => {
                            element.focus();
                        });

                        let configElement = element;

                        // handle double click
                        element.addEventListener('dblclick', () => {
                            element.classList.add('content-component-edit-focus');
                            let updateConfig = async (config, scope) => {
                                let configSet = {};
                                Object.assign(configSet, contentZoneItem.data.ignore.config === undefined ? {} : $.clone(contentZoneItem.data.ignore.config), config);
                                let newElement = await this.updateThemeDefinitionElementConfig(
                                    configElement.parentNode,
                                    configElement,
                                    contentZoneItem,
                                    contentZoneName,
                                    this.parent,
                                    configSet
                                );
                                return newElement;
                            };
                            const event = new CustomEvent("pageRendererEditBlockConfig", {
                                detail: {
                                    zoneItem: contentZoneItem,
                                    updateConfig: async (config, scope) => {
                                        configElement = await updateConfig(config, scope);
                                    }
                                }
                            });
                            window.dispatchEvent(event);
                        });

                        this.addContentRemoveAndEnterHandling(element, contentZoneName);
                    }

                    // define content get method
                    element.getDataContent = () => {
                        return {
                            themeDefinitionKey: themeDefinition.themeDefinitionKey,
                            themeDefinitionType: themeDefinition.type,
                            ignore: {
                                config: contentZoneItem.data.ignore.config
                            }
                        };
                    };

                    element.setAttribute('data-type', contentZoneItem.type);
                    return element;
                }

                return null;
            }

            /**
             * Adds an new header after an existing element
             * @param {HTMLElement} parentNode          The parent node of the element
             * @param {HTMLElement} element             The element where the new element should be inserted after
             * @param {string}      contentZoneName     The name of the elements content zone
             * @param {string}      themeDefinitionKey  The key for the theme definition to use
             * @returns {Promise<HTMLDivElement>}
             */
            this.addThemeDefinitionAfter = async (parentNode, element, contentZoneName, themeDefinitionKey) => {
                let newElement = await this.getNewThemeDefinitionElement(contentZoneName, themeDefinitionKey, _contentZoneElements[contentZoneName].indexOf(element) + 1);
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName, newElement.ccmInstance);
                if (newElement.themeDefinitionType == 'block') {
                    newElement.ccmInstance.element.querySelectorAll('.content-zone').forEach(item => {
                        newElement.ccmInstance.core.addParagraphAfter(item, null, item.getAttribute('data-content-zone-name'));
                    });
                }
                newElement.focus();
                return newElement;
            };

            /**
             * Adds an new theme definition block after an existing element or at the and
             * @param {HTMLElement} parentNode          The parent node of the element
             * @param {HTMLElement} element             The element where the new element should be inserted after
             * @param {string}      contentZoneName     The name of the elements content zone
             * @param {string}      themeDefinitionKey  The key for the theme definition to use
             * @returns {Promise<void>}
             */
            this.createBlock = async (parentNode, element = null, contentZoneName, themeDefinitionKey) => {
                let addBlock = this.parent.element.querySelector('.content-zone[data-content-zone-name="' + contentZoneName + '"] .add-block');
                let newElement = await this.addThemeDefinitionAfter(parentNode, element, contentZoneName, themeDefinitionKey);
                newElement.ccmInstance.element.classList.add('edit-focus');
                if (element != null) {
                    element.ccmInstance.element.classList.remove('edit-focus');
                    element.ccmInstance.element.querySelectorAll('.edit-focus').forEach(item => item.classList.remove('edit-focus'));
                }
                parentNode.insertBefore(addBlock, null);
            }

            /**
             * Get a new element for an external ccm component
             * @param contentZoneName
             * @param contentZoneItem
             * @returns {Promise<*>}
             */
            this.getNewCcmComponentElement = async (contentZoneName, ccmUrl, ccmConfig, i) => {
                return await this.getCcmComponentElement(contentZoneName, {
                    type: 'ccmComponent',
                    data: {
                        url: ccmUrl,
                        ignore: {
                            config: ccmConfig
                        }
                    }
                }, i);
            }

            /**
             * Get a element for a ccm component
             * @param contentZoneName
             * @param contentZoneItem
             * @returns {Promise<*>}
             */
            this.getCcmComponentElement = async (contentZoneName, contentZoneItem, i) => {
                // init ccm component
                let config = $.clone(contentZoneItem.data.ignore.config);
                const edit = this.parent.edit;

                let instance = null;
                let element = document.createElement('div');
                $.append(element, $.loading());
                let configStore = await this.ccm.store(config[1]);
                let configGet = await configStore.get(config[2]);
                instance = await this.ccm.start(contentZoneItem.data.url, Object.assign({}, configGet, {
                    root: element,
                    parent: this.parent
                }));
                _contentZoneInstances[contentZoneName][i] = instance;

                if (edit) {
                    element.contentEditable = "true";
                    instance.root.contentEditable = "false";
                    instance.element.style.pointerEvents = "none !important";
                    instance.root.classList.add('content-component');
                }

                //$.setContent(element, instance.root);

                // handle double click
                element.addEventListener('dblclick', () => {
                    element.classList.add('content-component-edit-focus');
                    let handler = () => {
                        if (element) {
                            element.classList.remove('content-component-edit-focus');
                        }
                        this.parent.element.removeEventListener('click', handler);
                    };
                    this.parent.element.addEventListener('click', handler);
                    let componentElement = element;
                    let updateCcmComponent = async (config) => {
                        contentZoneItem.data.ignore.config = config;
                        let newElement = await this.getNewCcmComponentElement(contentZoneName, contentZoneItem.data.url, contentZoneItem.data.ignore.config, _contentZoneElements[contentZoneName].indexOf(componentElement));
                        this.addContentZoneItemAfter(componentElement.parentNode, componentElement, newElement, contentZoneName, newElement.ccmInstance);
                        this.removeZoneItem(componentElement, contentZoneName);
                        return newElement;
                    };
                    const event = new CustomEvent("pageRendererEditCcmComponentConfig", {
                        detail: {
                            zoneItem: contentZoneItem,
                            updateCcmComponent: async (config) => {
                                componentElement = await updateCcmComponent(config);
                            }
                        }
                    });
                    window.dispatchEvent(event);
                });

                this.addContentRemoveAndEnterHandling(element, contentZoneName);

                // define content get method
                element.getDataContent = () => {
                    return {
                        url: contentZoneItem.data.url,
                        ignore: {
                            config: contentZoneItem.data.ignore.config
                        }
                    };
                };

                element.contentZoneItem = contentZoneItem;
                element.ccmInstance = instance;
                element.setAttribute('data-type', contentZoneItem.type);
                return element;
            }

            /**
             * Returns an header element
             * @param {string}  contentZoneName The name of the elements content zone
             * @param {{}}      contentZoneItem The content zone item, which is containing the abstract elements specs
             * @returns {HTMLElement}
             */
            this.getHeaderElement = (contentZoneName, contentZoneItem= {
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
                element.contentZoneItem = contentZoneItem;
                element.setAttribute('data-header-level', contentZoneItem.data.level);

                if (edit) {
                    element.contentEditable = "true";
                    this.addContentEditing(element, contentZoneName);
                }

                // define content get method
                element.getDataContent = () => {
                    return {
                        text: element.innerHTML,
                        level: element.tagName.substring(1)
                    };
                };

                element.setAttribute('data-type', contentZoneItem.type);

                this.addContentPasteHandling(element, contentZoneName);

                return element;
            }

            /**
             * Adds an new header after an existing element
             * @param {HTMLElement} parentNode      The parent node of the element
             * @param {HTMLElement} element         The element where the new element should be inserted after
             * @param {string}      contentZoneName The name of the elements content zone
             * @param {number}      level           The header elements level representing the HTML tags h1, h2, h3
             * @param {string}      content         The html content of the header
             */
            this.addHeaderAfter = (parentNode, element, contentZoneName, level = 2, content='') => {
                let newElement = this.getHeaderElement(contentZoneName, {contentZones:{}, type: 'header', data: {level: level, text: content}});
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName)
                newElement.focus();
            };

            /**
             * Returns an paragraph element
             * @param {string}  contentZoneName The name of the elements content zone
             * @param {{}}      contentZoneItem The content zone item, which is containing the abstract elements specs
             * @returns {HTMLParagraphElement}
             */
            this.getParagraphElement = (contentZoneName, contentZoneItem = {
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
                    this.addContentEditing(element, contentZoneName);
                }

                // define content get method
                element.getDataContent = () => {
                    return {
                        text: element.innerHTML.replace(/<br\/>/g, '')
                    };
                };

                this.addContentPasteHandling(element, contentZoneName);

                element.setAttribute('data-type', contentZoneItem.type);

                return element;
            }

            /**
             * Adds an new header after an existing element
             * @param {HTMLElement} parentNode      The parent node of the element
             * @param {HTMLElement} element         The element where the new element should be inserted after
             * @param {string}      contentZoneName The name of the elements content zone
             * @param {string}      content         The html content of the header
             * @returns {HTMLParagraphElement}
             */
            this.addParagraphAfter = (parentNode, element, contentZoneName, content='') => {
                let newElement = this.getParagraphElement(contentZoneName, {contentZones:{}, type: 'paragraph', data: {text: content}});
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName);
                newElement.focus();
                return newElement;
            };

            /**
             * Adds an new header before an existing element
             * @param {HTMLElement} parentNode      The parent node of the element
             * @param {HTMLElement} element         The element where the new element should be inserted before
             * @param {string}      contentZoneName The name of the elements content zone
             * @param {string}      content         The html content of the header
             * @returns {HTMLParagraphElement}
             */
            this.addParagraphBefore = (parentNode, element, contentZoneName, content='') => {
                let newElement = this.getParagraphElement(contentZoneName, {contentZones:{}, type: 'paragraph', data: {text: content}});
                this.addContentZoneItemBefore(parentNode, element, newElement, contentZoneName)
                newElement.focus();
            };

            /**
             * Returns an list element
             * @param {string}  contentZoneName The name of the elements content zone
             * @param {{}}      contentZoneItem The content zone item, which is containing the abstract elements specs
             * @returns {HTMLElement}
             */
            this.getListElement = (contentZoneName, contentZoneItem = {
                'type': 'list',
                'data': {
                    'style': 'unordered',
                    'items': ['']
                },
                contentZones: {}
            }) => {
                const edit = this.parent.edit;

                // init list
                let element = document.createElement(contentZoneItem.data.style == 'ordered'?'ol':'ul');

                if (edit) {
                    element.contentEditable = "true";

                    // handle enter key input
                    element.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const selection = this.parent.element.parentNode.getSelection();
                            const range = selection.getRangeAt(0);
                            let target = range.startContainer;
                            if (target.nodeType == 3) {
                                target = target.parentNode;
                            }
                            if (element.querySelector('li:last-child') == target && target.innerHTML == '') {
                                e.preventDefault();
                                $.remove(target);
                                this.addParagraphAfter(element.parentNode, element, contentZoneName);
                                if (element.childElementCount == 0) {
                                    this.removeZoneItem(element, contentZoneName);
                                }
                            }
                        }
                    });

                    // handle change
                    element.addEventListener('change', (e) => {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        let target = range.startContainer;
                        if (target.nodeType == 3) {
                            target = target.parentNode;
                        }
                        target.querySelectorAll('br').forEach(item => $.remove(item));
                    });

                    // handle backspace key input
                    element.addEventListener('keyup', (e) => {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        let target = range.startContainer;
                        if (target.nodeType == 3) {
                            target = target.parentNode;
                        }
                        target.querySelectorAll('br').forEach(item => $.remove(item));
                        if ((e.key == 'Backspace' || e.key == 'Delete') && (target.innerHTML == '' || target.innerHTML == '')) {
                            if (element.childElementCount == 0) {
                                if (e.key == 'Backspace' && element.previousSibling && element.previousSibling.previousSibling) {
                                    this.placeCaretAtEnd(element.previousSibling.previousSibling);
                                } else if (e.key == 'Delete' && element.nextSibling && element.nextSibling.nextSibling) {
                                    element.nextSibling.nextSibling.focus();
                                } else {
                                    this.addParagraphAfter(element.parentNode, element, contentZoneName);
                                }
                                this.removeZoneItem(element, contentZoneName);
                            }
                        }
                    });
                }

                element.setAttribute('data-list-style', contentZoneItem.data.style);

                // create list items
                for (let item of contentZoneItem.data.items) {
                    let createElement = (item) => {
                        let itemElement = document.createElement('li');
                        itemElement.innerHTML = item;
                        return itemElement;
                    }
                    element.appendChild(createElement(item));
                }

                element.setAttribute('data-type', contentZoneItem.type);
                element.contentZoneItem = contentZoneItem;

                if (edit) {
                    // handle text selection
                    this.addContentEditingFormat(element, contentZoneName);
                }

                // define content get method
                element.getDataContent = () => {
                    element.querySelectorAll('br').forEach(item => $.remove(item));
                    let items = [];
                    element.querySelectorAll('li').forEach(item => items.push(item.innerHTML));
                    return {
                        style: element.tagName == 'ol'?'ordered':'unordered',
                        items: items
                    };
                };

                this.addContentPasteHandling(element, contentZoneName);

                return element;
            }

            /**
             * Returns an new image element
             * @param {string}  contentZoneName The name of the elements content zone
             * @param {string}  imageUrl        The url of the new image
             * @returns {HTMLImageElement}
             */
            this.getNewImageElement = (contentZoneName, imageUrl) => {
                return this.getImageElement(contentZoneName, {
                    'type': 'image',
                    'data': {
                        'file': {
                            'url': imageUrl
                        },
                        'caption': null
                    },
                    contentZones: {}
                })
            }

            /**
             * Returns an image element
             * @param {string}  contentZoneName The name of the elements content zone
             * @param {{}}      contentZoneItem The content zone item, which is containing the abstract elements specs
             * @returns {HTMLImageElement}
             */
            this.getImageElement = (contentZoneName, contentZoneItem = {
                'type': 'image',
                'data': {
                    'file': {
                        'url': null
                    },
                    'caption': null
                },
                contentZones: {}
            }) => {
                const edit = this.parent.edit;

                // init image
                let element = document.createElement('div');
                element.classList.add('image-wrapper');

                if (edit) {
                    element.contentEditable = "true";
                }

                this.addContentRemoveAndEnterHandling(element, contentZoneName);

                // create image
                let img = document.createElement('img');
                let caption = null;

                // create image caption
                img.src = contentZoneItem.data.file.url;
                img.loading = 'lazy';
                if (contentZoneItem.data.caption) {
                    caption = document.createElement('div');
                    caption.classList.add('image-caption');
                    caption.innerHTML = contentZoneItem.data.caption;
                }

                // handle image click
                if (edit) {
                    img.addEventListener('click', () => {
                        this.placeCaretAtEnd(element);
                    });
                }

                // combine
                element.appendChild(img);
                if (caption) {
                    element.appendChild(caption);
                }

                // define content get method
                element.getDataContent = () => {
                    return {
                        file: {
                            url: img.src
                        },
                        caption: caption?caption.innerHTML:null
                    };
                };

                // add content paste handling
                this.addContentPasteHandling(element, contentZoneName, false);

                element.setAttribute('data-type', contentZoneItem.type);
                element.contentZoneItem = contentZoneItem;

                return element;
            }

            /**
             * Updates a config of an theme definition element
             * @param {HTMLElement} parentNode      The elements parent node
             * @param {HTMLElement} element         The element where the config should be updated
             * @param {{}}          zoneItem        The content zone item of the element
             * @param {string}      contentZoneName The content zone name of the element
             * @param {Instance}    instance        The element instance
             * @param {{}}          config          The new config
             * @returns {Promise<null|HTMLDivElement>}
             */
            this.updateThemeDefinitionElementConfig = async (parentNode, element, zoneItem, contentZoneName, instance, config) => {
                zoneItem.data.ignore.config = config;
                zoneItem.contentZones = instance.core.getContentZones();
                let newElement = await this.getThemeDefinitionElement(contentZoneName, zoneItem, _contentZoneElements[contentZoneName].indexOf(element));
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName, newElement.ccmInstance);
                if (newElement.themeDefinitionType == 'block') {
                    newElement.ccmInstance.element.querySelectorAll('.content-zone').forEach(item => {
                        let newElementContentZoneName = item.getAttribute('data-content-zone-name')
                        if (newElement.ccmInstance.core.getContentZoneElementCount(newElementContentZoneName) === 0) {
                            newElement.ccmInstance.core.addParagraphAfter(item, null, newElementContentZoneName);
                        }
                    });
                }
                this.removeZoneItem(element, contentZoneName);
                return newElement;
            }

            /**
             * Adds an new content zone item after an existing element
             * @param {HTMLElement} parentNode      The parent node of the element
             * @param {HTMLElement} element         The element where the new element should be inserted after
             * @param {HTMLElement} newElement      The new element
             * @param {string}      contentZoneName The name of the elements content zone
             * @param {Instance}    instance        The ccm instance of the new content zone item
             */
            this.addContentZoneItemAfter = (parentNode, element, newElement, contentZoneName, instance = null) => {
                if (_contentZoneElements[contentZoneName] === undefined) {
                    _contentZoneElements[contentZoneName] = [];
                    _contentZoneInstances[contentZoneName] = [];
                }
                let elementIndex = element == null ? -1 : _contentZoneElements[contentZoneName].indexOf(element);
                if (elementIndex >= 0) {
                    _contentZoneElements[contentZoneName].splice(elementIndex + 1, 0, newElement);
                    _contentZoneInstances[contentZoneName].splice(elementIndex + 1, 0, instance);
                } else {
                    _contentZoneElements[contentZoneName].push(newElement);
                    _contentZoneInstances[contentZoneName].push(instance);
                }

                parentNode.insertBefore(newElement, element == null ? null : (element.nextSibling?element.nextSibling.nextSibling:null));
                parentNode.insertBefore(this.getAddContentBlockTypeElement(newElement, contentZoneName), newElement.nextSibling);
            }

            /**
             * Adds an new content zone item before an existing element
             * @param {HTMLElement} parentNode      The parent node of the element
             * @param {HTMLElement} element         The element where the new element should be inserted before
             * @param {HTMLElement} newElement      The new element
             * @param {string}      contentZoneName The name of the elements content zone
             * @param {Instance}    instance        The ccm instance of the new content zone item
             */
            this.addContentZoneItemBefore = (parentNode, element, newElement, contentZoneName, instance = null) => {
                if (_contentZoneElements[contentZoneName] === undefined) {
                    _contentZoneElements[contentZoneName] = [];
                    _contentZoneInstances[contentZoneName] = [];
                }
                let elementIndex = element == null ? -1 : _contentZoneElements[contentZoneName].indexOf(element);
                if (elementIndex >= 0) {
                    _contentZoneElements[contentZoneName].splice(elementIndex, 0, newElement);
                    _contentZoneInstances[contentZoneName].splice(elementIndex, 0, instance);
                } else {
                    _contentZoneElements[contentZoneName].splice(0, 0, newElement);
                    _contentZoneInstances[contentZoneName].splice(0, 0, instance);
                }

                parentNode.insertBefore(newElement, element == null ? null : element);
                parentNode.insertBefore(this.getAddContentBlockTypeElement(newElement, contentZoneName), newElement.nextSibling);
            }

            /**
             * Removes an element from a content zone
             * @param {HTMLElement} element         The element that should be removed
             * @param {string}      contentZoneName The name of the elements content zone
             */
            this.removeZoneItem = (element, contentZoneName) => {
                let elementIndex = _contentZoneElements[contentZoneName].indexOf(element);
                if (elementIndex >= 0) {
                    _contentZoneElements[contentZoneName].splice(elementIndex, 1);
                    _contentZoneInstances[contentZoneName].splice(elementIndex, 1);
                    $.remove(element.nextSibling);
                    $.remove(element);
                } else {
                    console.error('Could not remove zone item. Please check zone management implementation!');
                }
            }

            /**
             * Adds the ability to edit content to an element
             * @param {HTMLElement} element         The element that should be given the ability
             * @param {string}      contentZoneName The name of the elements content zone
             */
            this.addContentEditing = (element, contentZoneName) => {
                // handle enter key input
                element.addEventListener('keydown', (e) => {
                    const selection = this.parent.element.parentNode.getSelection();
                    const range = selection.getRangeAt(0);
                    if (e.key === 'Enter' && range.collapsed) {
                        e.preventDefault();
                        $.remove(element.querySelector('div:last-child:not(.define-content-block-type)'));
                        $.remove(element.querySelector('br:nth-child(2)'));

                        if (element.innerHTML != '') {
                            const selection = this.parent.element.parentNode.getSelection();
                            const ranges = this.splitNode(selection, element);
                            const fragment = ranges.next.extractContents();
                            const translateDiv = document.createElement('div');
                            translateDiv.appendChild(fragment);

                            this.addParagraphAfter(element.parentNode, element, contentZoneName, translateDiv.innerHTML);
                        } else {
                            this.addParagraphAfter(element.parentNode, element, contentZoneName);
                        }
                    }
                });

                // handle backspace input
                element.addEventListener('keydown', (e) => {
                    const selection = this.parent.element.parentNode.getSelection();
                    const range = selection.getRangeAt(0);
                    if (e.key === "Backspace" && ((range.collapsed && range.startOffset == 0) || (!range.collapsed && range.start == 0 && range.endOffset == range.text.length))) {
                        if (element.previousSibling && element.previousSibling.previousSibling) {
                            e.preventDefault();
                            if (element.previousSibling.previousSibling.getAttribute('data-type') != 'themeDefinition' && element.previousSibling.previousSibling.getAttribute('data-type') != 'ccmComponent') {
                                this.placeCaretAtEnd(element.previousSibling.previousSibling);
                                while (element.childNodes.length > 0) {
                                    element.previousSibling.previousSibling.appendChild(element.childNodes[0]);
                                }
                                this.removeZoneItem(element, contentZoneName);
                            }
                        } else if (element.innerHTML == '') {
                            this.addParagraphAfter(element.parentNode, element, contentZoneName);
                            this.removeZoneItem(element, contentZoneName);
                        }
                    }
                });

                // handle text selection
                this.addContentEditingFormat(element, contentZoneName);
            }

            /**
             * Splits a node for a given selection
             * @param selection
             * @param root
             * @returns {{next: Range, current: Range, previous: Range}}
             * @author Arnav Bansal 2019
             * @see copied from https://dev.to/itsarnavb/how-do-you-split-contenteditable-text-preserving-html-formatting-g9d
             */
            this.splitNode = (selection, root) => {
                let range = selection.getRangeAt(0);
                let {firstChild, lastChild} = root;

                let previousRange = document.createRange();
                previousRange.setStart(firstChild, 0);
                previousRange.setEnd(range.startContainer, range.startOffset);

                let nextRange = document.createRange();
                nextRange.setStart(range.endContainer, range.endOffset);
                nextRange.setEnd(lastChild, lastChild.length);
                return {
                    previous: previousRange,
                    current: range,
                    next: nextRange,
                };
            }

            /**
             * Adds the ability to edit the format of contentEditable elements
             * @param {HTMLElement} element         The element that should be given the ability
             * @param {string}      contentZoneName The content zone name of the element
             */
            this.addContentEditingFormat = (element, contentZoneName) => {
                let mouseUpHandler = () => {
                    element.removeEventListener('mouseup', mouseUpHandler);
                    const selection = this.parent.element.parentNode.getSelection();
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();

                    // calc offsets
                    let getOffsetTop = (element) => {
                        if (element == null){
                            return 0;
                        }
                        if (element.nodeType == 1) {
                            return element.offsetTop + getOffsetTop(element.offsetParent) - element.scrollTop;
                        }
                        return getOffsetTop(element.offsetParent);
                    };
                    let getOffsetLeft = (element) => {
                        if (element == null){
                            return 0;
                        }
                        if (element.nodeType == 1) {
                            return element.offsetLeft + getOffsetLeft(element.offsetParent) - element.scrollLeft;
                        }
                        return getOffsetLeft(element.offsetParent);
                    };

                    if (!range.collapsed || (range.collapsed && element.contentZoneItem.type == 'header')) {
                        let hint = $.html(this.html.editInlineTool, {});
                        let left = (rect.left - getOffsetLeft(this.parent.element) + rect.width / 2);
                        if (left < 0) {
                            left = 0;
                        }
                        hint.style.left = left + 'px';
                        hint.style.top = (rect.top - getOffsetTop(this.parent.element)) + 'px';
                        $.append(this.parent.element, hint);

                        if (left < hint.getBoundingClientRect().width / 2) {
                            hint.style.transform = 'translate(0, calc(-100% - 4px))';
                            hint.style.left = '0';
                        }

                        //handle buttons
                        ['bold', 'italic', 'underline', 'strikeThrough', 'removeFormat', 'header'].forEach(item => {
                            hint.querySelectorAll('img[data-action="' + item + '"]').forEach(button => {
                                if (
                                    (range.collapsed && button.getAttribute('data-only-with-range'))
                                    || (button.getAttribute('data-type') && JSON.parse(button.getAttribute('data-type')).indexOf(element.contentZoneItem.type) < 0)
                                    || (button.getAttribute('data-type-not') && button.getAttribute('data-type-not') == element.contentZoneItem.type)
                                ) {
                                    button.style.display = 'none';
                                }
                                button.addEventListener('mouseup', () => {
                                    if (item == 'header') {
                                        this.addHeaderAfter(element.parentNode, element, contentZoneName, parseInt(button.getAttribute('data-header-level')), element.innerHTML);
                                        this.removeZoneItem(element, contentZoneName);
                                        remove();
                                    } else {
                                        selection.addRange(range);
                                        document.execCommand(item);
                                    }
                                });
                            });
                        });

                        let remove = () => {
                            $.remove(hint);
                        };

                        // handle the selection of contents
                        let handler = () => {
                            window.removeEventListener('mousedown', handler);
                            let handler2 = () => {
                                window.removeEventListener('mouseup', handler2);
                                remove();
                                const selection = this.parent.element.parentNode.getSelection();
                                if (selection.rangeCount == 1 && range.collapsed && element.contentZoneItem.type != 'header') {
                                    mouseUpHandler();
                                }
                            }
                            window.addEventListener('mouseup', handler2);
                        }
                        window.addEventListener('mousedown', handler);

                        let handler3 = () => {
                            window.removeEventListener('selectstart', handler3);
                            remove();
                        };
                        window.addEventListener('selectstart', handler3);
                        let handler4 = () => {
                            window.removeEventListener('keydown', handler4);
                            remove();
                        };
                        window.addEventListener('keydown', handler4);
                    }
                };
                element.addEventListener('selectstart', () => {
                    element.addEventListener('mouseup', mouseUpHandler);
                });
            };

            /**
             * Add the the remove and enter handling for content
             * @param {HTMLElement} element The element
             * @param {string}      contentZoneName The content zone name
             */
            this.addContentRemoveAndEnterHandling = (element, contentZoneName) => {
                // handle backspace key input
                element.addEventListener('keydown', (e) => {
                    if (e.key == 'Backspace' || e.key == 'Delete') {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        e.preventDefault();
                        if (range.collapsed) {
                            if (range.startOffset == 0 && e.key != 'Delete') {
                                if (element.previousSibling && element.previousSibling.previousSibling && element.previousSibling.previousSibling.innerHTML == '') {
                                    this.removeZoneItem(element.previousSibling.previousSibling, contentZoneName);
                                }
                            } else {
                                if (e.key == 'Delete' && element.nextSibling && element.nextSibling.nextSibling) {
                                    element.nextSibling.nextSibling.focus();
                                } else if (e.key == 'Backspace' && element.previousSibling && element.previousSibling.previousSibling) {
                                    this.placeCaretAtEnd(element.previousSibling.previousSibling);
                                } else {
                                    this.addParagraphAfter(element.parentNode, element, contentZoneName);
                                }

                                this.removeZoneItem(element, contentZoneName);
                            }
                        }
                    }
                });

                // handle enter key input
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        e.preventDefault();
                        $.remove(element.querySelector('div:last-child:not(.content-component)'));
                        $.remove(element.querySelector('br'));

                        if (range.collapsed) {
                            if (range.startOffset == 0) {
                                this.addParagraphBefore(element.parentNode, element, contentZoneName);
                            } else {
                                this.addParagraphAfter(element.parentNode, element, contentZoneName);
                            }
                        }
                    }
                });
            };

            /**
             * Adds the content block type element to switch from an empty paragraph to an other content block type
             * @param {HTMLElement} element         The element
             * @param {string}      contentZoneName The elements content zone name
             * @returns {*}
             */
            this.getAddContentBlockTypeElement = (element, contentZoneName) => {
                const definer = $.html(this.html.defineBlockType, {});

                let focused = false;
                element.addEventListener('focus', () => {
                    focused = true;
                    element.classList.add('focus');
                });

                // Handle focus rendering
                let mouseDown = false
                definer.addEventListener('mousedown', () => {
                    mouseDown = true;
                });
                definer.addEventListener('mouseup', () => {
                    mouseDown = false;
                });
                definer.addEventListener('click', () => {
                    element.focus();
                });
                element.addEventListener('focusout', () => {
                    focused = false;
                    if (!mouseDown) {
                        setTimeout(() => element.classList.remove('focus'), 100);
                    }
                });

                let replaceWith = (newElement) => {
                    let parentNode = element.parentNode;
                    this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName);
                    this.removeZoneItem(element, contentZoneName);
                }

                // header button
                const headerButton = definer.querySelector('img[data-type="header"]');
                headerButton.addEventListener('click', () => {
                    let newElement = this.getHeaderElement(contentZoneName);
                    replaceWith(newElement);
                    newElement.focus();
                });

                // list button
                const listButton = definer.querySelector('img[data-type="list"]');
                listButton.addEventListener('click', () => {
                    let newElement = this.getListElement(contentZoneName);
                    replaceWith(newElement);
                    newElement.focus();
                });

                // image button
                const imageButton = definer.querySelector('img[data-type="image"]');
                imageButton.addEventListener('click', () => {
                    // Create cloudinary widget
                    const cloudinaryWidget = cloudinary.createUploadWidget(
                        {
                            cloudName: 'dyhjqgkca',
                            uploadPreset: 'y6tm2ylf',
                            sources: ['local'],
                            googleApiKey: 'AIrFcR8hKiRo',
                            multiple: false,
                            resourceType: 'image',
                            palette: {
                                windowBorder: '#000000'
                            }
                        },
                        (error, result) => {
                            if (!error && result && result.event === "success") {
                                const imgData = result.info;
                                let newElement = this.getNewImageElement(contentZoneName, imgData.secure_url.replace('/image/upload/', '/image/upload/q_auto,w_auto,dpr_auto,c_scale/c_limit,w_2048/'));
                                replaceWith(newElement);
                                this.placeCaretAtEnd(newElement);
                            }
                        }
                    );
                    cloudinaryWidget.open();
                });

                // component button
                const componentButton = definer.querySelector('img[data-type="component"]');
                componentButton.addEventListener('click', () => {
                    const event = new CustomEvent("pageRendererAddComponent", {
                        detail: {
                            addThemeDefinitionFunction: async (themeDefinitionKey) => {
                                replaceWith(await this.getNewThemeDefinitionElement(contentZoneName, themeDefinitionKey, _contentZoneElements[contentZoneName].indexOf(element)))
                            },
                            addDmsContentComponentFunction: async (ccmUrl, ccmConfig) => {
                                replaceWith(await this.getNewCcmComponentElement(contentZoneName, ccmUrl, ccmConfig, _contentZoneElements[contentZoneName].indexOf(element)))
                            }
                        }
                    });
                    window.dispatchEvent(event);
                });

                return definer;
            }

            /**
             * Returns the count of cached zone elements for a zone name
             * @param {string}  contentZoneName The name of the content zone
             * @returns {number}
             */
            this.getContentZoneElementCount = (contentZoneName) => {
                if (_contentZoneElements[contentZoneName] === undefined) {
                    return 0;
                }
                return _contentZoneElements[contentZoneName].length;
            }

            /**
             * Returns an content zone object for an content zone name
             * @param {string}  contentZoneName
             * @returns {[]}
             */
            this.getContentZone = (contentZoneName) => {
                let re = [];
                if (_contentZoneElements[contentZoneName] !== undefined) {
                    for (let zoneElement of _contentZoneElements[contentZoneName]) {
                        let elementType = zoneElement.getAttribute('data-type');
                        let obj = {
                            type: elementType,
                            data: zoneElement.getDataContent ? zoneElement.getDataContent(): {},
                        };
                        obj.contentZones = {};
                        if (elementType == 'themeDefinition' && zoneElement.ccmInstance.core && zoneElement.ccmInstance.core.getContentZones) {
                            obj.contentZones = zoneElement.ccmInstance.core.getContentZones()
                        }
                        re.push(obj);
                    }
                }
                return re;
            };

            /**
             * Returns all content zones belonging to parent
             * @returns {{}}
             */
            this.getContentZones = () => {
                let re = {};
                for (let contentZoneName in _contentZoneElements) {
                    re[contentZoneName] = this.getContentZone(contentZoneName);
                }
                return re;
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();