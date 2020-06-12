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
        "routing": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing/versions/ccm.routing-1.0.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/cms/resources/resources.js", "routing" ] ],
    }
};