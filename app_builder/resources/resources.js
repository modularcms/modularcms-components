/**
 * @overview data-based resources of ccm component for app creation
 * @author André Kless <andre.kless@web.de> 2019-2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {

  /** test configuration (relative paths) */
  "local": {
    //"app": [ "ccm.component", "https://ccmjs.github.io/akless-components/multi_blank/ccm.multi_blank.js" ],
    "app": [ "ccm.component", "https://ccmjs.github.io/akless-components/cloze/versions/ccm.cloze-7.0.0.js" ],
    "builder.1": "../json_builder/ccm.json_builder.js",
    "css.1": "../app_builder/resources/styles.css",
    //"data": { "times": 5 },
    //"data": { "store": [ "ccm.store", { "app": { "times": 5 } } ], "key": "app" },
    //"data": { "store": [ "ccm.store", { "name": "apps" } ], "key": "app" },
    "data": { "store": [ "ccm.store", { "name": "dms-configs", "url": "https://ccm2.inf.h-brs.de" } ] },
    //"data": { "store": [ "ccm.store", { "name": "dms-configs", "url": "https://ccm2.inf.h-brs.de" } ], "key": "1562611840656X9787377358125973" },
    //"data": { "store": [ "ccm.store", { "name": "dms-configs", "url": "https://ccm2.inf.h-brs.de" } ], "key": { "key": "default", "keywords": true } },
    "form": [ "ccm.component", "../submit/ccm.submit.js", [ "ccm.get", "../submit/resources/configs.js", "app_meta_create" ] ],
    "handover_app": [ "ccm.component", "../handover_app/ccm.handover_app.js", {
      "qr_code": [ "ccm.load", "../libs/qrcode-generator/qrcode.min.js" ],
//    "window": [ "ccm.component", "../window/ccm.window.js" ]
    } ],
    "helper.1": "../modules/helper.mjs",
    "html.1": "../app_builder/resources/templates.html",
    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", [ "ccm.get", "../app_builder/resources/resources.js", "lang" ] ],
    "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ],
    "meta_store": [ "ccm.store", { "url": "https://ccm2.inf.h-brs.de", "name": "dms-apps" } ],
    "modal_dialog": [ "ccm.component", "https://ccmjs.github.io/tkless-components/modal/versions/ccm.modal-2.0.0.js", {
      "css": [ "ccm.load",
        "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
        { "context": "head", "url": "https://use.fontawesome.com/releases/v5.6.3/css/all.css" }
      ]
    } ],
    "onchange": ( instance, event ) => { console.log( event, instance.getValue() ); },
    "user": [ "ccm.start", "../user/ccm.user.js", [ "ccm.get", "../app_builder/resources/resources.js", "user" ] ]
  },

  /** live configuration (used by Digital Makerspace) */
  "live": {
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

  /** configuration for multilingualism */
  "lang": {
    "translations": {
      "de": {
        "flag": "https://ccmjs.github.io/tkless-components/lang/resources/de.svg"
      },
      "en": {
        "flag": "https://ccmjs.github.io/tkless-components/lang/resources/en.svg"
      }
    },
    "active": "en"
  },

  /** configuration for user authentication */
  "user": {
    "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
    "realm": "cloud",
    "store": "dms-user",
    "url": "https://ccm2.inf.h-brs.de"
  }

};
