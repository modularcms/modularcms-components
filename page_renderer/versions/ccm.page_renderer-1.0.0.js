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

            let _themeComponent = null;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.start = async () => {
                await this.update();
            };

            this.update = async (key = null, value) => {
                if (key) {
                    this[key] = value;
                }
                if (window.modularcms == undefined) {
                    window.modularcms = {};
                }
                if (window.modularcms.themes == undefined) {
                    window.modularcms.themes = {};
                }
                if (window.modularcms.themes[this.page.themeKey] === undefined) {
                    window.modularcms.themes[this.page.themeKey] = await this.data_controller.getTheme(this.websiteKey, this.page.themeKey);
                }
                let theme = window.modularcms.themes[this.page.themeKey];

                if (window.modularcms.themeComponents == undefined) {
                    window.modularcms.themeComponents = {};
                }
                if (window.modularcms.themeComponents[this.page.themeKey] === undefined) {
                    window.modularcms.themeComponents[this.page.themeKey] = await this.ccm.component(theme.ccmComponent.url, theme.ccmComponent.config);
                }

                const themeConfig = {};
                Object.assign(themeConfig, this.page.themeConfig, {
                    parent: this,
                    contentZones: this.page.contentZones,
                    zoneItem: {type: 'theme', data: {}, config:{}},
                    websiteKey: this.websiteKey,
                    page: this.page,
                    edit: this.edit,
                    parentZoneName: null,
                    root: this.element
                });
                if (window.modularcms.themeKeyBefore !== this.page.themeKey) {
                    _themeComponent = await window.modularcms.themeComponents[this.page.themeKey].start(themeConfig);
                    window.modularcms.themeKeyBefore = this.page.themeKey;
                } else {
                    Object.assign(_themeComponent, themeConfig);
                    _themeComponent.update();
                }
            }

            this.getContentZones = () => {
                if (_themeComponent != null) {
                    return _themeComponent.core.getContentZones();
                }
                return {};
            }
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();