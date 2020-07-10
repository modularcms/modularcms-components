/**
 * @overview data-based resources of ccm component for managing a component
 * @author André Kless <andre.kless@web.de> 2019-2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {

  /** test configuration (relative paths) */
  "local": {
    "builder": [ "ccm.component", "../app_builder/ccm.app_builder.js", [ "ccm.get", "../app_builder/resources/resources.js", "local" ] ],
    "component_details": [ "ccm.component", "../content/ccm.content.js", [ "ccm.get", "../content/resources/configs.js", "component_meta_test" ] ],
    "css.1": "../component_manager/resources/css/styles.css",
    "data": {
      "store": [ "ccm.store", { "name": "dms-components", "url": "https://ccm2.inf.h-brs.de" } ],
      "key": "cloze-7-0-0"
    },
    "default_demo": true,
    "form": [ "ccm.component", "../submit/ccm.submit.js", [ "ccm.get", "../submit/resources/configs.js", "component_meta_edit" ] ],
    "helper.1": "../modules/helper.mjs",
    "html.1": "../component_manager/resources/templates.html",
    "ignore": {
      "builder": [ "ccm.component", "../json_builder/ccm.json_builder.js", { "directly": true, "nosubmit": true } ],
      "configs": [ "ccm.store", { "name": "dms-configs", "url": "https://ccm2.inf.h-brs.de" } ]
    },
    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", [ "ccm.get", "../component_manager/resources/resources.js", "lang" ] ],
    "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ],
    "menu_app": [ "ccm.component", "../menu/ccm.menu.js", [ "ccm.get", "../component_manager/resources/resources.js", "menu_app" ] ],
    "menu_top": [ "ccm.component", "../menu/ccm.menu.js", [ "ccm.get", "../component_manager/resources/resources.js", "menu_top" ] ],
    "rating": [ "ccm.component", "https://ccmjs.github.io/tkless-components/star_rating/versions/ccm.star_rating-5.0.0.js", {
      "data": { "store": [ "ccm.store", { "name": "dms-components-ratings", "url": "https://ccm2.inf.h-brs.de" } ] },
      "user": [ "ccm.start", "../user/ccm.user.js", [ "ccm.get", "../component_manager/resources/resources.js", "user" ] ]
    } ],
    "rating_result": [ "ccm.component", "https://ccmjs.github.io/tkless-components/star_rating_result/versions/ccm.star_rating_result-5.0.0.js", {
      "data": { "store": [ "ccm.store", { "name": "dms-components-ratings", "url": "https://ccm2.inf.h-brs.de" } ] },
      "detailed": true,
      "user": [ "ccm.start", "../user/ccm.user.js", [ "ccm.get", "../component_manager/resources/resources.js", "user" ] ]
    } ],
    "routing": [ "ccm.instance", "../routing/ccm.routing.js", { "app": "component_manager" } ],
    "user": [ "ccm.start", "../user/ccm.user.js", [ "ccm.get", "../component_manager/resources/resources.js", "user" ] ]
  },

  /** live configuration (used by Digital Makerspace) */
  "live": {
    "builder": [ "ccm.component", "https://ccmjs.github.io/akless-components/app_builder/versions/ccm.app_builder-4.2.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/app_builder/resources/resources.js", "live" ] ],
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
    "rating": [ "ccm.component", "https://ccmjs.github.io/tkless-components/star_rating/versions/ccm.star_rating-5.0.0.js", {
      "data": { "store": [ "ccm.store", { "name": "dms-components-ratings", "url": "https://ccm2.inf.h-brs.de" } ] },
      "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/component_manager/resources/resources.js", "user" ] ]
    } ],
    "rating_result": [ "ccm.component", "https://ccmjs.github.io/tkless-components/star_rating_result/versions/ccm.star_rating_result-5.0.0.js", {
      "data": { "store": [ "ccm.store", { "name": "dms-components-ratings", "url": "https://ccm2.inf.h-brs.de" } ] },
      "detailed": true,
      "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/component_manager/resources/resources.js", "user" ] ]
    } ],
    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js", { "app": "component_manager" } ],
    "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.0.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/component_manager/resources/resources.js", "user" ] ]
  },

  /** configuration for multilingualism */
  "lang": {
    "translations": {
      "de": {
        "abstract": "Kurzbeschreibung",
        "back": "← Zurück zur Komponente",
        "cancel": "Abbrechen",
        "create_similar_app": "Ähnliche App erstellen",
        "demos": "Demos",
        "delete": "Komponente löschen",
        "description": "Beschreibung",
        "edit": "Bearbeiten",
        "flag": "https://ccmjs.github.io/tkless-components/lang/resources/de.svg",
        "info": "Weitere Informationen",
        "published": "Veröffentlicht von",
        "rating": "Eigene Bewertung",
        "result": "Gesamtbewertung",
        "version": "Version"
      },
      "en": {
        "abstract": "Abstract",
        "back": "← Back to Component",
        "cancel": "Cancel",
        "create_similar_app": "Create Similar App",
        "demos": "Demos",
        "delete": "Delete Component",
        "description": "Description",
        "edit": "Edit",
        "flag": "https://ccmjs.github.io/tkless-components/lang/resources/en.svg",
        "published": "Published by",
        "info": "Additional Informations",
        "rating": "Your Rating",
        "result": "Rating Results",
        "version": "Version"
      }
    },
    "active": "en"
  },

  /** configuration for demo and builder menu */
  "menu_app": {
    "css": [ "ccm.load",
      "https://ccmjs.github.io/akless-components/component_manager/resources/css/menu_app.css",
      "https://ccmjs.github.io/akless-components/libs/bootstrap-4/css/bootstrap.min.css"
    ],
    "html": [ "ccm.get", "https://ccmjs.github.io/akless-components/component_manager/resources/resources.js", "menu_app_html" ],
    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-2.0.5.js" ],
    "selected": 1
  },

  /** HTML templates for demo and builder menu */
  "menu_app_html": {
    "main": {
      "id": "main",
      "inner": {
        "id": "entries",
        "class": "list-group"
      }
    },
    "entry": {
      "tag": "a",
      "id": "entry-%id%",
      "data-id": "%id%",
      "class": "entry list-group-item list-group-item-action",
      "onclick": "%click%",
      "inner": {
        "class": "title"
      }
    }
  },

  /** configuration for section menu */
  "menu_top": {
    "css": [ "ccm.load",
      "https://ccmjs.github.io/akless-components/menu/resources/top_tabs.css",
      "https://ccmjs.github.io/akless-components/libs/bootstrap-4/css/bootstrap.min.css"
    ],
    "data": { "entries": [
      { "id": "overview", "title": "overview" },
      { "id": "reviews",  "title": "reviews"  },
      { "id": "creation", "title": "creation" }
    ] },
    "html": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/top_tabs.html" ],
    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", {
      "translations": {
        "de": {
          "flag": "https://ccmjs.github.io/tkless-components/lang/resources/de.svg",
          "overview": "Überblick",
          "reviews": "Bewertungen",
          "apps": "Apps",
          "creation": "App-Erstellung"
        },
        "en": {
          "flag": "https://ccmjs.github.io/tkless-components/lang/resources/en.svg",
          "overview": "Overview",
          "reviews": "Reviews",
          "apps": "Apps",
          "creation": "App Creation"
        }
      }
    } ],
    "selected": "overview"
  },

  /** configuration for user authentication */
  "user": {
    "hash": [ "ccm.load", { "url": "https://ccmjs.github.io/akless-components/modules/md5.mjs", "type": "module" } ],
    "realm": "cloud",
    "store": "dms-user",
    "url": "https://ccm2.inf.h-brs.de"
  }

};
