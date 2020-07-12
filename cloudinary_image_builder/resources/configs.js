/**
 * @overview configurations of ccm component for JSON builder
 * @author André Kless <andre.kless@web.de> 2018, 2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'configs.js' ] = {

    "local": {
        "css.1": "../json_builder/resources/default.css",
        "data": {
            "json": {
                "obj": {
                    "foo": "bar",
                    "numbers": [ 1, 2, 3 ],
                    "i": 5711,
                    "valid": true
                }
            }
        },
        "helper.1": "../modules/helper.mjs",
        "html.1": "../json_builder/resources/templates.html",
        "logger": [ "ccm.instance", "../log/ccm.log.js", [ "ccm.get", "../log/resources/configs.js", "greedy" ] ],
        "oninput": event => console.log( 'input event', event.instance.getValue() ),
        "onchange": event => console.log( 'change event', event.instance.getValue() ),
        "onfinish": { "log": true }
    },

    "live": {
        "key": "live",
        "data": "https://res.cloudinary.com/dyhjqgkca/image/upload/v1594499974/cms/a8xtbzcxelldugfz82i5.svg",
        "onfinish": { "store": false, "alert": "Saved!" }
    }

};