/**
 * @overview data-based resources of ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2019-2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {
  "live": {},

  /** test configuration (relative paths) */
  "local": {
    "css": [ "ccm.load",
      "../user/resources/default.css"
    ],
//  "map": user => user.user === 'john' ? 'Teacher' : 'Student',
    "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
    "html": [ "ccm.get", "../user/resources/resources.js", "html" ],
//  "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ]
  },

  /** HTML templates */
  "html": {
    "logged_in": {
      "id": "logged_in",
      "inner": [
        {
          "id": "avatar",
          "style": "background-image: url('%avatar%');"
        },
        {
          "id": "username",
          "inner": "%user%"
        },
        {
          "id": "logout",
          "onclick": "%click%",
          "inner": [
            {
              "tag": "img",
              "src": "https://modularcms.github.io/modularcms-components/user/resources/img/logout.svg"
            }
          ]
        }
      ]
    },
    "logged_out": {
      "id": "logged_out",
      "class": "well well-sm",
      "inner": {
        "id": "button",
        "class": "btn btn-default btn-xs",
        "inner": [
          {
            "tag": "span",
            "class": "glyphicon glyphicon-log-in"
          },
          "Login"
        ],
        "onclick": "%click%"
      }
    },
    "login": {
      "id": "login-form",
      "class": "container",
      "inner": [
        {
          "id": "loginbox",
          "class": "mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2",
          "inner": {
            "class": "panel panel-info",
            "inner": [
              {
                "tag": "img",
                "id": "login-logo",
                "src": "%logo%"
              },
              {
                "tag": "h1",
                "class": "panel-heading",
                "inner": "%title%"
              },
              {
                "id": "login-alert",
                "inner": "%wrongLoginText%"
              },
              {
                "class": "panel-body",
                "inner": [
                  {
                    "tag": "form",
                    "id": "loginform",
                    "class": "form-horizontal",
                    "role": "form",
                    "onsubmit": "%login%",
                    "inner": [
                      {
                        "tag": "input",
                        "id": "login-username",
                        "type": "text",
                        "class": "form-control",
                        "name": "user",
                        "placeholder": "Username",
                        "required": true
                      },
                      {
                        "tag": "input",
                        "id": "login-password",
                        "type": "password",
                        "class": "form-control",
                        "name": "token",
                        "placeholder": "Password",
                        "required": true
                      },
                      {
                        "class": "form-group",
                        "inner": {
                          "class": "col-sm-12 controls",
                          "inner": [
                            {
                              "tag": "input",
                              "type": "submit",
                              "id": "btn-login",
                              "class": "btn btn-success",
                              "value": "Login"
                            }
                          ]
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }

};