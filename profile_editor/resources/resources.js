/**
 * @overview data-based resources of ccm component for page management
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {
    "live": {},

    /** test configuration (relative paths) */
    "local": {
        "css.1": "/modularcms-components/profile_editor/resources/css/style.css",
        "css.2": "/modularcms-components/cms/resources/css/global.css",
        "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
        "html.1": "/modularcms-components/profile_editor/resources/html/profile_editor.html",
        "routing_sensor": ["ccm.instance", "/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js"],
        "routing": [ "ccm.instance", "/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "/modularcms-components/cms/resources/resources.js", "routing" ] ],
        "data_controller": [ "ccm.instance", "/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
        "userAvatarPlaceholder": "/modularcms-components/cms/resources/img/no-user-image.svg"
    }
};