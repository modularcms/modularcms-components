/**
 * @overview datasets of ccm component for rendering a menu
 * @author André Kless <andre.kless@web.de> 2018
 * @license The MIT License (MIT)
 */

ccm.files[ 'datasets.js' ] = {

  "demo": {
    "key": "demo",
    "entries": [
      {
        "title": "Menu Item A",
        "content": "Content of menu entry A"
      },
      {
        "title": "Menu Item B",
        "content": "Content of menu entry B"
      },
      {
        "title": "Menu Item C",
        "content": "Content of menu entry C"
      }
    ]
  },

  "icon": {
    "key": "icon",
    "entries": [
      {
        "title": "<div><div class=\"fa fa-home fa-fw fa-3x\"></div><div>Menu Item A</div></div>",
        "content": "Content of menu entry A",
        "actions": [ [ "console.log", "Performed action of menu entry A." ] ]
      },
      {
        "title": "<div><div class=\"fa fa-user fa-fw fa-3x\"></div><div>Menu Item B</div></div>",
        "content": "Content of menu entry B",
        "actions": [ [ "console.log", "Performed action of menu entry B." ] ]
      },
      {
        "title": "<div><div class=\"fa fa-dashboard fa-fw fa-3x\"></div><div>Menu Item C</div></div>",
        "content": "Content of menu entry C",
        "actions": [ [ "console.log", "Performed action of menu entry C." ] ]
      }
    ]
  },

  "actions": {
    "key": "actions",
    "entries": [
      {
        "title": "Menu Item A",
        "actions": [ [ "console.log", "Performed action of menu entry A." ] ]
      },
      {
        "title": "Menu Item B",
        "actions": [ [ "console.log", "Performed action of menu entry B." ] ]
      },
      {
        "title": "Menu Item C",
        "actions": [ [ "console.log", "Performed action of menu entry C." ] ]
      }
    ]
  }

};