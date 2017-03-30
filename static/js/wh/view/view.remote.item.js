/**
 * View for a parameter that's linked to a remote MIDI controller.
 * The items are grouped by processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteItemView(specs, my) {
        var that,
            param = specs.param,
            parentEl = specs.parentEl,
            unregisterCallback = specs.unregisterCallback,
            el,
            
            initialize = function() {
                // create the DOM element.
                let template = document.querySelector('#template-remote-item');
                let clone = template.content.cloneNode(true);
                el = clone.firstElementChild;
                el.querySelector('.remote__item-label').innerHTML = param.getProperty('label');
                el.querySelector('.remote__item-channel').innerHTML = param.getRemoteProperty('channel');
                el.querySelector('.remote__item-cc').innerHTML = param.getRemoteProperty('controller');
                parentEl.appendChild(el);
                
                el.querySelector('.remote__item-remove').addEventListener('click', onUnregisterClick);
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                el.querySelector('.remote__item-remove').removeEventListener('click', onUnregisterClick);
                parentEl.removeChild(el);
                param = null;
                parentEl = null;
            },
            
            /**
             * Check if this view is for a certain parameter.
             * @param  {Object} proc Parameter object.
             * @return {Boolean} True if this view has the parameter.
             */
            hasParameter = function(parameter) {
                return parameter === param;
            },
            
            /**
             * Unassign button click handler.
             * @param  {Object} e Click event object.
             */
            onUnregisterClick = function(e) {
                unregisterCallback(param);
            };
            
            that = specs.that || {};
            
            initialize();
            
            that.terminate = terminate;
            that.hasParameter = hasParameter;
            return that;
        }

        ns.createRemoteItemView = createRemoteItemView;

    })(WH);
            
