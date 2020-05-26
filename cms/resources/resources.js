ccm.files[ 'resources.js' ] = {
/** test configuration (relative paths) */
"local": {
    "add_version": true,
    "apps": [ "ccm.store", { "name": "dms-apps", "url": "https://ccm2.inf.h-brs.de" } ],
    "css.1": "../cms/resources/css/colors.css",
    "css.2": "../cms/resources/css/style.css",
    "components": [ "ccm.store", { "name": "dms-components", "url": "https://ccm2.inf.h-brs.de" } ],
    "default_icon": "../cms/resources/img/default.png",
    "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
    "html.1": "../cms/resources/html/cms.html",
//  "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ],
    "logo": "../cms/resources/img/logo.svg",
        }};