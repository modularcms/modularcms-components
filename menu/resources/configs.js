/**
 * @overview configurations of ccm component for rendering a menu
 * @author André Kless <andre.kless@web.de> 2018-2019
 * @license The MIT License (MIT)
 */

ccm.files[ 'configs.js' ] = {

  "local": {
    "css.1": "../menu/resources/default.css",
    "html.1": "../menu/resources/templates.html",
    "data": {
      "store": [ "ccm.store", "../menu/resources/datasets.js" ],
      "key": "demo"
    },
    "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ]
  },

  "proxy": {
    "css.1": "../menu/resources/tabs.css",
    "html.1": "../menu/resources/templates.html",
    "data": {
      "entries": [
        {
          "title": "Menu Item A",
          "content": [ "ccm.proxy", "https://ccmjs.github.io/akless-components/blank/ccm.blank.js" ]
        },
        {
          "title": "Menu Item B",
          "content": [ "ccm.proxy", "https://ccmjs.github.io/akless-components/blank_blank/ccm.blank_blank.js" ]
        },
        {
          "title": "Menu Item C",
          "content": [ "ccm.proxy", "https://ccmjs.github.io/akless-components/multi_blank/ccm.multi_blank.js" ]
        }
      ]
    }
  },

  "demo": {
    "key": "demo",
    "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/tabs.css" ],
    "data": {
      "store": [ "ccm.store", "https://ccmjs.github.io/akless-components/menu/resources/datasets.js" ],
      "key": "demo"
    }
  },

  "text": {
    "key": "text",
    "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/text.css" ],
    "data": {
      "store": [ "ccm.store", "https://ccmjs.github.io/akless-components/menu/resources/datasets.js" ],
      "key": "actions"
    },
    "selected": 1,
    "trigger_selected": true
  },

  "icon": {
    "key": "icon",
    "css": [ "ccm.load",
      { "context": "head", "url": "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" },
      "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css",
      "https://ccmjs.github.io/akless-components/menu/resources/icon.css"
    ],
    "data": {
      "store": [ "ccm.store", "https://ccmjs.github.io/akless-components/menu/resources/datasets.js" ],
      "key": "icon"
    }
  },

  "bootstrap": {
    "key": "bootstrap",
    "html": {
      "main": {
        "id": "main",
        "inner": [
          {
            "class": "text-center",
            "inner": {
              "id": "entries",
              "class": "btn-group"
            }
          },
          { "id": "content" }
        ]
      },
      "entry": {
        "class": "entry btn btn-default",
        "style": "z-index: unset",
        "onclick": "%click%",
        "route": "%route%",
        "inner": {
          "class": "title"
        }
      }
    },
    "css": [ "ccm.load",
      "https://ccmjs.github.io/tkless-components/libs/bootstrap/css/bootstrap.css",
      { "context": "head", "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap/css/font-face.css" }
    ],
    "data": {
      "store": [ "ccm.store", "https://ccmjs.github.io/akless-components/menu/resources/datasets.js" ],
      "key": "demo"
    }
  },

  "tabs": {
    "main": {
      "id": "main",
      "inner": [
        {
          "tag": "ul",
          "id": "entries",
          "class": "nav nav-tabs"
        },
        {
          "id": "content"
        }
      ]
    },
    "entry": {
      "tag": "li",
      "id": "%id%",
      "class": "entry nav-item",
      "onclick": "%click%",
      "inner": {
        "tag": "a",
        "class": "title nav-link"
      }
    }
  },

  "list_group": {
    "key": "list_group",
    "html": {
      "main": {
        "id": "main",
        "inner": [
          {
            "inner": {
              "class": "list-group",
              "id": "entries"
            }
          },
          {
            "id": "content",
            "style": "padding: 0 16px 0 16px"
          }
        ]
      },
      "entry": {
        "tag": "a",
        "class": "entry list-group-item",
        "onclick": "%click%",
        "style": "cursor: pointer; overflow: hidden; z-index: unset",
        "inner": {
          "class": "title"
        }
      }
    },
    "css": [ "ccm.load",
      "https://ccmjs.github.io/tkless-components/libs/bootstrap/css/bootstrap.css",
      { "context": "head", "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap/css/font-face.css" }
    ],
    "data": {
      "entries": [
        {
          "title": "Menu Item A",
          "content": "Content of menu entry A",
          "actions": [ [ "console.log", "Performed action of menu entry A." ] ]
        },
        {
          "title": "Menu Item B",
          "content": "Content of menu entry B",
          "actions": [ [ "console.log", "Performed action of menu entry B." ] ]
        },
        {
          "title": "Menu Item C",
          "content": "Content of menu entry C",
          "actions": [ [ "console.log", "Performed action of menu entry C." ] ]
        }
      ]
    },
    "selected": 1
  },

  "slide": {
    "css": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/slide.css" ],
    "data": {
      "entries": [
        {
          "title": "section1",
          "content": "<img src='https://www.w3schools.com/howto/img_nature_wide.jpg'>"
        },
        {
          "title": "section2",
          "content": "<img src='https://www.w3schools.com/howto/img_snow_wide.jpg'>"
        },
        {
          "title": "section3",
          "content": "<img src='https://www.w3schools.com/howto/img_lights_wide.jpg'>"
        },
        {
          "title": "section4",
          "content": "<img src='https://www.w3schools.com/howto/img_mountains_wide.jpg'>"
        }
      ]
    },
    "html": [ "ccm.load", "https://ccmjs.github.io/akless-components/menu/resources/slide.html" ],
    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", {
      "translations": {
        "de": {
          "flag": "https://ccmjs.github.io/tkless-components/lang/resources/de.svg",
          "section1": "Sektion A",
          "section2": "Sektion B",
          "section3": "Sektion C",
          "section4": "Sektion D"
        },
        "en": {
          "flag": "https://ccmjs.github.io/tkless-components/lang/resources/en.svg",
          "section1": "Section A",
          "section2": "Section B",
          "section3": "Section C",
          "section4": "Section D"
        }
      }
    } ],
    "selected": 1
  },

  "local_slide": {
    "css.1": "../menu/resources/slide.css",
    "data": {
      "entries": [
        {
          "title": "section1",
          "content": "<img src='https://www.w3schools.com/howto/img_nature_wide.jpg'>"
        },
        {
          "title": "section2",
          "content": "<img src='https://www.w3schools.com/howto/img_snow_wide.jpg'>"
        },
        {
          "title": "section3",
          "content": "<img src='https://www.w3schools.com/howto/img_lights_wide.jpg'>"
        },
        {
          "title": "section4",
          "content": "<img src='https://www.w3schools.com/howto/img_mountains_wide.jpg'>"
        }
      ]
    },
    "html.1": "../menu/resources/slide.html",
    "lang": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/lang/versions/ccm.lang-1.0.0.js", {
      "translations": {
        "de": {
          "flag": "https://ccmjs.github.io/tkless-components/lang/resources/de.svg",
          "section1": "Sektion A",
          "section2": "Sektion B",
          "section3": "Sektion C",
          "section4": "Sektion D"
        },
        "en": {
          "flag": "https://ccmjs.github.io/tkless-components/lang/resources/en.svg",
          "section1": "Section A",
          "section2": "Section B",
          "section3": "Section C",
          "section4": "Section D"
        }
      }
    } ],
    "selected": 1
  }

};