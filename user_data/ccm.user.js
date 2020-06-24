/**
 * @overview ccm component for the user data
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 * @changes
 */

( () => {

    const component = {

        name: 'user',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {},

        Instance: function () {
            this.isLoggedIn = () => {
                return sessionStorage.getItem('ccm-user-modularcms') != null;
            }
            this.getRealm = () => {
                return 'modularcms';
            }
            this.data = () => {
                const content = sessionStorage.getItem('ccm-user-modularcms');
                if (content != null) {
                    return JSON.parse(content);
                }
                return null;
            }
        }
    }
    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();