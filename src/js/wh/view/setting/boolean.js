import createBaseSettingView from './base';

/**
 * Processor setting view for a Boolean type parameter,
 * which has a checkbox input.
 */
export default function createBooleanSettingView(specs, my) {
    var that,
        checkEl,
        
        init = function() {
            let id = getTemporaryInputAndLabelId();
            
            checkEl = my.el.querySelector('.setting__check');
            checkEl.value = my.param.default;
            checkEl.setAttribute('id', id);
            checkEl.addEventListener('change', onChange);
            
            let labelEl = my.el.querySelector('.toggle__label');
            labelEl.setAttribute('for', id);
            
            // my.param.addChangedCallback(changedCallback);
        },
        
        /**
         * A quick ID to tie label to input elements.
         * @return {Number} Unique ID.
         */
        getTemporaryInputAndLabelId = function() {
            return 'id' + Math.random() + performance.now();
        },
        
        onChange = function(e) {
            my.param.setValue(e.target.checked);
        },
        
        changedCallback = function(parameter, oldValue, newValue) {
            checkEl.checked = newValue;
        };
    
    my = my || {};
    
    that = createBaseSettingView(specs, my);
    
    init();
    
    return that;
}