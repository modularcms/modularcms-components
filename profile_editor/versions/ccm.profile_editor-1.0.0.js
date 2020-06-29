/**
 * @overview modularcms component that edits the current user profile
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'profile_editor',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "html": [ "ccm.load", "https://modularcms.github.io/modularcms-components/profile_editor/resources/html/profile_editor.html" ],
            "css": [ "ccm.load",
                "https://modularcms.github.io/modularcms-components/profile_editor/resources/css/style.css",
                "https://modularcms.github.io/modularcms-components/cms/resources/css/global.css"
            ],
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "data_controller": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/data_controller/versions/ccm.data_controller-1.0.0.js" ],
            "routing_sensor": [ "ccm.instance", "https://modularcms.github.io/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
            "userAvatarPlaceholder": "https://modularcms.github.io/modularcms-components/cms/resources/img/no-user-image.svg",
            "js": [ "ccm.load", {"context": "head", "url": "https://widget.cloudinary.com/v2.0/global/all.js"} ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

            this.modalCreated = false;

            /**
             * Starts the component
             * @returns {Promise<void>}
             */
            this.start = async () => {
                // Add routing
                await this.routing.registerRoutingCallback(async (detail) => {
                    if (detail.url.indexOf('/profile/edit') == 0) {
                        await this.renderMain();
                    }
                }, this.index);
            };

            /**
             * Renders the edit page for the current user profile
             * @returns {Promise<void>}
             */
            this.renderEdit = async () => {
                const loader = $.html(this.html.loader, {});
                $.append(this.element, loader);
                const username = await this.data_controller.getCurrentWorkingUsername();
                const user = await this.data_controller.getUserFromUsername(username);
                let content = $.html(this.html.editProfile, {
                    username: username,
                    imageUrl: user.image != null ? user.image.thumbnailUrl : this.userAvatarPlaceholder
                });
                $.setContent(this.element, content);

                const userRoleInput = content.querySelector('#user-role');
                const saveButton = content.querySelector('#save-button');
                userRoleInput.value = websiteUser.role;
                saveButton.addEventListener('click', async () => {
                    saveButton.classList.add('button-disabled');
                    saveButton.querySelector('.button-text').innerHTML = 'Saving... (may take a while)';

                    const role = userRoleInput.value;

                    let end = () => {
                        $.remove(loader);
                        saveButton.classList.remove('button-disabled');
                        saveButton.querySelector('.button-text').innerHTML = 'Save';
                    };
                    if (username != await this.data_controller.getCurrentWorkingUsername()) {
                        this.data_controller.addUserToWebsite(websiteKey, username, role).then(() => {
                            end();
                        }).catch(() => {
                            // Error handling
                            end();
                            alert('Failed to add a user with the given username. Please check your entered username.');
                        });
                    } else {
                        end();
                        alert('You can\'t edit your own role.');
                    }
                });
            };
        }

    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();