/**
 * @overview ccm component for page construction
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'page_renderer',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "edit": false
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            let _themeComponent = null;
            let _themeComponentUrl = null;
            let _theme = null;


            this.start = async () => {
                await this.update();
            };

            this.update = async () => {
                if (_theme == null || _theme.themeKey != this.page.themeKey) {
                    _theme = await this.data_controller.getTheme(this.websiteKey, this.page.themeKey);
                }

                const themeConfig = {};
                Object.assign(themeConfig, _theme.ccmComponent.config, this.page.themeConfig, {
                    parent: this,
                    contentZones: this.page.contentZones,
                    websiteKey: this.websiteKey,
                    page: this.page,
                    edit: this.edit
                });
                if (_themeComponent == null || _themeComponentUrl != _theme.ccmComponent.url) {
                    _themeComponent = await this.ccm.start(_theme.ccmComponent.url, themeConfig);
                } else {
                    Object.assign(_themeComponent, themeConfig);
                    _themeComponent.update();
                }
                $.setContent(this.element, _themeComponent.root);
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();