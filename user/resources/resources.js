/**
 * @overview data-based resources of ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2019-2020, Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {
  "live": {},

  /** test configuration (relative paths) */
  "local": {
    "css.1": "/modularcms-components/user/resources/default.css",
    "css.2": "/modularcms-components/cms/resources/css/global.css",
    "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
    "html": [ "ccm.get", "/modularcms-components/user/resources/resources.js", "html" ],
    "routing_sensor": [ "ccm.instance", "/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
    "data_controller": [ "ccm.instance", "/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
    "alertLogoutSuccessIconSrc": "/modularcms-components/user/resources/img/logout-success.svg",
    "alertLoginFailureIconSrc": "/modularcms-components/user/resources/img/login-failure.svg",
    "alertCloseIconSrc": "/modularcms-components/user/resources/img/close.svg"
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
    "loginLoader": {
      "id": "loader",
      "class": "lds-ring",
      "inner": [{"inner":[]},{"inner":[]},{"inner":[]},{"inner":[]}]
    },
    "loginAlert": {
      "class": "panel-alert",
      "inner": [
        {
          "class": "panel-alert-icon",
          "tag": "img",
          "src": "%iconsrc%"
        },
        {
          "class": "panel-alert-text",
          "inner": "%text%"
        },
        {
          "class": "panel-alert-close",
          "tag": "img",
          "src": "%closesrc%",
          "onclick": "%close%"
        }
      ]
    },
    "login": {
      "class": "panel-container",
      "inner": [
        {
          "class": "panel-box",
          "inner": [
            {
              "class": "panel-loader-wrapper"
            },
            {
              "class": "panel-logo-wrapper",
              "inner": [
                {
                  "tag": "img",
                  "src": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg"
                }
              ]
            },
            {
              "class": "panel-content",
              "inner": [
                {
                  "class": "panel-alert-wrapper"
                },
                {
                  "tag": "h1",
                  "class": "panel-heading",
                  "inner": "%title%"
                },
                {
                  "class": "panel-body",
                  "inner": [
                    {
                      "tag": "form",
                      "id": "login-form",
                      "role": "form",
                      "onsubmit": "%login%",
                      "inner": [
                        {
                          "tag": "input",
                          "id": "login-username",
                          "type": "text",
                          "name": "user",
                          "placeholder": "Username",
                          "value": "%username%",
                          "required": true
                        },
                        {
                          "tag": "input",
                          "id": "login-password",
                          "type": "password",
                          "name": "token",
                          "placeholder": "Password",
                          "required": true
                        },
                        {
                          "tag": "input",
                          "type": "submit",
                          "value": "Login"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "class": "panel-subline",
              "inner": [
                {
                  "tag": "span",
                  "inner": "No account yet?&nbsp;"
                },
                {
                  "tag": "a",
                  "href": "/register",
                  "inner": "Create an account now"
                }
              ]
            }
          ]
        }
      ]
    },
    "register": {
      "class": "panel-container",
      "inner": [
        {
          "class": "panel-box",
          "inner": [
            {
              "class": "panel-loader-wrapper"
            },
            {
              "class": "panel-logo-wrapper",
              "inner": [
                {
                  "tag": "img",
                  "src": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg"
                }
              ]
            },
            {
              "class": "panel-content",
              "inner": [
                {
                  "class": "panel-alert-wrapper"
                },
                {
                  "tag": "h1",
                  "class": "panel-heading",
                  "inner": "%title%"
                },
                {
                  "class": "panel-body",
                  "inner": [
                    {
                      "tag": "form",
                      "id": "login-form",
                      "role": "form",
                      "onsubmit": "%login%",
                      "inner": [
                        {
                          "tag": "input",
                          "id": "login-username",
                          "type": "text",
                          "name": "user",
                          "placeholder": "Username",
                          "value": "%username%",
                          "required": true
                        },
                        {
                          "tag": "input",
                          "id": "login-email",
                          "type": "email",
                          "name": "email",
                          "placeholder": "Email address",
                          "value": "%email%",
                          "required": true
                        },
                        {
                          "tag": "input",
                          "id": "login-password",
                          "type": "password",
                          "name": "password",
                          "placeholder": "Password",
                          "required": true,
                          "minlength": 8
                        },
                        {
                          "tag": "input",
                          "id": "login-password-repetition",
                          "type": "password",
                          "name": "passwordRepetition",
                          "placeholder": "Password repetition",
                          "required": true,
                          "minlength": 8
                        },
                        {
                          "tag": "input",
                          "type": "submit",
                          "value": "Register"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "class": "panel-subline",
              "inner": [
                {
                  "tag": "span",
                  "inner": "Want to login instead?&nbsp;"
                },
                {
                  "tag": "a",
                  "href": "/login",
                  "inner": "Go to login"
                }
              ]
            }
          ]
        }
      ]
    }
  }

};