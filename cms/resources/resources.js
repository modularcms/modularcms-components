ccm.files[ 'resources.js' ] = {
    "live": {
        "add_version": true
    },
/** test configuration (relative paths) */
    "local": {
        "add_version": true,
        "css.1": "../cms/resources/css/colors.css",
        "css.2": "../cms/resources/css/style.css",
        "default_icon": "../cms/resources/img/default.png",
        "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
        "html.1": "../cms/resources/html/cms.html",
    //  "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ],
        "logo": "../cms/resources/img/logo.svg",
        "user": [ "ccm.instance", "../user/versions/ccm.user-10.0.0.js", [ "ccm.get", "../cms/resources/resources.js", "userlocal" ] ]
    },
    "usercomp": {
        "realm": "default",
        "url": "https://auth.modularcms.io/login"
    },
    "userlocal": {
        "css.1": "../user/resources/default.css",
        "realm": "default",
        "url": "https://auth.modularcms.io/login"
    }
};