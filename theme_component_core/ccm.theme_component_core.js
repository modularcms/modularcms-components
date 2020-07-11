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
            let _themeDefinitionComponents = {};

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
                            } else if (this.checkIfZoneComponentAtIndexIsEqual(contentZoneName, contentZoneItem, i)) {
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
                                appendElement.parentNode.insertBefore(this.getAddContentBlockTypeElement(appendElement), appendElement.nextSibling, contentZoneName);
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

                // handle block config
                if (edit && zoneItem.type == 'themeDefinition' && zoneItem.data.themeDefinitionType == 'block') {
                    this.addEditFocusHandling(element, parentZoneName);
                }
            };

            this.addEditFocusHandling = (element, parentZoneName) => {
                // handle focusing
                this.parent.parent.element.addEventListener('click', (e) => {
                    if (e.target != this.parent.root && element) {
                        element.classList.remove('edit-focus');
                    }
                });
                element.addEventListener('click', () => {
                    element.classList.add('edit-focus');
                });
                let editThemeDefinition = $.html(this.html.editThemeDefinition, {});
                $.append(element, editThemeDefinition);

                // handle remove button
                const removeButton = editThemeDefinition.querySelector('img[data-action="remove"');
                removeButton.addEventListener('click', () => {
                    if (confirm('Do you really want to remove this block?')) {
                        const event = new CustomEvent("pageRendererRemoveBlock", {
                            detail: {}
                        });
                        window.dispatchEvent(event);
                        this.parent.parent.core.removeZoneItem(element, parentZoneName);
                    }
                });

                // handle edit button
                const configButton = editThemeDefinition.querySelector('img[data-action="config"');
                let configParent = this.parent;
                configButton.addEventListener('click', () => {
                    let updateConfig = async (config) => {
                        let newElement = await configParent.parent.core.updateThemeDefinitionElementConfig(
                            configParent.parent.element.querySelector('.content-zone[data-content-zone-name="' + parentZoneName + '"]'),
                            configParent.root,
                            configParent.zoneItem,
                            parentZoneName,
                            configParent,
                            config
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
                        addFunction: (selectedThemeDefinitionKey) => {
                            this.createBlock(this.parent.element.querySelector('.content-zone[data-content-zone-name="' + contentZoneName + '"]'), contentZoneName, selectedThemeDefinitionKey);
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

            // inspiried by https://stackoverflow.com/questions/12027137/javascript-trick-for-paste-as-plain-text-in-execcommand
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

            this.getNewThemeDefinitionElement = async (contentZoneName, themeDefinitionKey) => {
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;

                if (_themeDefinitions[themeDefinitionKey] === undefined) {
                    _themeDefinitions[themeDefinitionKey] = await this.data_controller.getThemeDefinition(websiteKey, page.themeKey, themeDefinitionKey);
                }
                return await this.getThemeDefinitionElement(contentZoneName, {
                    type: 'themeDefinition',
                    data: {
                        themeDefinitionKey: themeDefinitionKey,
                        themeDefinitionType: _themeDefinitions[themeDefinitionKey].type
                    },
                    config: {}
                })
            };

            this.getThemeDefinitionElement = async (contentZoneName, contentZoneItem) => {
                const websiteKey = this.parent.websiteKey;
                const page = this.parent.page;
                const edit = this.parent.edit;

                // init theme definition
                if (_themeDefinitions[contentZoneItem.data.themeDefinitionKey] === undefined) {
                    _themeDefinitions[contentZoneItem.data.themeDefinitionKey] = await this.data_controller.getThemeDefinition(websiteKey, page.themeKey, contentZoneItem.data.themeDefinitionKey);
                }
                if (_themeDefinitionComponents[contentZoneItem.data.themeDefinitionKey] === undefined) {
                    _themeDefinitionComponents[contentZoneItem.data.themeDefinitionKey] = await this.ccm.component(_themeDefinitions[contentZoneItem.data.themeDefinitionKey].ccmComponent.url, _themeDefinitions[contentZoneItem.data.themeDefinitionKey].ccmComponent.config);
                }
                const themeDefinition = _themeDefinitions[contentZoneItem.data.themeDefinitionKey];
                if (themeDefinition) {
                    let config = {};
                    Object.assign(config, contentZoneItem.data.config, {
                        parent: this.parent,
                        zoneItem: contentZoneItem,
                        contentZones: contentZoneItem.contentZones,
                        websiteKey: websiteKey,
                        page: page,
                        edit: edit,
                        parentZoneName: contentZoneName
                    });
                    const component = await _themeDefinitionComponents[contentZoneItem.data.themeDefinitionKey].start(config);
                    //let element = _contentZoneComponents[contentZoneName][i].root;
                    let element = component.root;
                    element.contentZoneItem = contentZoneItem;
                    element.ccmInstance = component;
                    element.themeDefinitionType = themeDefinition.type;

                    // define content get method
                    element.getDataContent = () => {
                        return {
                            themeDefinitionKey: themeDefinition.themeDefinitionKey,
                            themeDefinitionType: themeDefinition.type,
                            config: contentZoneItem.data.config
                        };
                    };

                    element.setAttribute('data-type', contentZoneItem.type);
                    return element;
                }

                return null;
            }

            this.getCcmComponentElement = async (contentZoneName, contentZoneItem, i) => {
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
                let element = _contentZoneComponents[contentZoneName][i].root;
                element.contentZoneItem = contentZoneItem;
                element.setAttribute('data-type', contentZoneItem.type);
                return element;
            }

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
                        text: element.innerHTML
                    };
                };

                this.addContentPasteHandling(element, contentZoneName);

                element.setAttribute('data-type', contentZoneItem.type);

                return element;
            }

            this.addHeaderAfter = (parentNode, element, contentZoneName, level = 2, content='') => {
                let newElement = this.getHeaderElement(contentZoneName, {contentZones:{}, type: 'header', data: {level: level, text: content}});
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName)
                newElement.focus();
            };

            this.addParagraphAfter = (parentNode, element, contentZoneName, content='') => {
                let newElement = this.getParagraphElement(contentZoneName, {contentZones:{}, type: 'paragraph', data: {text: content}});
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName)
                newElement.focus();
                if (content != '') {
                    newElement.classList.add('has-content');
                }
                return newElement;
            };

            this.addParagraphBefore = (parentNode, element, contentZoneName, content='') => {
                let newElement = this.getParagraphElement(contentZoneName, {contentZones:{}, type: 'paragraph', data: {text: content}});
                this.addContentZoneItemBefore(parentNode, element, newElement, contentZoneName)
                newElement.focus();
            };

            this.addThemeDefinitionAfter = async (parentNode, element, contentZoneName, themeDefinitionKey) => {
                let newElement = await this.getNewThemeDefinitionElement(contentZoneName, themeDefinitionKey);
                this.addContentZoneItemAfter(parentNode, element, newElement, contentZoneName, newElement.ccmInstance);
                if (newElement.themeDefinitionType == 'block') {
                    newElement.ccmInstance.element.querySelectorAll('.content-zone').forEach(item => {
                        newElement.ccmInstance.core.addParagraphAfter(item, null, item.getAttribute('data-content-zone-name'));
                    });
                }
                newElement.focus();
                return newElement;
            };

            this.createBlock = async (parentNode, contentZoneName, themeDefinitionKey) => {
                let addBlock = this.parent.element.querySelector('.content-zone[data-content-zone-name="' + contentZoneName + '"] .add-block');
                let newElement = await this.addThemeDefinitionAfter(parentNode, null, contentZoneName, themeDefinitionKey);
                newElement.ccmInstance.element.classList.add('edit-focus');
                parentNode.insertBefore(addBlock, null);
            }

            this.addContentZoneItemAfter = (parentNode, element, newElement, contentZoneName, component = null) => {
                if (_contentZoneElements[contentZoneName] === undefined) {
                    _contentZoneElements[contentZoneName] = [];
                    _contentZoneComponents[contentZoneName] = [];
                }
                let elementIndex = element == null ? -1 : _contentZoneElements[contentZoneName].indexOf(element);
                if (elementIndex >= 0) {
                    _contentZoneElements[contentZoneName].splice(elementIndex + 1, 0, newElement);
                    _contentZoneComponents[contentZoneName].splice(elementIndex + 1, 0, component);
                } else {
                    _contentZoneElements[contentZoneName].push(newElement);
                    _contentZoneComponents[contentZoneName].push(component);
                }

                parentNode.insertBefore(newElement, element == null ? null : (element.nextSibling?element.nextSibling.nextSibling:null));
                parentNode.insertBefore(this.getAddContentBlockTypeElement(newElement, contentZoneName), newElement.nextSibling);
            }

            this.addContentZoneItemBefore = (parentNode, element, newElement, contentZoneName, component = null) => {
                if (_contentZoneElements[contentZoneName] === undefined) {
                    _contentZoneElements[contentZoneName] = [];
                    _contentZoneComponents[contentZoneName] = [];
                }
                let elementIndex = element == null ? -1 : _contentZoneElements[contentZoneName].indexOf(element);
                if (elementIndex >= 0) {
                    _contentZoneElements[contentZoneName].splice(elementIndex, 0, newElement);
                    _contentZoneComponents[contentZoneName].splice(elementIndex, 0, component);
                } else {
                    _contentZoneElements[contentZoneName].splice(0, 0, newElement);
                    _contentZoneComponents[contentZoneName].splice(0, 0, component);
                }

                parentNode.insertBefore(newElement, element == null ? null : element);
                parentNode.insertBefore(this.getAddContentBlockTypeElement(newElement, contentZoneName), newElement.nextSibling);
            }

            this.removeZoneItem = (element, contentZoneName) => {
                let elementIndex = _contentZoneElements[contentZoneName].indexOf(element);
                if (elementIndex >= 0) {
                    _contentZoneElements[contentZoneName].splice(elementIndex, 1);
                    _contentZoneComponents[contentZoneName].splice(elementIndex, 1);
                } else {
                    console.warn('Check zone management implementation!');
                }

                $.remove(element.nextSibling);
                $.remove(element);
            }

            this.addContentEditing = (element, contentZoneName) => {
                if (element.innerHTML == '') {
                    element.classList.remove('has-content');
                } else {
                    element.classList.add('has-content');
                }
                element.addEventListener('keypress', (e) => {
                    const selection = this.parent.element.parentNode.getSelection();
                    const range = selection.getRangeAt(0);
                    if (e.key === 'Enter' && range.collapsed) {
                        e.preventDefault();
                        $.remove(element.querySelector('div:last-child:not(.define-content-block-type)'));

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
                element.addEventListener('keyup', (e) => {
                    if (element.innerHTML == '') {
                        element.classList.remove('has-content');
                    } else {
                        element.classList.add('has-content');
                    }
                });
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
                            this.removeZoneItem(element.parentNode, element, contentZoneName);
                        }
                    }
                });

                // handle text selection
                this.addContentEditingFormat(element, contentZoneName);
            }

            // copied from https://dev.to/itsarnavb/how-do-you-split-contenteditable-text-preserving-html-formatting-g9d
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

            this.addContentEditingFormat = (element, contentZoneName) => {
                let mouseUpHandler = () => {
                    element.removeEventListener('mouseup', mouseUpHandler);
                    const selection = this.parent.element.parentNode.getSelection();
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();

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

                        ['bold', 'italic', 'underline', 'strikeThrough', 'removeFormat', 'header'].forEach(item => {
                            hint.querySelectorAll('img[data-action="' + item + '"]').forEach(button => {
                                if (
                                    (range.collapsed && button.getAttribute('data-only-with-range'))
                                    || (button.getAttribute('data-type') && button.getAttribute('data-type') != element.contentZoneItem.type)
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
                                let newElement = this.getNewImageElement(contentZoneName, imgData.secure_url);
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
                            addThemeDefinition: (themeDefinitionKey) => {
                                replaceWith(this.getNewThemeDefinitionElement(contentZoneName, themeDefinitionKey))
                            }
                        }
                    });
                    window.dispatchEvent(event);
                });

                return definer;
            }

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
                    element.addEventListener('change', (e) => {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        let target = range.startContainer;
                        if (target.nodeType == 3) {
                            target = target.parentNode;
                        }
                        target.querySelectorAll('br').forEach(item => $.remove(item));
                    });
                    element.addEventListener('keyup', (e) => {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        let target = range.startContainer;
                        if (target.nodeType == 3) {
                            target = target.parentNode;
                        }
                        target.querySelectorAll('br').forEach(item => $.remove(item));
                        if (e.key === "Backspace" && (target.innerHTML == '' || target.innerHTML == '')) {
                            if (element.childElementCount == 0) {
                                if (element.previousSibling && element.previousSibling.previousSibling) {
                                    this.placeCaretAtEnd(element.previousSibling.previousSibling);
                                } else {
                                    this.addParagraphAfter(element.parentNode, element, contentZoneName);
                                }
                                this.removeZoneItem(element, contentZoneName);
                            }
                        }
                    });
                }

                element.setAttribute('data-list-style', contentZoneItem.data.style);
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

                element.addEventListener('keydown', (e) => {
                    if (e.key == 'Backspace') {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        e.preventDefault();
                        if (range.collapsed) {
                            if (range.startOffset == 0) {
                                if (element.previousSibling.previousSibling && element.previousSibling.previousSibling.innerHTML == '') {
                                    this.removeZoneItem(element.previousSibling.previousSibling, contentZoneName);
                                }
                            } else {
                                if (element.previousSibling && element.previousSibling.previousSibling) {
                                    this.placeCaretAtEnd(element.previousSibling.previousSibling);
                                } else {
                                    this.addParagraphAfter(element.parentNode, element, contentZoneName);
                                }
                                this.removeZoneItem(element, contentZoneName);
                            }
                        }
                    }
                });
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const selection = this.parent.element.parentNode.getSelection();
                        const range = selection.getRangeAt(0);
                        e.preventDefault();
                        $.remove(element.querySelector('div:last-child:not(.define-content-block-type)'));

                        if (range.collapsed) {
                            if (range.startOffset == 0) {
                                this.addParagraphBefore(element.parentNode, element, contentZoneName);
                            } else {
                                this.addParagraphAfter(element.parentNode, element, contentZoneName);
                            }
                        }
                    }
                });

                let img = document.createElement('img');
                let caption = null;

                img.src = contentZoneItem.data.file.url;
                img.loading = 'lazy';
                if (contentZoneItem.data.caption) {
                    caption = document.createElement('div');
                    caption.classList.add('image-caption');
                    caption.innerHTML = contentZoneItem.data.caption;
                }

                if (edit) {
                    img.addEventListener('click', () => {
                        this.placeCaretAtEnd(element);
                    });
                }

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

                this.addContentPasteHandling(element, contentZoneName, false);

                element.setAttribute('data-type', contentZoneItem.type);
                element.contentZoneItem = contentZoneItem;

                return element;
            }

            this.updateThemeDefinitionElementConfig = async (parentNode, element, zoneItem, contentZoneName, component, config) => {
                zoneItem.data.config = config;
                zoneItem.contentZones = component.core.getContentZones();
                let newElement = await this.getThemeDefinitionElement(contentZoneName, zoneItem);
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

            this.getContentZoneElementCount = (contentZoneName) => {
                if (_contentZoneElements[contentZoneName] === undefined) {
                    return 0;
                }
                return _contentZoneElements[contentZoneName].length;
            }

            this.getContentZone = (contentZoneName) => {
                let re = [];
                if (_contentZoneElements[contentZoneName] !== undefined) {
                    for (let zoneElement of _contentZoneElements[contentZoneName]) {
                        let elementType = zoneElement.getAttribute('data-type');
                        let obj = {
                            type: elementType,
                            data: zoneElement.getDataContent ? zoneElement.getDataContent(): {},
                        };
                        if (elementType == 'themeDefinition') {
                            obj.contentZones = zoneElement.ccmInstance.core.getContentZones()
                        }
                        re.push(obj);
                    }
                }
                return re;
            };

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