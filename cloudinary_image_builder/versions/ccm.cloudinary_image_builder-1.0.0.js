/**
 * @overview ccm component for building a cloudinary image
 * @author Felix Bröhl <broehl@everoo.io> 2018-2020 (originally was forked json_builder from André Kless)
 * @license The MIT License (MIT)
 * @version 1.0.0
 */

( () => {

    const component = {

        name: 'cloudinary_image_builder',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        config: {
            "css": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cloudinary_image_builder/resources/default.css" ],
            "data": {},
            "directly": true,
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-4.1.1.mjs" ],
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/cloudinary_image_builder/resources/templates.html" ],
            "js": [ "ccm.load", {"context": "head", "url": "https://widget.cloudinary.com/v2.0/global/all.js"} ]
        },

        Instance: function () {

            let $;

            this.ready = async () => {
                // set shortcut to help functions
                $ = Object.assign( {}, this.ccm.helper, this.helper );

                // logging of 'ready' event
                this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

            };

            this.start = async () => {
                $.setContent(this.element, $.html(this.html, {}));
                if ( typeof this.data != "string" ) this.data = this.parent.data.imageSrc;

                // Create cloudinary widget
                const cloudinaryWidget = cloudinary.createUploadWidget(
                    {
                        cloudName: 'dyhjqgkca',
                        uploadPreset: 'y6tm2ylf',
                        sources: ['local'],
                        googleApiKey: 'AIrFcR8hKiRo',
                        multiple: false,
                        resourceType: 'image',
                        palette: {
                            windowBorder: '#000000'
                        }
                    },
                    async (error, result) => {
                        if (!error && result && result.event === "success") {
                            const imgData = result.info;
                            this.data = imgData.secure_url.replace('/image/upload/', '/image/upload/q_auto,w_auto,dpr_auto,c_scale/c_limit,w_2048/');
                            this.logger && this.logger.log( 'change', this.getValue() );
                            this.onchange && await this.onchange( { instance: this } );
                        }
                    }
                );
                this.element.querySelector('#open').addEventListener('click', () => {
                    cloudinaryWidget.open();
                });
            };

            this.isValid = () => true;

            this.getValue = () => this.data;

        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();