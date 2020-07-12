/**
 * @overview data-based resources of ccm component for page management
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {
    "live": {},

    /** test configuration (relative paths) */
    "local": {
        "css.1": "/modularcms-components/page_manager/resources/css/style.css",
        "css.2": "/modularcms-components/cms/resources/css/global.css",
        "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
        "html.1": "/modularcms-components/page_manager/resources/html/page_manager.html",
        "routing_sensor": ["ccm.instance", "/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js"],
        "routing": [ "ccm.instance", "/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "/modularcms-components/cms/resources/resources.js", "routing" ] ],
        "data_controller": [ "ccm.instance", "/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
        "pageRendererUrl": "/modularcms-components/page_renderer/versions/ccm.page_renderer-1.0.0.js",
        "layout_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
        "theme_json_builder": [ "ccm.instance", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", [ "ccm.get", "/modularcms-components/page_manager/resources/resources.js", "json_builder" ] ],
    },

    "json_builder": {
        "nosubmit": true,
        "autofocus": false
    }
};