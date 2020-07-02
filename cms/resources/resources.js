ccm.files[ 'resources.js' ] = {
    "live": {},
/** test configuration (relative paths) */
    "local": {
        "css.1": "/modularcms-components/cms/resources/css/colors.css",
        "css.2": "/modularcms-components/cms/resources/css/style.css",
        "css.3": "/modularcms-components/cms/resources/css/global.css",
        "default_icon": "/modularcms-components/cms/resources/img/default.png",
        "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
        "html.1": "/modularcms-components/cms/resources/html/cms.html",
    //  "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ],
        "logo": "/modularcms-components/cms/resources/img/logo.svg",
        "user": [ "ccm.instance", "/modularcms-components/user/versions/ccm.user-10.0.0.js", [ "ccm.get", "/modularcms-components/user/resources/resources.js", "local" ] ],
        "routing": [ "ccm.instance", "/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "/modularcms-components/user/resources/resources.js", "routing" ] ],
        "routing_sensor": [ "ccm.instance", "/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
        "page_manager": [ "ccm.instance", "/modularcms-components/page_manager/versions/ccm.page_manager-1.0.0.js", [ "ccm.get", "/modularcms-components/page_manager/resources/resources.js", "local" ] ],
        "website_manager": [ "ccm.instance", "/modularcms-components/website_manager/versions/ccm.website_manager-1.0.0.js", [ "ccm.get", "/modularcms-components/website_manager/resources/resources.js", "local" ] ],
        "data_controller": [ "ccm.instance", "/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
        "user_manager": [ "ccm.instance", "/modularcms-components/user_manager/versions/ccm.user_manager-1.0.0.js", [ "ccm.get", "/modularcms-components/user_manager/resources/resources.js", "local" ] ],
        "theme_definition_manager": [ "ccm.instance", "/modularcms-components/theme_definition_manager/versions/ccm.theme_definition_manager-1.0.0.js", [ "ccm.get", "/modularcms-components/theme_definition_manager/resources/resources.js", "local" ] ],
        "profile_editor": [ "ccm.instance", "/modularcms-components/profile_editor/versions/ccm.profile_editor-1.0.0.js", [ "ccm.get", "/modularcms-components/profile_editor/resources/resources.js", "local" ] ]
},
    "routing": {
        "entrypoint": "/"
    }
};