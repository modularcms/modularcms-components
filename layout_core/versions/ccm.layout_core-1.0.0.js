/**
 * @overview ccm component for theme helper functions
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'layout_core',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.start = async () => {

            };

            this.initContent = async (options = {}) => {
                // Set content
                const theme = $.setContent(this.parent.element, this.parent.html.main, options);

                // Init content
                const content = theme.querySelector('content');
                if (content != null && this.parent.parent.page !== undefined) {
                    const blocks = this.parent.parent.page.blocks;
                    const blocksWrapper = document.createElement('div');
                    blocksWrapper.classList.add('block-wrapper');

                    for (let block of blocks) {
                        let element = null;

                        switch (block.type) {
                            case 'header':
                                element = document.createElement('h' + block.data.level);
                                element.innerHTML = block.data.text;
                            case 'paragraph':
                                element = document.createElement('p');
                                element.innerHTML = block.data.text;
                            case 'list':
                                element = document.createElement(block.data.style == 'ordered'?'ol':'ul');
                                for (let item of block.data.items) {
                                    let itemElement = document.createElement('li')
                                    itemElement.innerHTML = item;
                                    element.appendChild(itemElement);
                                }
                            // TODO case 'image':
                            case 'ccmComponent':
                                element = document.createElement('div');
                                element.classList.add('ccm-component-block');
                                const component = await this.ccm.start(block.data.url, block.data.config);
                                $.setContent(element, component.root, {});
                        }
                        if (element != null) {
                            blocksWrapper.appendChild(element);
                        }
                        content.innerHTML = '';
                        $.setContent(content, blocksWrapper)
                    }
                }

            };
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();