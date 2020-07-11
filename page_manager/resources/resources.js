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
        "component_manager": ["ccm.component", "/modularcms-components/component_manager/versions/ccm.component_manager-4.0.0.js", ["ccm.get","/modularcms-components/page_manager/resources/resources.js","component_manager"]],
        "component_submit_builder": ["ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.3.js", ["ccm.get","/modularcms-components/page_manager/resources/resources.js","submit_builder"]]
    },

    "json_builder": {
        "nosubmit": true,
        "autofocus": false
    },

    "component_manager": {
        "html.1": "https://modularcms.github.io/modularcms-components/page_manager/resources/html/component_manager.html",
        "css.1": "https://modularcms.github.io/modularcms-components/page_manager/resources/css/component_manager.css",
        "builder": [ "ccm.component", "https://modularcms.github.io/modularcms-components/app_builder/versions/ccm.app_builder-4.2.0.js", [ "ccm.get", "https://modularcms.github.io/modularcms-components/page_manager/resources/resources.js", "app_builder" ] ],
        "component_details": [ "ccm.component", "https://ccmjs.github.io/akless-components/content/versions/ccm.content-5.4.7.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/content/resources/configs.js", "component_meta" ] ],
        "data": {
            "store": [ "ccm.store", { "name": "dms-components", "url": "https://ccm2.inf.h-brs.de" } ],
            "key": "cloze-7-0-0"
        },
        "default_demo": true,
        "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "component_meta_edit" ] ],
        "ignore": {
            "builder": [ "ccm.component", "https://ccmjs.github.io/akless-components/json_builder/versions/ccm.json_builder-2.1.0.js", { "directly": true, "nosubmit": true } ],
            "configs": [ "ccm.store", { "name": "dms-configs", "url": "https://ccm2.inf.h-brs.de" } ]
        },
        "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/component_manager/resources/resources.js", "lang" ] ],
        "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js", { "app": "component_manager" } ],
        "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/component_manager/resources/resources.js", "user" ] ]
    },

    "app_builder": {
        "html.1": "https://modularcms.github.io/modularcms-components/page_manager/resources/html/app_builder.html",
        "app": [ "ccm.component", "https://ccmjs.github.io/akless-components/cloze/versions/ccm.cloze-7.0.0.js" ],
        "data": {
            "store": [ "ccm.store", { "name": "dms-configs", "url": "https://ccm2.inf.h-brs.de" } ]
        },
        "form": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.1.1.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/submit/resources/configs.js", "app_meta_create" ] ],
        "handover_app": [ "ccm.component", "https://ccmjs.github.io/akless-components/handover_app/versions/ccm.handover_app-2.0.0.js", {
            "qr_code": [ "ccm.load", "https://ccmjs.github.io/akless-components/libs/qrcode-generator/qrcode.min.js" ],
//    "window": [ "ccm.component", "https://ccmjs.github.io/akless-components/window/versions/ccm.window-1.0.0.js" ]
        } ],
        "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/app_builder/resources/resources.js", "lang" ] ],
        "meta_store": [ "ccm.store", { "url": "https://ccm2.inf.h-brs.de", "name": "dms-apps" } ],
        "modal_dialog": [ "ccm.component", "https://ccmjs.github.io/tkless-components/modal/versions/ccm.modal-2.0.0.js", {
            "css": [ "ccm.load",
                "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
                { "context": "head", "url": "https://use.fontawesome.com/releases/v5.6.3/css/all.css" }
            ]
        } ],
        "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/app_builder/resources/resources.js", "user" ] ]
    },

    "submit_builder": {
        "data": {},
        "onfinish": {
            "store": true,
            "alert": "Saved!"
        },
        "helper": [
            "ccm.load",
            {
                "url": "https://ccmjs.github.io/akless-components/modules/helper.mjs"
            }
        ],
        "css": [
            "ccm.load",
            [
                [
                    "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css",
                    {
                        "url": "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp",
                        "type": "css"
                    },
                    {
                        "url": "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp",
                        "type": "css",
                        "context": "head"
                    }
                ],
                "https://ccmjs.github.io/akless-components/submit/resources/default_b4.css"
            ]
        ],
        "html": [
            "ccm.load",
            "https://ccmjs.github.io/akless-components/submit/resources/templates_b4.html"
        ]
    }
};